import { useEffect, useRef, useState } from 'react';
import { FiCamera, FiCameraOff, FiMic, FiMicOff } from 'react-icons/fi';

export const CameraControls = () => {
  const video = useRef();
  const recorder = useRef();
  const chunks = useRef([]);
  const [stream, setStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const enable = async () => { try { const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); video.current.srcObject = media; setStream(media); } catch {} };
  const stopRecording = () => { if (recorder.current?.state === 'recording') recorder.current.stop(); setRecording(false); };
  const disable = () => { stopRecording(); stream?.getTracks().forEach((track) => track.stop()); setStream(null); };
  const toggleRecording = () => {
    if (!stream) return;
    if (recording) return stopRecording();
    chunks.current = [];
    const instance = new MediaRecorder(stream);
    instance.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
    instance.onstop = () => {
      if (!chunks.current.length) return;
      const url = URL.createObjectURL(new Blob(chunks.current, { type: 'video/webm' }));
      const link = document.createElement('a'); link.href = url; link.download = `favour-ai-interview-${Date.now()}.webm`; link.click(); URL.revokeObjectURL(url);
    };
    recorder.current = instance; instance.start(); setSeconds(0); setRecording(true);
  };
  useEffect(() => { if (!recording) return undefined; const timer = setInterval(() => setSeconds((value) => value + 1), 1000); return () => clearInterval(timer); }, [recording]);
  useEffect(() => () => disable(), []);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return <section className="camera-card"><video ref={video} autoPlay muted playsInline/><div className="camera-empty">{!stream && <><FiCamera/><span>Camera preview is optional</span></>}</div><div className="camera-controls"><button onClick={stream ? disable : enable}>{stream ? <FiCameraOff/> : <FiCamera/>}</button><button disabled={!stream} onClick={() => { stream?.getAudioTracks().forEach((track) => { track.enabled = muted; }); setMuted(!muted); }}>{muted ? <FiMicOff/> : <FiMic/>}</button><button disabled={!stream} onClick={toggleRecording}>{recording ? 'Stop recording' : 'Record video'}</button><span>{recording ? `● Recording ${time}` : stream ? 'Camera ready' : 'Camera off'}</span></div></section>;
};
