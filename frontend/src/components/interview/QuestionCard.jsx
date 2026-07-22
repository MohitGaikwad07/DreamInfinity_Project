import { FiVolume2 } from 'react-icons/fi';
export const QuestionCard=({question,onReplay,index})=><section className="question-card"><header><span>QUESTION {index}</span><button onClick={onReplay}><FiVolume2/> Replay</button></header><h2>{question}</h2><p>Take a moment to structure your answer. Explain your reasoning clearly.</p></section>;
