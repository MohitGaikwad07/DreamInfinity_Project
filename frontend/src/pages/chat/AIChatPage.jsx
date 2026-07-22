import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiBookOpen, FiBriefcase, FiCode, FiFileText, FiLayers, FiMic } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ChatSidebar } from '../../components/chat/ChatSidebar.jsx';
import { ChatWindow } from '../../components/chat/ChatWindow.jsx';
import { ChatInput } from '../../components/chat/ChatInput.jsx';
import { SuggestionCard } from '../../components/chat/SuggestionCard.jsx';
import { QuickPromptCard } from '../../components/chat/QuickPromptCard.jsx';
import { clearChatError, clearConversation, sendChatMessage } from '../../redux/slices/chatSlice.js';

const suggestions = [[FiBookOpen,'Explain Redux','State management, simply explained.'],[FiMic,'Java interview questions','Generate a targeted practice set.'],[FiFileText,'Improve my resume','Get sharper content and structure ideas.'],[FiBriefcase,'Prepare for Amazon','Build a focused company preparation plan.'],[FiCode,'Teach MongoDB','Learn databases through practical concepts.'],[FiLayers,'Explain system design','Build a strong foundation step by step.']];
const prompts = ['Create a 30-day frontend roadmap', 'How do I answer “tell me about yourself”?', 'Give me a DSA practice plan'];

export const AIChatPage = () => { const dispatch = useDispatch(); const { user } = useSelector((state) => state.auth); const { messages, conversations, loading, error } = useSelector((state) => state.chat); useEffect(() => { if (error) { toast.error(error); dispatch(clearChatError()); } }, [error, dispatch]); const send = (prompt) => dispatch(sendChatMessage({ id: crypto.randomUUID(), prompt, context: { profile: user ? { name: user.name, level: user.level, xp: user.xp, interviewStats: user.interviewStats, codingStats: user.codingStats, resumeScore: user.resumeScore } : {} } })); const fresh = () => dispatch(clearConversation()); const isFresh = messages.length === 1; return <div className="ai-chat-page"><ChatSidebar conversations={conversations} onNew={fresh} /><div className="chat-main"><header className="chat-header"><div><p className="dash-kicker">DREAM & INFINITY</p><h1>Your career co-pilot</h1></div><span>Gemini-powered</span></header>{isFresh ? <div className="chat-empty"><div className="chat-orb">✦</div><h2>How can I help you grow today?</h2><p>Get clear, practical help for every part of your career journey.</p><div className="suggestion-grid">{suggestions.map(([Icon,title,text]) => <SuggestionCard icon={Icon} title={title} text={text} onClick={() => send(title)} key={title} />)}</div><div className="prompt-row">{prompts.map((prompt) => <QuickPromptCard prompt={prompt} onClick={send} key={prompt} />)}</div></div> : <ChatWindow messages={messages} user={user} loading={loading} />}<div className="chat-composer"><ChatInput onSend={send} loading={loading} /><p>Dream & Infinity can make mistakes. Verify important information.</p></div></div></div>; };
