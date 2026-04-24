import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchConsultationSession } from '../api/consultation';
import { useAuth } from '../features/auth/hooks/useAuth';
import { addRefundNotification } from './NotificationBell';
import {
  AlertTriangle,
  Camera,
  CameraOff,
  LoaderCircle,
  Mic,
  MicOff,
  PhoneOff
} from 'lucide-react';

const DOCTOR_NO_SHOW_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

async function loadZegoExpressEngine() {
  const engineModule = await import('zego-express-engine-webrtc');

  return (
    engineModule?.default ||
    engineModule?.ZegoExpressEngine ||
    engineModule
  );
}

function describeZegoErrorCode(errorCode) {
  if (!errorCode) {
    return '';
  }

  const knownCodes = {
    1002001: 'Network unavailable',
    1002002: 'Network interrupted',
    1002034: 'Token expired or invalid',
    1102018: 'No microphone or camera permission',
    1103024: 'Publishing stream failed',
    1103049: 'Playing stream failed'
  };

  return knownCodes[errorCode] || '';
}

function bindMediaStream(videoElement, mediaStream, muted = false) {
  if (!videoElement) {
    return;
  }

  videoElement.srcObject = mediaStream || null;
  videoElement.muted = muted;
  videoElement.autoplay = true;
  videoElement.playsInline = true;

  if (mediaStream) {
    void videoElement.play().catch(() => {});
  }
}

function toNativeMediaStream(streamLike) {
  if (!streamLike) {
    return null;
  }

  if (typeof streamLike.getTracks === 'function') {
    return streamLike;
  }

  if (streamLike.mediaStream && typeof streamLike.mediaStream.getTracks === 'function') {
    return streamLike.mediaStream;
  }

  if (streamLike.stream && typeof streamLike.stream.getTracks === 'function') {
    return streamLike.stream;
  }

  return null;
}

function buildRemoteLabel(role, appointment) {
  if (role === 'doctor') {
    return appointment?.patientName || 'Patient';
  }

  return appointment?.doctorName || `Doctor ${appointment?.doctorId || ''}`.trim();
}

