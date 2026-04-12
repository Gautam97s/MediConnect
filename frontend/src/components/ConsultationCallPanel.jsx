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

function getTrackSummary(streamLike) {
  const stream = toNativeMediaStream(streamLike);
  if (!stream) {
    return { audio: 0, video: 0 };
  }

  return {
    audio: stream.getAudioTracks().length,
    video: stream.getVideoTracks().length
  };
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
  const [roomStateLabel, setRoomStateLabel] = useState('INIT');
  const [roomStateErrorCode, setRoomStateErrorCode] = useState(0);
  const [loginStatus, setLoginStatus] = useState('PENDING');
  const [publishState, setPublishState] = useState('IDLE');
  const [publishErrorCode, setPublishErrorCode] = useState(0);
  const [playState, setPlayState] = useState('IDLE');
  const [playErrorCode, setPlayErrorCode] = useState(0);
  const [publishedStreamIdState, setPublishedStreamIdState] = useState('');
  const [playingStreamIdState, setPlayingStreamIdState] = useState('');
  const [localTracksState, setLocalTracksState] = useState({ audio: 0, video: 0 });
  const [remoteTracksState, setRemoteTracksState] = useState({ audio: 0, video: 0 });
  const [remoteVideoStats, setRemoteVideoStats] = useState({
    readyState: 0,
    width: 0,
    height: 0,
    currentTime: '0.00'
  });
  const [sessionDebug, setSessionDebug] = useState({
    appId: '',
    userId: '',
    serverUrl: ''
  });

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
            setPlayState('PLAY_REQUESTING');
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
            setPlayingStreamIdState(candidate.streamID);
            setRemoteTracksState(getTrackSummary(playableRemoteStream));
            // Keep remote video muted to avoid autoplay blocks that can leave video blank.
            bindMediaStream(remoteVideoRef.current, playableRemoteStream, true);
            setRemoteConnected(true);
            if (getTrackSummary(playableRemoteStream).video === 0) {
              setRemoteStatus(`${remoteLabel} joined, but remote stream currently has no video track.`);
            } else {
              setRemoteStatus(`${remoteLabel} is in the room.`);
            }
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
          setPlayingStreamIdState('');
          remoteStreamRef.current = null;
          setRemoteTracksState({ audio: 0, video: 0 });
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
      setLoginStatus('REQUESTING');

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
        setSessionDebug({
          appId: String(session.appId || ''),
          userId: session.userId || '',
          serverUrl: session.serverUrl || ''
        });

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
          setRoomStateLabel(state || 'UNKNOWN');
          setRoomStateErrorCode(errorCode || 0);

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

          setPublishState(result.state || 'UNKNOWN');
          setPublishErrorCode(result.errorCode || 0);

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

          setPlayState(result.state || 'UNKNOWN');
          setPlayErrorCode(result.errorCode || 0);

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
          setLoginStatus('FAILED');
          throw new Error('Could not join consultation room. Please verify ZEGO credentials and room access.');
        }

        setLoginStatus('SUCCESS');

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
        setLocalTracksState(getTrackSummary(playableLocalStream));
        bindMediaStream(localVideoRef.current, playableLocalStream, true);

        const publishedStreamId = `consult-${appointmentId}-${session.userId}-${Date.now()}`;
        publishedStreamIdRef.current = publishedStreamId;
        setPublishedStreamIdState(publishedStreamId);
        const publishStarted = zg.startPublishingStream(publishedStreamId, playableLocalStream);
        if (publishStarted === false) {
          setPublishState('NO_PUBLISH');
          throw new Error('Could not start publishing local stream.');
        }

        setPublishState('PUBLISH_REQUESTING');

        setJoiningCall(false);
        setMicEnabled(true);
        setCameraEnabled(true);
      } catch (roomError) {
        console.error('Custom consultation room failed to start', roomError);
        setLoginStatus('FAILED');
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

  useEffect(() => {
    if (!remoteConnected || !remoteStreamRef.current) {
      return;
    }

    // Re-bind after React mounts/shows the remote video element.
    const raf = requestAnimationFrame(() => {
      bindMediaStream(remoteVideoRef.current, remoteStreamRef.current, true);
    });

    return () => cancelAnimationFrame(raf);
  }, [remoteConnected, playingStreamIdState]);

  useEffect(() => {
    const timer = setInterval(() => {
      const element = remoteVideoRef.current;
      if (!element) {
        return;
      }

      setRemoteVideoStats({
        readyState: element.readyState || 0,
        width: element.videoWidth || 0,
        height: element.videoHeight || 0,
        currentTime: Number.isFinite(element.currentTime) ? element.currentTime.toFixed(2) : '0.00'
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
              <video
                ref={remoteVideoRef}
                className={`h-full w-full object-cover ${remoteConnected ? '' : 'invisible'}`}
                autoPlay
                playsInline
                muted
              />
              {!remoteConnected ? (
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
              ) : null}
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

          <div className="mt-3 grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
            <div className={`rounded-xl border px-3 py-2 ${role === 'doctor' ? 'border-white/10 bg-black/20 text-stone-200' : 'border-stone-200 bg-black/20 text-stone-200'}`}>
              Room: {roomStateLabel} | RoomErr: {roomStateErrorCode || 0} | Login: {loginStatus}
            </div>
            <div className={`rounded-xl border px-3 py-2 ${role === 'doctor' ? 'border-white/10 bg-black/20 text-stone-200' : 'border-stone-200 bg-black/20 text-stone-200'}`}>
              Session user: {sessionDebug.userId || '-'} | App: {sessionDebug.appId || '-'}
            </div>
            <div className={`rounded-xl border px-3 py-2 ${role === 'doctor' ? 'border-white/10 bg-black/20 text-stone-200' : 'border-stone-200 bg-black/20 text-stone-200'}`}>
              Publish: {publishState} | PubErr: {publishErrorCode || 0}
            </div>
            <div className={`rounded-xl border px-3 py-2 ${role === 'doctor' ? 'border-white/10 bg-black/20 text-stone-200' : 'border-stone-200 bg-black/20 text-stone-200'}`}>
              Play: {playState} | PlayErr: {playErrorCode || 0}
            </div>
            <div className={`rounded-xl border px-3 py-2 ${role === 'doctor' ? 'border-white/10 bg-black/20 text-stone-200' : 'border-stone-200 bg-black/20 text-stone-200'}`}>
              Local tracks A/V: {localTracksState.audio}/{localTracksState.video}
            </div>
            <div className={`rounded-xl border px-3 py-2 ${role === 'doctor' ? 'border-white/10 bg-black/20 text-stone-200' : 'border-stone-200 bg-black/20 text-stone-200'}`}>
              Remote tracks A/V: {remoteTracksState.audio}/{remoteTracksState.video}
            </div>
            <div className={`rounded-xl border px-3 py-2 ${role === 'doctor' ? 'border-white/10 bg-black/20 text-stone-200' : 'border-stone-200 bg-black/20 text-stone-200'}`}>
              Remote video rs:{remoteVideoStats.readyState} size:{remoteVideoStats.width}x{remoteVideoStats.height} t:{remoteVideoStats.currentTime}
            </div>
            <div className={`rounded-xl border px-3 py-2 ${role === 'doctor' ? 'border-white/10 bg-black/20 text-stone-200' : 'border-stone-200 bg-black/20 text-stone-200'}`}>
              PubStream: {publishedStreamIdState || '-'}
            </div>
            <div className={`rounded-xl border px-3 py-2 ${role === 'doctor' ? 'border-white/10 bg-black/20 text-stone-200' : 'border-stone-200 bg-black/20 text-stone-200'}`}>
              PlayStream: {playingStreamIdState || '-'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
