import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchConsultationSession } from '../api/consultation';
import { useAuth } from '../features/auth/hooks/useAuth';
import {
  Camera,
  CameraOff,
  LoaderCircle,
  Mic,
  MicOff,
  PhoneOff
} from 'lucide-react';

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

  const [joiningCall, setJoiningCall] = useState(true);
  const [callError, setCallError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [remoteStatus, setRemoteStatus] = useState('Waiting for the other participant to join.');

  const remoteLabel = useMemo(
    () => buildRemoteLabel(role, appointment),
    [appointment, role]
  );

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

      const candidate = (streamList || []).find(
        (stream) => stream?.streamID && stream.streamID !== publishedStreamIdRef.current
      );

      if (updateType === 'ADD' && candidate) {
        try {
          if (playingStreamIdRef.current && playingStreamIdRef.current !== candidate.streamID) {
            engineRef.current?.stopPlayingStream(playingStreamIdRef.current);
          }

          const remoteStream = await engineRef.current.startPlayingStream(candidate.streamID);
          if (disposed) {
            return;
          }

          remoteStreamRef.current = remoteStream;
          playingStreamIdRef.current = candidate.streamID;
          // Keep remote video muted to avoid autoplay blocks that can leave video blank.
          bindMediaStream(remoteVideoRef.current, remoteStream, true);
          setRemoteConnected(true);
          setRemoteStatus(`${remoteLabel} is in the room.`);
        } catch (playError) {
          console.error('Could not play remote stream', playError);
          setRemoteStatus('Connected to the room, but the remote video could not start.');
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

        const ZegoExpressEngine = typeof zegoEngineGlobal === 'function'
          ? zegoEngineGlobal
          : zegoEngineGlobal.ZegoExpressEngine;
        const zg = new ZegoExpressEngine(session.appId, session.serverUrl, { scenario: 0 });
        engineRef.current = zg;

        zg.on('roomStateUpdate', (currentRoomId, state, errorCode) => {
          if (currentRoomId !== activeRoomName || disposed) {
            return;
          }

          const connected = state === 'CONNECTED';
          setIsConnected(connected);

          if (!connected && errorCode) {
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

        await zg.loginRoom(
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

        setRemoteStatus('Connected. Waiting for remote participant stream...');

        if (disposed) {
          return;
        }

        const localStream = await zg.createStream();
        if (disposed) {
          return;
        }

        localStreamRef.current = localStream;
        bindMediaStream(localVideoRef.current, localStream, true);

        const publishedStreamId = `consult-${appointmentId}-${participant.userId}`;
        publishedStreamIdRef.current = publishedStreamId;
        const publishStarted = zg.startPublishingStream(publishedStreamId, localStream);
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
        setCallError(
            roomError instanceof Error
              ? roomError.message
              : 'Could not start the custom ZEGOCLOUD consultation room.'
          );
        }
      }
    };

    void startCall();

    return () => {
      disposed = true;
      cleanupMedia();
    };
  }, [appointmentId, isAuthReady, participant.userId, participant.userName, remoteLabel, roomName, user]);

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

  const shellTone =
    role === 'doctor'
      ? 'bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.24),_transparent_32%),linear-gradient(180deg,#0f172a_0%,#020617_100%)] text-white'
      : 'bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.14),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#f4f8f8_100%)] text-stone-900';
  const frameTone = role === 'doctor'
    ? 'border-white/10 bg-[#191d31]'
    : 'border-stone-200 bg-[#202437]';
  const heroSubTextTone = role === 'doctor' ? 'text-stone-300' : 'text-stone-500';
  const frameSubTextTone = 'text-stone-300';
  const pillTone = role === 'doctor'
    ? 'bg-white/10 text-white'
    : 'bg-stone-900 text-white';
  const controlTone = role === 'doctor'
    ? 'bg-white/10 text-white hover:bg-white/15'
    : 'bg-white/12 text-white hover:bg-white/20';
  const errorTone = role === 'doctor'
    ? 'border-rose-300/40 bg-rose-500/15 text-rose-100'
    : 'border-rose-200 bg-rose-50 text-rose-700';

  return (
    <section className={`overflow-hidden rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.12)] ${role === 'doctor' ? 'bg-stone-950' : 'bg-white'}`}>
      <div className={`p-6 lg:p-8 ${shellTone}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.24em] ${role === 'doctor' ? 'text-teal-300' : 'text-teal-700'}`}>
              {role === 'doctor' ? 'Live Consultation' : 'Video Consultation'}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
              {role === 'doctor' ? appointment?.patientName || 'Patient' : remoteLabel}
            </h2>
            <p className={`mt-2 text-sm ${heroSubTextTone}`}>
              {role === 'doctor'
                ? 'Review symptoms, guide the patient, and capture clinical notes without leaving the session.'
                : 'Join your doctor in a focused one-on-one consultation room built directly into the app.'}
            </p>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${pillTone}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {isConnected ? 'Connected' : 'Connecting'}
          </span>
        </div>

        <div className={`mt-6 rounded-[1.8rem] border p-4 ${frameTone}`}>
          <div className="relative min-h-[520px] overflow-hidden rounded-[1.45rem] bg-[#2b2f40]">
            <div className="absolute inset-0">
              {remoteConnected ? (
                <video
                  ref={remoteVideoRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_55%)]">
                  <div className="text-center">
                    <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full text-5xl ${role === 'doctor' ? 'bg-white/10 text-emerald-300' : 'bg-white/10 text-emerald-400'}`}>
                      {(remoteLabel || 'R').charAt(0).toUpperCase()}
                    </div>
                    <p className={`mt-5 text-base font-semibold ${frameSubTextTone}`}>
                      {remoteStatus}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute bottom-6 right-6 z-10 h-56 w-80 overflow-hidden rounded-[1.35rem] border border-white/15 bg-black shadow-2xl">
              <video
                ref={localVideoRef}
                className={`h-full w-full object-cover ${cameraEnabled ? '' : 'hidden'}`}
                autoPlay
                playsInline
                muted
              />
              {!cameraEnabled ? (
                <div className="flex h-full items-center justify-center bg-black text-stone-400">
                  <CameraOff size={34} />
                </div>
              ) : null}
              <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
                {participant.userName} (You)
              </div>
            </div>

            {joiningCall ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45">
                <div className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur">
                  <LoaderCircle size={18} className="animate-spin" />
                  Preparing your call...
                </div>
              </div>
            ) : null}

            {callError ? (
              <div className={`absolute inset-x-6 top-6 z-20 rounded-2xl border px-4 py-3 text-sm font-semibold backdrop-blur ${errorTone}`}>
                {callError}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className={`text-sm ${heroSubTextTone}`}>
              {role === 'doctor' ? 'Doctor side' : 'Patient side'} active in room {activeRoomNameRef.current || roomName}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl transition ${micEnabled ? controlTone : 'bg-amber-500 text-white hover:bg-amber-600'}`}
              >
                {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                type="button"
                onClick={toggleCamera}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl transition ${cameraEnabled ? controlTone : 'bg-amber-500 text-white hover:bg-amber-600'}`}
              >
                {cameraEnabled ? <Camera size={18} /> : <CameraOff size={18} />}
              </button>
              <button
                type="button"
                onClick={onLeave}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-rose-600"
              >
                <PhoneOff size={16} />
                Leave Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
