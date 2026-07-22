import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { 
  FiCamera, 
  FiCameraOff, 
  FiCopy, 
  FiMic, 
  FiMicOff, 
  FiMonitor, 
  FiPhoneOff, 
  FiPlus, 
  FiSend, 
  FiVideo 
} from 'react-icons/fi';
import { 
  addMessage, 
  createRoom, 
  joinRoom, 
  leaveRoom, 
  setCode, 
  setMedia, 
  setNotes 
} from '../../redux/slices/videoInterviewSlice.js';
import { interviewRoomService } from '../../services/interviewRoomService.js';

export const VideoInterviewPage = () => {
  const dispatch = useDispatch();
  const state = useSelector((store) => store.videoInterview);
  const { room, mic, camera, screenShare, messages, notes, code, loading } = state;
  
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [panel, setPanel] = useState('chat');
  const [peerStream, setPeerStream] = useState(null);
  const [participantName, setParticipantName] = useState('');
  
  const [searchParams] = useSearchParams();
  const video = useRef();
  const peerVideo = useRef();
  const stream = useRef();
  const socket = useRef();
  const peerConnectionRef = useRef();

  // Read ?room=ID query parameter on load
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setRoomId(roomParam.toUpperCase());
    }
  }, [searchParams]);

  // Handle local video element source assignment
  useEffect(() => {
    if (video.current && stream.current) {
      video.current.srcObject = stream.current;
    }
  }, [camera]);

  // Handle remote video element source assignment
  useEffect(() => {
    if (peerVideo.current && peerStream) {
      peerVideo.current.srcObject = peerStream;
    }
  }, [peerStream]);

  // Cleanup connections on unmount
  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, []);

  const cleanupMedia = () => {
    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop());
      stream.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
    setPeerStream(null);
    setParticipantName('');
  };

  const createPeerConnection = (activeRoomId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local tracks to WebRTC
    if (stream.current) {
      stream.current.getTracks().forEach((track) => {
        pc.addTrack(track, stream.current);
      });
    }

    // Capture incoming ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket.current) {
        socket.current.emit('signal', {
          roomId: activeRoomId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    // Capture remote media stream
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setPeerStream(event.streams[0]);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const enter = async (type) => {
    try {
      const action = type === 'create' 
        ? await dispatch(createRoom({})) 
        : await dispatch(joinRoom({ roomId }));
        
      const active = action.payload?.room;
      if (!active) {
        toast.error('Failed to create or join the room. Please check the ID.');
        return;
      }

      toast.loading('Acquiring camera and microphone...', { id: 'media-acq' });

      // Request camera & microphone
      const localStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      stream.current = localStream;
      toast.success('Media devices ready!', { id: 'media-acq' });
      
      if (video.current) {
        video.current.srcObject = localStream;
      }

      // Initialize socket connection
      socket.current = interviewRoomService.socket();

      socket.current.on('connect', () => {
        socket.current.emit('room:join', { roomId: active.roomId });
      });

      // Peer signaling listener
      socket.current.on('participant:joined', async (data) => {
        toast.success(`${data.name || 'An interviewer'} joined the room!`);
        setParticipantName(data.name || 'Participant');
        
        // Initiator: Create SDP Offer
        const pc = createPeerConnection(active.roomId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socket.current.emit('signal', {
          roomId: active.roomId,
          signal: { type: 'offer', offer }
        });
      });

      socket.current.on('signal', async ({ from, signal }) => {
        let pc = peerConnectionRef.current;
        
        if (signal.type === 'offer') {
          // Responder: Create peer connection and set remote offer description
          if (!pc) {
            pc = createPeerConnection(active.roomId);
          }
          await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          socket.current.emit('signal', {
            roomId: active.roomId,
            signal: { type: 'answer', answer }
          });
        } else if (signal.type === 'answer') {
          // Initiator: Set remote answer description
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
          }
        } else if (signal.type === 'candidate') {
          // Process ICE Candidates
          if (pc && signal.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            } catch (err) {
              console.error('Error adding ICE candidate:', err);
            }
          }
        }
      });

      // Synchronizations & Chat logs
      socket.current.on('chat:message', (item) => {
        dispatch(addMessage(item));
      });

      socket.current.on('notes:update', (value) => {
        dispatch(setNotes(value));
      });

      socket.current.on('code:update', (value) => {
        dispatch(setCode(value.code));
      });

      socket.current.on('participant:left', () => {
        toast.info('Participant left the room.');
        setPeerStream(null);
        setParticipantName('');
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
      });

    } catch (err) {
      toast.error('Could not access your camera or audio. Please grant permissions.', { id: 'media-acq' });
      console.error(err);
    }
  };

  const send = () => {
    if (!message.trim() || !socket.current) return;
    const item = { text: message, createdAt: new Date().toISOString() };
    socket.current.emit('chat:message', { roomId: room.roomId, message: item });
    dispatch(addMessage({ ...item, sender: 'You' }));
    setMessage('');
  };

  const toggleCamera = () => {
    if (!stream.current) return;
    stream.current.getVideoTracks().forEach((track) => {
      track.enabled = !camera;
    });
    dispatch(setMedia({ camera: !camera }));
  };

  const toggleMic = () => {
    if (!stream.current) return;
    stream.current.getAudioTracks().forEach((track) => {
      track.enabled = !mic;
    });
    dispatch(setMedia({ mic: !mic }));
  };

  const share = async () => {
    if (screenShare) {
      // Revert to camera stream
      cleanupScreenShare();
      return;
    }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (video.current) {
        video.current.srcObject = display;
      }
      dispatch(setMedia({ screenShare: true }));
      
      // Update track inside WebRTC peer connection
      if (peerConnectionRef.current) {
        const videoTrack = display.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }

      display.getVideoTracks()[0].onended = () => {
        cleanupScreenShare();
      };
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const cleanupScreenShare = () => {
    if (video.current && stream.current) {
      video.current.srcObject = stream.current;
    }
    if (peerConnectionRef.current && stream.current) {
      const cameraTrack = stream.current.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
      if (sender && cameraTrack) {
        sender.replaceTrack(cameraTrack);
      }
    }
    dispatch(setMedia({ screenShare: false }));
  };

  const handleLeave = () => {
    if (socket.current) {
      socket.current.emit('room:leave', { roomId: room.roomId });
    }
    cleanupMedia();
    dispatch(leaveRoom());
  };

  const copyRoomLink = () => {
    const link = `${location.origin}/video-interview?room=${room.roomId}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success('Invite link copied to clipboard!'));
  };

  if (!room) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 py-12">
        <p className="dash-kicker">HUMAN VIDEO INTERVIEWS</p>
        <h1 className="text-3xl font-bold text-white">Meet, interview, and collaborate.</h1>
        
        <section className="dash-card space-y-4 p-6">
          <button 
            className="finish-interview !bg-violet-600/10 !border-violet-500/20 !text-violet-300 hover:!bg-violet-600/20 w-full py-3" 
            disabled={loading} 
            onClick={() => enter('create')}
          >
            <FiPlus className="inline mr-1" /> Create Interview Room
          </button>
          
          <div className="text-center text-xs text-slate-500 font-bold uppercase tracking-wider">Or</div>
          
          <div className="flex gap-2">
            <input 
              className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-violet-500 outline-none" 
              value={roomId} 
              onChange={(event) => setRoomId(event.target.value.toUpperCase())} 
              placeholder="ENTER ROOM ID (E.G. AB12CD)"
            />
            <button 
              className="finish-interview !bg-violet-600 hover:!bg-violet-700 !text-white !border-0 px-6 font-bold" 
              disabled={loading || !roomId} 
              onClick={() => enter('join')}
            >
              Join Room
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="dash-kicker">LIVE TECHNICAL INTERVIEW</p>
          <h1 className="text-xl font-bold text-white">Room: {room.roomId}</h1>
        </div>
        <div className="flex gap-2">
          <button className="subtle-button" onClick={copyRoomLink}>
            <FiCopy /> Copy Invite Link
          </button>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_.7fr]">
        <section className="space-y-4">
          {/* Videos Grid */}
          <div className="grid gap-3 md:grid-cols-2">
            {/* Local Video */}
            <div className="relative min-h-64 overflow-hidden rounded-xl bg-black border border-white/5">
              <video 
                ref={video} 
                autoPlay 
                muted 
                playsInline 
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2.5 py-1 text-xs text-white">
                You {camera ? '' : '(Camera Off)'}
              </span>
            </div>

            {/* Remote Video / Placeholder */}
            {peerStream ? (
              <div className="relative min-h-64 overflow-hidden rounded-xl bg-black border border-white/5">
                <video 
                  ref={peerVideo} 
                  autoPlay 
                  playsInline 
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2.5 py-1 text-xs text-white">
                  {participantName || 'Interviewer'}
                </span>
              </div>
            ) : (
              <div className="grid min-h-64 place-items-center rounded-xl bg-slate-900/60 border border-dashed border-white/10 text-slate-400">
                <div className="text-center">
                  <FiVideo size={38} className="mx-auto mb-2 text-violet-400" />
                  <span className="text-sm">Waiting for participant to join...</span>
                </div>
              </div>
            )}
          </div>

          {/* Media Toggles Panel */}
          <div className="dash-card flex flex-wrap gap-2 p-3">
            <button 
              onClick={toggleMic}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border ${
                mic 
                  ? 'bg-violet-600/10 border-violet-500/20 text-violet-300' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {mic ? <FiMic /> : <FiMicOff />} {mic ? 'Mute' : 'Unmute'}
            </button>
            
            <button 
              onClick={toggleCamera}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border ${
                camera 
                  ? 'bg-violet-600/10 border-violet-500/20 text-violet-300' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {camera ? <FiCamera /> : <FiCameraOff />} {camera ? 'Camera Off' : 'Camera On'}
            </button>
            
            <button 
              onClick={share}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border ${
                screenShare 
                  ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-300' 
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
            >
              <FiMonitor /> {screenShare ? 'Stop share' : 'Share screen'}
            </button>

            <button 
              className="ml-auto flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-lg"
              onClick={handleLeave}
            >
              <FiPhoneOff /> End & Leave
            </button>
          </div>

          {/* Collaborative Code Editor */}
          <section className="dash-card overflow-hidden">
            <div className="bg-black/40 border-b border-white/5 p-3 flex justify-between items-center">
              <b className="text-xs font-bold text-white tracking-wider">COLLABORATIVE SOLUTION EDITOR</b>
              <span className="text-[10px] bg-violet-500/15 text-violet-300 font-bold px-2 py-0.5 rounded uppercase">Realtime Sync</span>
            </div>
            <Editor 
              height="340px" 
              language="javascript" 
              theme="vs-dark" 
              value={code} 
              onChange={(value) => { 
                dispatch(setCode(value || '')); 
                if (socket.current) {
                  socket.current.emit('code:update', { 
                    roomId: room.roomId, 
                    code: value || '', 
                    language: 'javascript' 
                  }); 
                }
              }} 
              options={{ 
                minimap: { enabled: false }, 
                automaticLayout: true,
                fontSize: 13,
                wordWrap: 'on'
              }}
            />
          </section>
        </section>

        {/* Notepad & Chat Panels */}
        <aside className="dash-card p-4 flex flex-col justify-between">
          <div>
            <div className="mb-4 flex gap-2 border-b border-white/5 pb-2">
              <button 
                onClick={() => setPanel('chat')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  panel === 'chat' 
                    ? 'bg-violet-600/15 text-violet-300' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Chat Room
              </button>
              <button 
                onClick={() => setPanel('notes')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  panel === 'notes' 
                    ? 'bg-violet-600/15 text-violet-300' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Shared Notepad
              </button>
            </div>

            {panel === 'chat' ? (
              <div className="h-96 space-y-3 overflow-y-auto pr-1">
                {messages.map((item, index) => (
                  <p key={index} className="rounded-xl bg-white/5 border border-white/5 p-3 text-xs text-slate-200">
                    <b className="text-violet-300 block mb-1">{item.sender || 'Participant'}:</b> 
                    {item.text}
                  </p>
                ))}
              </div>
            ) : (
              <textarea 
                value={notes} 
                onChange={(event) => { 
                  dispatch(setNotes(event.target.value)); 
                  if (socket.current) {
                    socket.current.emit('notes:update', { 
                      roomId: room.roomId, 
                      notes: event.target.value 
                    }); 
                  }
                }} 
                className="h-96 w-full rounded-xl bg-black/25 border border-white/5 p-3 text-xs font-sans text-slate-100 outline-none focus:border-violet-500" 
                placeholder="Collaborative interview notes autosave here in real-time..."
              />
            )}
          </div>

          {panel === 'chat' && (
            <div className="mt-3 flex gap-2 border-t border-white/5 pt-3">
              <input 
                value={message} 
                onChange={(event) => setMessage(event.target.value)} 
                onKeyDown={(event) => event.key === 'Enter' && send()} 
                className="min-w-0 flex-1 rounded-xl bg-black/25 border border-white/5 p-2 text-xs text-white outline-none focus:border-violet-500" 
                placeholder="Type a message or code snippet..."
              />
              <button 
                onClick={send}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold p-2.5 rounded-xl transition"
              >
                <FiSend />
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
