import { FiMic, FiMicOff, FiSend } from 'react-icons/fi';

export const VoiceControls = ({ listening, onToggle, answer, setAnswer, onSubmit, loading, disabled }) => {
  return (
    <section className="answer-card">
      <textarea 
        value={answer} 
        onChange={(e) => setAnswer(e.target.value)} 
        placeholder={disabled ? "Review your AI evaluation below, then click 'Next question' to proceed." : "Type your answer, or use the microphone…"} 
        disabled={disabled} 
        rows="6"
      />
      <div>
        <button 
          className={listening ? 'voice-active' : ''} 
          onClick={onToggle}
          disabled={disabled}
        >
          {listening ? <FiMicOff /> : <FiMic />} {listening ? 'Stop listening' : 'Voice input'}
        </button>
        <button 
          className="answer-submit" 
          disabled={!answer.trim() || loading || disabled} 
          onClick={onSubmit}
        >
          Submit answer <FiSend />
        </button>
      </div>
    </section>
  );
};
