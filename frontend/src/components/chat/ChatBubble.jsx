import ReactMarkdown from 'react-markdown';
import { FiZap } from 'react-icons/fi';
import { MessageActions } from './MessageActions.jsx';

export const ChatBubble = ({ message, user }) => <article className={`chat-bubble-row ${message.role === 'user' ? 'from-user' : ''}`}><div className={`chat-avatar ${message.role === 'user' ? 'user-avatar' : ''}`}>{message.role === 'user' ? user?.name?.[0] || 'U' : <FiZap />}</div><div className="chat-message"><div className="markdown-content"><ReactMarkdown>{message.content}</ReactMarkdown></div>{message.role === 'assistant' && <MessageActions content={message.content} />}</div></article>;
