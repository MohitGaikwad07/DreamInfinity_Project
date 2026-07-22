import { Link } from 'react-router-dom';
import { FiMessageCircle } from 'react-icons/fi';
export const FloatingAIButton = () => <Link to="/assistant" className="floating-ai" aria-label="Open AI assistant"><FiMessageCircle /><span>Ask Dream & Infinity</span></Link>;
