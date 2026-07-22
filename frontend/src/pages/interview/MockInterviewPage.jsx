import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import '../../styles/interview.css';
import { clearInterview, clearInterviewError, finishInterview, getNextQuestion, startInterview, submitAnswer, tick } from '../../redux/slices/interviewSlice.js';
import { InterviewSetup } from '../../components/interview/InterviewSetup.jsx';
import { InterviewTimer } from '../../components/interview/InterviewTimer.jsx';
import { QuestionCard } from '../../components/interview/QuestionCard.jsx';
import { VoiceControls } from '../../components/interview/VoiceControls.jsx';
import { CameraControls } from '../../components/interview/CameraControls.jsx';
import { TranscriptPanel } from '../../components/interview/TranscriptPanel.jsx';
import { InterviewResult } from '../../components/interview/InterviewResult.jsx';

export const MockInterviewPage = () => {
  const dispatch = useDispatch();
  const { mode, interview, currentQuestion, transcript, elapsedSeconds, evaluation, loading, error } = useSelector((state) => state.interview);
  const { soundEnabled } = useSelector((state) => state.settings);
  
  const [answer, setAnswer] = useState(''); 
  const [listening, setListening] = useState(false); 
  const recognition = useRef();

  useEffect(() => { 
    if (mode !== 'room') return undefined; 
    const timer = setInterval(() => dispatch(tick()), 1000); 
    return () => clearInterval(timer); 
  }, [mode, dispatch]);

  useEffect(() => { 
    if (error) { 
      toast.error(error); 
      dispatch(clearInterviewError()); 
    } 
  }, [error, dispatch]);

  const speak = () => { 
    if ('speechSynthesis' in window && currentQuestion) { 
      speechSynthesis.cancel(); 
      speechSynthesis.speak(new SpeechSynthesisUtterance(currentQuestion)); 
    } 
  };

  useEffect(() => {
    if (soundEnabled && currentQuestion && mode === 'room' && !evaluation) {
      speak();
    }
  }, [currentQuestion, soundEnabled, mode, evaluation]);

  const voice = () => {
    if (listening) { 
      recognition.current?.stop(); 
      setListening(false); 
      return; 
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { 
      toast.error('Speech recognition is not supported in this browser.'); 
      return; 
    }
    const instance = new SpeechRecognition(); 
    instance.continuous = true; 
    instance.interimResults = true;
    instance.onresult = (event) => { 
      let text = ''; 
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript; 
      }
      setAnswer(text.trim()); 
    };
    instance.onend = () => setListening(false); 
    recognition.current = instance; 
    instance.start(); 
    setListening(true);
  };

  const submit = async () => { 
    const action = await dispatch(submitAnswer({ interviewId: interview._id, answer })); 
    if (submitAnswer.fulfilled.match(action)) { 
      setAnswer(''); 
      toast.success('Answer evaluated.'); 
    } 
  };

  const next = () => dispatch(getNextQuestion(interview._id));
  const finish = () => dispatch(finishInterview({ interviewId: interview._id, actualDurationSeconds: elapsedSeconds }));

  if (mode === 'setup') return <InterviewSetup onStart={(data) => dispatch(startInterview(data))} loading={loading}/>;
  if (mode === 'result') return <InterviewResult interview={interview} onRestart={() => dispatch(clearInterview())}/>;

  const currentIdx = evaluation ? transcript.length : transcript.length + 1;

  return (
    <div className="interview-room">
      <header className="room-header">
        <div>
          <p className="dash-kicker">AI MOCK INTERVIEW</p>
          <h1>{interview.targetCompany} · {interview.targetRole}</h1>
        </div>
        <InterviewTimer seconds={elapsedSeconds} duration={interview.durationMinutes}/>
        <button className="finish-interview" onClick={finish} disabled={loading}>Finish interview</button>
      </header>
      
      <div className="interview-progress">
        <i style={{ width: `${Math.min(100, (elapsedSeconds / (interview.durationMinutes * 60)) * 100)}%` }}/>
      </div>
      
      <div className="room-layout">
        <main>
          {currentQuestion && (
            <QuestionCard question={currentQuestion} onReplay={speak} index={currentIdx}/>
          )}
          
          <VoiceControls 
            listening={listening} 
            onToggle={voice} 
            answer={answer} 
            setAnswer={setAnswer} 
            onSubmit={submit} 
            loading={loading}
            disabled={loading || !!evaluation}
          />
          
          {evaluation && (
            <section className="turn-feedback">
              <p className="dash-kicker">AI EVALUATION</p>
              <h3>{evaluation.feedback}</h3>
              <div>
                {Object.entries(evaluation)
                  .filter(([, value]) => typeof value === 'number')
                  .map(([key, value]) => (
                    <span key={key}>{key.replace(/([A-Z])/g, ' $1')}: <b>{value}</b></span>
                  ))}
              </div>
              <button onClick={next} disabled={loading}>Next question →</button>
            </section>
          )}
          
          <CameraControls/>
        </main>
        
        <TranscriptPanel turns={transcript}/>
      </div>
    </div>
  );
};