export default function ConsultationCallPanel({
  role,
  appointmentId,
  appointment,
  roomName,
  participant,
  onLeave
}) {
  const { isAuthReady, user } = useAuth();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const engineRef = useRef(null);
  const publishedStreamIdRef = useRef('');
  const playingStreamIdRef = useRef('');
  const activeRoomNameRef = useRef(roomName);
  const sessionUserIdRef = useRef('');

  const [joiningCall, setJoiningCall] = useState(true);
  const [callError, setCallError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [remoteStatus, setRemoteStatus] = useState('Waiting for the other participant to join.');
  const [doctorNoShow, setDoctorNoShow] = useState(false);
  const [noShowCountdown, setNoShowCountdown] = useState(-1);
  const doctorNoShowFiredRef = useRef(false);

  const remoteLabel = useMemo(
    () => buildRemoteLabel(role, appointment),
    [appointment, role]
  );

  // Doctor no-show detection timer (patient side only)
  useEffect(() => {
    // Only applies for the patient role
    if (role !== 'patient') {
      return;
    }

    // If the doctor has joined, clear everything
    if (remoteConnected) {
      setDoctorNoShow(false);
      setNoShowCountdown(-1);
      return;
    }

    // Don't start timer until the patient is actually connected to the room
    if (!isConnected || joiningCall) {
      return;
    }

    // If we already fired the no-show, don't restart the timer
    if (doctorNoShowFiredRef.current) {
      return;
    }

    const startedAt = Date.now();
    setNoShowCountdown(Math.ceil(DOCTOR_NO_SHOW_TIMEOUT_MS / 1000));

    const countdownInterval = window.setInterval(() => {
      const elapsedMs = Date.now() - startedAt;
      const remainingSeconds = Math.max(0, Math.ceil((DOCTOR_NO_SHOW_TIMEOUT_MS - elapsedMs) / 1000));
      setNoShowCountdown(remainingSeconds);

      if (remainingSeconds <= 0) {
        window.clearInterval(countdownInterval);
        doctorNoShowFiredRef.current = true;
        setDoctorNoShow(true);
        setNoShowCountdown(0);

        // Fire the refund notification
        addRefundNotification({
          doctorName: appointment?.doctorName || remoteLabel,
          appointmentId,
          appointmentDate: appointment?.appointmentDate
        });
      }
    }, 1000);

    return () => {
      window.clearInterval(countdownInterval);
    };
  }, [role, isConnected, remoteConnected, joiningCall, appointment, appointmentId, remoteLabel]);

  useEffect(() => {
    let disposed = false;

    const cleanupMedia = () => {
      if (playingStreamIdRef.current && engineRef.current) {
        try {
          engineRef.current.stopPlayingStream(playingStreamIdRef.current);
        } catch {}
      }

      if (publishedStreamIdRef.current && engineRef.current) {
        try {
          engineRef.current.stopPublishingStream(publishedStreamIdRef.current);
        } catch {}
      }

      if (localStreamRef.current && engineRef.current) {
        try {
          engineRef.current.destroyStream(localStreamRef.current);
        } catch {}
      }

      if (engineRef.current) {
        try {
          engineRef.current.logoutRoom(activeRoomNameRef.current || roomName);
        } catch {}
        try {
          engineRef.current.destroyEngine();
        } catch {}
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };

    const handleRemoteStreamUpdate = async (roomID, updateType, streamList) => {
      if (disposed || roomID !== activeRoomNameRef.current) {
        return;
      }

      const candidates = (streamList || []).filter((stream) => {
        if (!stream?.streamID) {
          return false;
        }

        if (stream.streamID === publishedStreamIdRef.current) {
          return false;
        }

        if (stream?.user?.userID && stream.user.userID === sessionUserIdRef.current) {
          return false;
        }

        return true;
      });

      if (updateType === 'ADD' && candidates.length > 0) {
        let played = false;

        for (const candidate of candidates) {
          try {
            if (playingStreamIdRef.current && playingStreamIdRef.current !== candidate.streamID) {
              engineRef.current?.stopPlayingStream(playingStreamIdRef.current);
            }

            const remoteStream = await engineRef.current.startPlayingStream(candidate.streamID, {
              video: true,
              audio: true
            });

            if (disposed) {
              return;
            }

            const playableRemoteStream = toNativeMediaStream(remoteStream);
            remoteStreamRef.current = playableRemoteStream;
            playingStreamIdRef.current = candidate.streamID;
            bindMediaStream(remoteVideoRef.current, playableRemoteStream, false);
            void engineRef.current
              ?.mutePlayStreamAudio(candidate.streamID, false)
              .catch(() => {});
            setRemoteConnected(true);
            setRemoteStatus(`${remoteLabel} is in the room.`);
            played = true;
            break;
          } catch (playError) {
            console.error('Could not play candidate remote stream', candidate?.streamID, playError);
          }
        }

        if (!played) {
          setRemoteStatus('Connected to the room, but no playable remote stream was found yet.');
        }
      }

      if (updateType === 'DELETE') {
        const removedPlayingStream = (streamList || []).some(
          (stream) => stream?.streamID === playingStreamIdRef.current
        );

        if (removedPlayingStream) {
          if (playingStreamIdRef.current && engineRef.current) {
            try {
              engineRef.current.stopPlayingStream(playingStreamIdRef.current);
            } catch {}
          }

          playingStreamIdRef.current = '';
          remoteStreamRef.current = null;
          bindMediaStream(remoteVideoRef.current, null, false);
          setRemoteConnected(false);
          setRemoteStatus('Waiting for the other participant to rejoin.');
        }
      }
    };

    const startCall = async () => {
      if (!isAuthReady) {
        return;
      }

      if (!user) {
        setJoiningCall(false);
        setCallError('You need to be signed in to start the consultation room.');
        return;
      }

      setJoiningCall(true);
      setCallError('');

      try {
        const [session, zegoEngineGlobal] = await Promise.all([
          fetchConsultationSession(appointmentId),
          loadZegoExpressEngine()
        ]);

        if (
          !zegoEngineGlobal ||
          typeof (typeof zegoEngineGlobal === 'function'
            ? zegoEngineGlobal
            : zegoEngineGlobal.ZegoExpressEngine) !== 'function'
        ) {
          console.error('ZEGOCLOUD engine module shape', zegoEngineGlobal);
          throw new Error('ZEGOCLOUD video engine did not load correctly.');
        }

      if (!session?.token || !session?.appId || !session?.serverUrl || !session?.userId) {
          throw new Error('Consultation session is missing ZEGO credentials.');
        }

        const activeRoomName = session.roomName || roomName;
        activeRoomNameRef.current = activeRoomName;
        sessionUserIdRef.current = session.userId;

        const ZegoExpressEngine = typeof zegoEngineGlobal === 'function'
          ? zegoEngineGlobal
          : zegoEngineGlobal.ZegoExpressEngine;
        const zg = new ZegoExpressEngine(session.appId, session.serverUrl, { scenario: 4 });
        engineRef.current = zg;

        zg.on('roomStateUpdate', (currentRoomId, state, errorCode) => {
          if (currentRoomId !== activeRoomName || disposed) {
            return;
          }

          const connected = state === 'CONNECTED';
          setIsConnected(connected);

          if (state === 'DISCONNECTED') {
            if (errorCode) {
              const detail = describeZegoErrorCode(errorCode);
              setCallError(
                detail
                  ? `Room disconnected (${errorCode}: ${detail}).`
                  : `Room disconnected (${errorCode}).`
              );
            } else {
              setCallError('Room disconnected. Please rejoin the consultation.');
            }
          } else if (!connected && errorCode) {
            setCallError(`Room connection failed with code ${errorCode}.`);
          }
        });

        zg.on('roomStreamUpdate', (currentRoomId, updateType, streamList) => {
          void handleRemoteStreamUpdate(currentRoomId, updateType, streamList);
        });

        zg.on('publisherStateUpdate', (result) => {
          if (!result?.streamID || result.streamID !== publishedStreamIdRef.current || disposed) {
            return;
          }

          if (result.state === 'NO_PUBLISH' && result.errorCode) {
            const detail = describeZegoErrorCode(result.errorCode);
            setCallError(
              detail
                ? `Could not publish your video (${result.errorCode}: ${detail}).`
                : `Could not publish your video (${result.errorCode}).`
            );
          }
        });

        zg.on('playerStateUpdate', (result) => {
          if (!result?.streamID || result.streamID !== playingStreamIdRef.current || disposed) {
            return;
          }

          if (result.state === 'NO_PLAY' && result.errorCode) {
            const detail = describeZegoErrorCode(result.errorCode);
            setRemoteStatus(
              detail
                ? `Remote stream failed (${result.errorCode}: ${detail}).`
                : `Remote stream failed (${result.errorCode}).`
            );
          }
        });

        const loginOk = await zg.loginRoom(
          activeRoomName,
          session.token,
          {
            userID: session.userId,
            userName: session.userName || participant.userName
          },
          {
            userUpdate: true
          }
        );

        if (!loginOk) {
          throw new Error('Could not join consultation room. Please verify ZEGO credentials and room access.');
        }

        setRemoteStatus('Connected. Waiting for remote participant stream...');

        if (disposed) {
          return;
        }

        const localStream = await zg.createStream({
          camera: {
            audio: true,
            video: true,
            videoQuality: 2
          }
        });
        if (disposed) {
          return;
        }

        const playableLocalStream = toNativeMediaStream(localStream);
        localStreamRef.current = playableLocalStream;
        bindMediaStream(localVideoRef.current, playableLocalStream, true);

        const publishedStreamId = `consult-${appointmentId}-${session.userId}-${Date.now()}`;
        publishedStreamIdRef.current = publishedStreamId;
        const publishStarted = zg.startPublishingStream(publishedStreamId, playableLocalStream);
        if (publishStarted === false) {
          throw new Error('Could not start publishing local stream.');
        }

        setJoiningCall(false);
        setMicEnabled(true);
        setCameraEnabled(true);
      } catch (roomError) {
        console.error('Custom consultation room failed to start', roomError);
        if (!disposed) {
          setJoiningCall(false);
          let errorMsg = 'Could not start the custom ZEGOCLOUD consultation room.';
          
          if (roomError instanceof Error) {
            errorMsg = roomError.message;
          } else if (roomError && typeof roomError === 'object' && roomError.msg) {
            errorMsg = roomError.msg;
          }

          if (errorMsg.includes('NotReadableError') || errorMsg.includes('device is not readable')) {
            errorMsg = 'Camera or Microhpone is currently blocked. Please make sure no other applications (like Zoom, Teams, or Meet) are using your camera, then refresh the page.';
          }

          setCallError(errorMsg);
        }
      }
    };

    void startCall();

    return () => {
      disposed = true;
      cleanupMedia();
    };
  }, [appointmentId, isAuthReady, participant.userId, participant.userName, remoteLabel, roomName, user]);

  useEffect(() => {
    if (!remoteConnected || !remoteStreamRef.current) {
      return;
    }

    // Re-bind after React mounts/shows the remote video element.
    const raf = requestAnimationFrame(() => {
      bindMediaStream(remoteVideoRef.current, remoteStreamRef.current, false);
    });

    return () => cancelAnimationFrame(raf);
  }, [remoteConnected]);

  const toggleMicrophone = () => {
    if (!engineRef.current || !localStreamRef.current) {
      return;
    }

    const nextMicEnabled = !micEnabled;
    engineRef.current.muteMicrophone(!nextMicEnabled);
    engineRef.current.mutePublishStreamAudio(localStreamRef.current, !nextMicEnabled);
    setMicEnabled(nextMicEnabled);
  };

  const toggleCamera = () => {
    if (!engineRef.current || !localStreamRef.current) {
      return;
    }

    const nextCameraEnabled = !cameraEnabled;
    engineRef.current.mutePublishStreamVideo(localStreamRef.current, !nextCameraEnabled, true);
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = nextCameraEnabled;
    });
    setCameraEnabled(nextCameraEnabled);
  };

  const isDoctor = role === 'doctor';

  const shellTone = isDoctor
    ? 'bg-white text-stone-900'
    : 'bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.14),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#f4f8f8_100%)] text-stone-900';
  
  const frameTone = isDoctor
    ? ''
    : 'border-stone-200 bg-[#202437] rounded-[1.8rem] border p-4 mt-6';

  const heroSubTextTone = isDoctor ? 'text-stone-500' : 'text-stone-500';
  const videoBgTone = 'bg-stone-900';
  
  // Custom controls for Doctor (floating glassmorphic bar)
  const doctorControlTone = 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all shadow-lg';
  const doctorDisconnectTone = 'bg-rose-500/90 text-white hover:bg-rose-500 border border-white/20 backdrop-blur-md transition-all shadow-lg hover:bg-rose-600';
  
  const patientControlTone = 'bg-white/12 text-white hover:bg-white/20';
  const errorTone = isDoctor
    ? 'border-rose-200 bg-rose-50/90 text-rose-700 shadow-sm'
    : 'border-rose-200 bg-rose-50 text-rose-700';

  if (isDoctor) {
    return (
      <section className="overflow-hidden rounded-[2.5rem] bg-white border border-stone-100 shadow-[0_8px_40px_rgba(0,0,0,0.06)] flex flex-col h-full ring-1 ring-stone-900/5">
        
        {/* Header - Editorial Style */}
        <div className="px-6 lg:px-8 mt-6 flex items-center justify-between pb-5 border-b border-stone-100/80">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">
                Live Consultation
              </p>
            </div>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-stone-900">
              {appointment?.patientName || 'Patient'}
            </h2>
          </div>
          
          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
              {isConnected ? 'Session Active' : 'Waiting for connection...'}
            </span>
            <p className="mt-1.5 text-[10px] font-medium text-stone-400 uppercase tracking-widest text-right">
              Room • {activeRoomNameRef.current || roomName}
            </p>
          </div>
        </div>

        {/* Video Area - Immersive layout */}
        <div className="p-5 lg:p-6 flex-1 flex flex-col min-h-0 bg-stone-50/50">
          <div className="relative w-full max-w-[900px] mx-auto h-[550px] overflow-hidden rounded-[2rem] bg-stone-950 shadow-inner group ring-1 ring-stone-900/10">
            {/* Remote Video Stream */}
            <div className="absolute inset-0">
              <video
                ref={remoteVideoRef}
                className={`h-full w-full object-cover transition-opacity duration-700 ${remoteConnected ? 'opacity-100' : 'opacity-0'}`}
                autoPlay
                playsInline
              />
              {!remoteConnected && (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.04),_transparent_60%)]">
                  <div className="text-center transform transition-transform hover:scale-105 duration-500">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-stone-800/60 shadow-2xl backdrop-blur-xl border border-stone-700/50 text-5xl text-stone-300 font-light">
                      {(remoteLabel || 'R').charAt(0).toUpperCase()}
                    </div>
                    <p className="mt-4 text-xs font-medium tracking-wide text-stone-400">
                      {remoteStatus}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Local Video Stream (PIP) */}
            <div className="absolute top-6 right-6 z-10 w-36 h-52 overflow-hidden rounded-2xl border border-white/10 bg-stone-900 shadow-2xl transition-transform hover:scale-[1.02] duration-300 ease-out">
              <video
                ref={localVideoRef}
                className={`h-full w-full object-cover ${cameraEnabled ? '' : 'hidden'}`}
                autoPlay
                playsInline
                muted
              />
              {!cameraEnabled && (
                <div className="flex h-full items-center justify-center bg-stone-900 text-stone-600">
                  <CameraOff size={24} strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3 text-center rounded-xl bg-black/50 py-1.5 text-[10px] font-semibold tracking-wide text-white/90 backdrop-blur-md border border-white/5 truncate px-1">
                {participant.userName} (You)
              </div>
            </div>

            {/* Overlays */}
            {joiningCall && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-6 py-4 text-sm font-semibold text-white/90 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <LoaderCircle size={20} className="animate-spin text-teal-400" />
                  Preparing secure session...
                </div>
              </div>
            )}

            {callError && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 rounded-2xl border border-rose-500/30 bg-rose-500/20 px-6 py-3 text-sm font-medium text-rose-100 backdrop-blur-xl shadow-lg flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                {callError}
              </div>
            )}

            {/* Floating Control Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] transition-all duration-300 ${micEnabled ? doctorControlTone : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/25 shadow-lg'}`}
                title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micEnabled ? <Mic size={16} strokeWidth={2} /> : <MicOff size={16} strokeWidth={2} />}
              </button>
              <button
                type="button"
                onClick={toggleCamera}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] transition-all duration-300 ${cameraEnabled ? doctorControlTone : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/25 shadow-lg'}`}
                title={cameraEnabled ? "Turn off Camera" : "Turn on Camera"}
              >
                {cameraEnabled ? <Camera size={16} strokeWidth={2} /> : <CameraOff size={16} strokeWidth={2} />}
              </button>
              <button
                type="button"
                onClick={onLeave}
                className={`inline-flex h-10 items-center gap-2 rounded-[0.8rem] px-4 font-bold uppercase tracking-wider text-[10px] ${doctorDisconnectTone}`}
              >
                <PhoneOff size={14} strokeWidth={2.5} />
                End Call
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Patient view
  return (
    <section className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] flex flex-col h-full ring-1 ring-stone-900/5">
      <div className={`flex flex-col h-full ${shellTone}`}>
        {/* Header - Editorial Style */}
        <div className="px-6 lg:px-8 mt-6 flex items-center justify-between pb-5 border-b border-stone-100/80">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">
                Video Consultation
              </p>
            </div>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-stone-900">
              {remoteLabel}
            </h2>
          </div>
          
          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
              {isConnected ? 'Session Active' : 'Connecting...'}
            </span>
            <p className="mt-1.5 text-[10px] font-medium text-stone-400 uppercase tracking-widest text-right">
              Room • {activeRoomNameRef.current || roomName}
            </p>
          </div>
        </div>

        {/* Video Area - Immersive layout */}
        <div className="p-5 lg:p-6 flex-1 flex flex-col min-h-0 bg-stone-50/50">
          <div className={`relative w-full max-w-[900px] mx-auto h-[550px] overflow-hidden rounded-[2rem] shadow-inner group ring-1 ring-stone-900/10 ${videoBgTone}`}>
            {/* Remote Video Stream */}
            <div className="absolute inset-0">
              <video
                ref={remoteVideoRef}
                className={`h-full w-full object-cover transition-opacity duration-700 ${remoteConnected ? 'opacity-100' : 'opacity-0'}`}
                autoPlay
                playsInline
              />
              {!remoteConnected && (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.04),_transparent_60%)]">
                  <div className="text-center transform transition-transform hover:scale-105 duration-500">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-stone-800/60 shadow-2xl backdrop-blur-xl border border-stone-700/50 text-5xl text-stone-300 font-light">
                      {(remoteLabel || 'R').charAt(0).toUpperCase()}
                    </div>
                    <p className="mt-4 text-xs font-medium tracking-wide text-stone-400">
                      {remoteStatus}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Local Video Stream (PIP) */}
            <div className="absolute top-6 right-6 z-10 w-36 h-52 overflow-hidden rounded-2xl border border-white/10 bg-stone-900 shadow-2xl transition-transform hover:scale-[1.02] duration-300 ease-out">
              <video
                ref={localVideoRef}
                className={`h-full w-full object-cover ${cameraEnabled ? '' : 'hidden'}`}
                autoPlay
                playsInline
                muted
              />
              {!cameraEnabled && (
                <div className="flex h-full items-center justify-center bg-stone-900 text-stone-600">
                  <CameraOff size={24} strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3 text-center rounded-xl bg-black/50 py-1.5 text-[10px] font-semibold tracking-wide text-white/90 backdrop-blur-md border border-white/5 truncate px-1">
                {participant.userName} (You)
              </div>
            </div>

            {/* Overlays */}
            {joiningCall && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-6 py-4 text-sm font-semibold text-white/90 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <LoaderCircle size={20} className="animate-spin text-teal-400" />
                  Preparing secure session...
                </div>
              </div>
            )}

            {callError && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 rounded-2xl border border-rose-500/30 bg-rose-500/20 px-6 py-3 text-sm font-medium text-rose-100 backdrop-blur-xl shadow-lg flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                {callError}
              </div>
            )}

            {/* Doctor No-Show Countdown */}
            {!remoteConnected && !joiningCall && isConnected && noShowCountdown > 0 && !doctorNoShow && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 rounded-2xl border border-amber-400/30 bg-amber-500/20 px-5 py-2.5 text-[12px] font-semibold text-amber-100 backdrop-blur-xl shadow-lg flex items-center gap-2.5">
                <LoaderCircle size={14} className="animate-spin text-amber-300" />
                Waiting for doctor to join... {Math.floor(noShowCountdown / 60)}:{String(noShowCountdown % 60).padStart(2, '0')}
              </div>
            )}

            {/* Doctor No-Show – Refund Warning */}
            {doctorNoShow && !remoteConnected && (
              <div className="absolute inset-0 z-25 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm">
                <div className="max-w-sm w-full mx-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 shadow-2xl text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-200">
                    <AlertTriangle size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-extrabold text-stone-900 mb-2">Doctor Did Not Join</h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4">
                    Your doctor has not joined the consultation within the expected time. If any payment was deducted, it will be <span className="font-bold text-stone-800">refunded within 2–3 working days</span>.
                  </p>
                  <p className="text-xs text-stone-400 mb-5">A notification has been added to your dashboard.</p>
                  <button
                    type="button"
                    onClick={onLeave}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Floating Control Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] transition-all duration-300 ${micEnabled ? patientControlTone + ' shadow-lg border border-white/20 backdrop-blur-md' : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/25 shadow-lg'}`}
                title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micEnabled ? <Mic size={16} strokeWidth={2} /> : <MicOff size={16} strokeWidth={2} />}
              </button>
              <button
                type="button"
                onClick={toggleCamera}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] transition-all duration-300 ${cameraEnabled ? patientControlTone + ' shadow-lg border border-white/20 backdrop-blur-md' : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/25 shadow-lg'}`}
                title={cameraEnabled ? "Turn off Camera" : "Turn on Camera"}
              >
                {cameraEnabled ? <Camera size={16} strokeWidth={2} /> : <CameraOff size={16} strokeWidth={2} />}
              </button>
              <button
                type="button"
                onClick={onLeave}
                className={`inline-flex h-10 items-center gap-2 rounded-[0.8rem] px-4 font-bold uppercase tracking-wider text-[10px] bg-rose-500/90 text-white hover:bg-rose-500 border border-white/20 backdrop-blur-md shadow-lg`}
              >
                <PhoneOff size={14} strokeWidth={2.5} />
                End Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
