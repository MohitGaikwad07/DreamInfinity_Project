import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { 
  FiCamera, 
  FiCameraOff, 
  FiMic, 
  FiMicOff, 
  FiMonitor, 
  FiPlus, 
  FiSend, 
  FiVideo,
  FiX,
  FiMoreHorizontal,
  FiCode,
  FiUsers,
  FiMaximize2,
  FiMinimize2,
  FiClock,
  FiMessageSquare
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
  const user = useSelector((store) => store.auth.user);
  
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [panel, setPanel] = useState('chat'); // 'chat', 'notes', or ''
  const [showEditor, setShowEditor] = useState(false);
  const [peerStream, setPeerStream] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const [searchParams] = useSearchParams();

  const video = useRef();
  const peerVideo = useRef();
  const stream = useRef();
  const socket = useRef();
  const peerConnectionRef = useRef();

  const containerRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Hoisted cleanupMedia function
  function cleanupMedia() {
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
    setElapsedSeconds(0);
  }

  // Active call timer
  useEffect(() => {
    if (!room) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [room]);

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

      socket.current.on('signal', async ({ signal }) => {
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
        toast('The other participant has ended the interview.');
        cleanupMedia();
        dispatch(leaveRoom());
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

  // Helper formatting functions
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const isChatOpen = panel === 'chat' || panel === 'notes';

  return (
    <div ref={containerRef} className={`flex flex-col bg-[#08070e] text-white ${isFullscreen ? 'h-screen w-screen p-4' : 'h-[calc(100vh-90px)]'}`}>
      {/* Redesigned Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 md:px-6 gap-3 border-b border-white/10 bg-[#110f1c] flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="h-3 w-3 rounded-full bg-violet-500 animate-pulse shadow-[0_0_10px_#8b5cf6]" />
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">Video Interview</h1>
          <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs text-gray-400 font-semibold cursor-pointer hover:bg-white/10 transition" onClick={copyRoomLink}>
            ID: {room.roomId}
          </span>
        </div>

        {/* Center Timer */}
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 sm:px-4.5 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white tracking-wider">
          <FiClock className="text-violet-400" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleLeave} 
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] sm:text-xs px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl transition shadow-lg shadow-rose-500/10"
          >
            End Call
          </button>
          <button 
            onClick={handleLeave} 
            className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition"
          >
            <FiX size={18} />
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 overflow-y-auto">
        {/* Left Column (Video Section) */}
        <div className={`${isChatOpen ? 'col-span-12 lg:col-span-9' : 'col-span-12'} flex flex-col gap-4 min-h-0`}>
          {/* Video Box Container */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0c0a12] border border-white/5 shadow-2xl flex items-center justify-center min-h-0">
            {/* Main Remote View */}
            {peerStream ? (
              <video 
                ref={peerVideo} 
                autoPlay 
                playsInline 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center space-y-4 animate-pulse">
                <div className="h-16 w-16 mx-auto rounded-full bg-violet-600/10 border border-violet-500/25 flex items-center justify-center text-violet-400">
                  <FiVideo size={28} />
                </div>
                <div className="text-xs text-gray-500 font-semibold tracking-wider uppercase">
                  Waiting for participant to join...
                </div>
              </div>
            )}

            {/* PIP Local Video (Floats in top right) */}
            <div className="absolute top-4 right-4 w-44 aspect-video rounded-xl overflow-hidden border border-white/20 shadow-2xl z-20 bg-[#161426] flex items-center justify-center">
              <video 
                ref={video} 
                autoPlay 
                muted 
                playsInline 
                className={`h-full w-full object-cover ${camera ? 'block' : 'hidden'}`}
              />
              {!camera && (
                <div className="h-8 w-8 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs">
                  Y
                </div>
              )}
              <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
                You
              </span>
            </div>

            {/* Fullscreen Toggle Button (Floats in top left) */}
            <button 
              onClick={toggleFullscreen}
              className="absolute top-4 left-4 h-9 w-9 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-white flex items-center justify-center transition cursor-pointer z-20"
            >
              {isFullscreen ? <FiMinimize2 size={15} /> : <FiMaximize2 size={15} />}
            </button>

            {/* Bottom Overlay Controls Panel */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#161426]/95 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-6 backdrop-blur shadow-2xl z-30">
              {/* Mic Control */}
              <button 
                onClick={toggleMic}
                className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition cursor-pointer"
              >
                {mic ? (
                  <FiMic size={18} className="text-white bg-white/5 h-10 w-10 p-2.5 rounded-full border border-white/10 hover:bg-white/10 transition" />
                ) : (
                  <FiMicOff size={18} className="text-rose-400 bg-rose-500/10 h-10 w-10 p-2.5 rounded-full border border-rose-500/20" />
                )}
                <span className="text-[10px] font-medium tracking-wide">Mic</span>
              </button>

              {/* Camera Control */}
              <button 
                onClick={toggleCamera}
                className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition cursor-pointer"
              >
                {camera ? (
                  <FiCamera size={18} className="text-white bg-white/5 h-10 w-10 p-2.5 rounded-full border border-white/10 hover:bg-white/10 transition" />
                ) : (
                  <FiCameraOff size={18} className="text-rose-400 bg-rose-500/10 h-10 w-10 p-2.5 rounded-full border border-rose-500/20" />
                )}
                <span className="text-[10px] font-medium tracking-wide">Camera</span>
              </button>

              {/* Screen Control */}
              <button 
                onClick={share}
                className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <FiMonitor 
                  size={18} 
                  className={`h-10 w-10 p-2.5 rounded-full border transition ${
                    screenShare 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                      : 'text-white bg-white/5 border-white/10 hover:bg-white/10'
                  }`} 
                />
                <span className="text-[10px] font-medium tracking-wide">Screen</span>
              </button>

              {/* Chat Toggle Control */}
              <button 
                onClick={() => setPanel(panel === 'chat' ? '' : 'chat')}
                className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <FiMessageSquare 
                  size={18} 
                  className={`h-10 w-10 p-2.5 rounded-full border transition ${
                    panel === 'chat' 
                      ? 'text-violet-400 bg-violet-500/10 border-violet-500/20' 
                      : 'text-white bg-white/5 border-white/10 hover:bg-white/10'
                  }`} 
                />
                <span className="text-[10px] font-medium tracking-wide">Chat</span>
              </button>

              {/* Editor Toggle Control */}
              <button 
                onClick={() => setShowEditor(!showEditor)}
                className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <FiCode 
                  size={18} 
                  className={`h-10 w-10 p-2.5 rounded-full border transition ${
                    showEditor 
                      ? 'text-violet-400 bg-violet-500/10 border-violet-500/20' 
                      : 'text-white bg-white/5 border-white/10 hover:bg-white/10'
                  }`} 
                />
                <span className="text-[10px] font-medium tracking-wide">Editor</span>
              </button>

              {/* Participants Indicator */}
              <button 
                onClick={() => toast('Participants list: You, ' + (participantName || 'Waiting...'))}
                className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <FiUsers size={18} className="text-white bg-white/5 h-10 w-10 p-2.5 rounded-full border border-white/10 hover:bg-white/10 transition" />
                <span className="text-[10px] font-medium tracking-wide">People</span>
              </button>

              {/* More Options */}
              <button 
                onClick={() => setPanel(panel === 'notes' ? '' : 'notes')}
                className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <FiMoreHorizontal 
                  size={18} 
                  className={`h-10 w-10 p-2.5 rounded-full border transition ${
                    panel === 'notes' 
                      ? 'text-violet-400 bg-violet-500/10 border-violet-500/20' 
                      : 'text-white bg-white/5 border-white/10 hover:bg-white/10'
                  }`} 
                />
                <span className="text-[10px] font-medium tracking-wide">Notes</span>
              </button>
            </div>
          </div>

          {/* Toggleable Realtime Coding Workspace */}
          {showEditor && (
            <div className="h-[260px] border border-white/5 rounded-2xl overflow-hidden bg-[#110f1c] flex flex-col flex-shrink-0">
              <div className="bg-black/30 border-b border-white/5 px-4 py-2 flex justify-between items-center">
                <b className="text-[10px] font-bold text-white tracking-widest uppercase">Collaborative Editor</b>
                <span className="text-[8px] bg-violet-500/10 border border-violet-500/20 text-violet-300 font-bold px-2 py-0.5 rounded uppercase">Synced</span>
              </div>
              <div className="flex-1 min-h-0">
                <Editor 
                  height="100%" 
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
                    fontSize: 12,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    padding: { top: 8, bottom: 8 }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Redesigned Sidebar panel matching reference image) */}
        {isChatOpen && (
          <aside className="col-span-12 lg:col-span-3 bg-[#110f1c] border border-white/10 rounded-2xl p-4 flex flex-col justify-between h-full min-h-0 shadow-2xl">
            <div className="flex-1 flex flex-col min-h-0">
              {/* Sidebar Header */}
              <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 flex-shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPanel('chat')}
                    className={`text-xs font-bold px-2.5 py-1 rounded transition ${
                      panel === 'chat' ? 'bg-violet-500/10 text-violet-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Chat
                  </button>
                  <button 
                    onClick={() => setPanel('notes')}
                    className={`text-xs font-bold px-2.5 py-1 rounded transition ${
                      panel === 'notes' ? 'bg-violet-500/10 text-violet-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Notepad
                  </button>
                </div>
                <button 
                  onClick={() => setPanel('')} 
                  className="text-gray-400 hover:text-white transition p-0.5 hover:bg-white/5 rounded"
                >
                  <FiX size={15} />
                </button>
              </div>

              {/* Sidebar Content (Chat message thread or Notepad) */}
              <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                {panel === 'chat' ? (
                  <div className="space-y-4">
                    {messages.length ? (
                      messages.map((item, index) => {
                        const isOwn = item.sender === 'You' || (user && item.sender === user.name);
                        return (
                          <div key={index} className="flex gap-2.5 items-start">
                            {/* Avatar */}
                            <div className={`h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border ${
                              isOwn 
                                ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' 
                                : 'bg-slate-700/30 text-gray-300 border-slate-700/50'
                            }`}>
                              {isOwn ? 'Y' : (item.sender?.[0]?.toUpperCase() || 'P')}
                            </div>

                            {/* Message Block */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[10px] font-bold text-white truncate max-w-[100px]">
                                  {isOwn ? 'You' : (item.sender || 'Participant')}
                                </span>
                                <span className="text-[8px] text-gray-500">
                                  {formatMessageTime(item.createdAt)}
                                </span>
                              </div>
                              {/* Message bubble */}
                              <div className={`mt-1 rounded-2xl rounded-tl-none px-3.5 py-2 text-xs leading-relaxed tracking-wide ${
                                isOwn 
                                  ? 'bg-violet-600/10 border border-violet-500/20 text-violet-200' 
                                  : 'bg-white/5 border border-white/5 text-gray-200'
                              }`}>
                                {item.text}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500 text-xs font-medium">
                        No messages yet. Send a greeting to start.
                      </div>
                    )}
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
                    className="h-full w-full bg-black/30 border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-violet-500 transition resize-none" 
                    placeholder="Realtime shared notepad..."
                  />
                )}
              </div>
            </div>

            {/* Sidebar Footer Input (for Chat) */}
            {panel === 'chat' && (
              <div className="border-t border-white/5 pt-3 mt-3 flex-shrink-0">
                <div className="relative flex items-center">
                  <input 
                    value={message} 
                    onChange={(event) => setMessage(event.target.value)} 
                    onKeyDown={(event) => event.key === 'Enter' && send()} 
                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 pr-11 text-xs text-white placeholder-gray-500 outline-none focus:border-violet-500 transition" 
                    placeholder="Type a message..."
                  />
                  <button 
                    onClick={send}
                    className="absolute right-2 bg-violet-600 hover:bg-violet-700 text-white font-bold p-2 rounded-xl transition flex items-center justify-center cursor-pointer"
                  >
                    <FiSend size={12} />
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
