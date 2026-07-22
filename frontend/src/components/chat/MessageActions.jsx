import toast from 'react-hot-toast';
import { FiCopy, FiThumbsDown, FiThumbsUp } from 'react-icons/fi';
export const MessageActions = ({ content }) => <div className="message-actions"><button onClick={() => navigator.clipboard.writeText(content).then(() => toast.success('Copied to clipboard.'))} title="Copy"><FiCopy /></button><button title="Helpful"><FiThumbsUp /></button><button title="Not helpful"><FiThumbsDown /></button></div>;
