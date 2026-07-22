import { useEffect, useRef } from 'react';
import { ChatBubble } from './ChatBubble.jsx';
import { TypingAnimation } from './TypingAnimation.jsx';

export const ChatWindow = ({ messages, user, loading }) => { 
  const end = useRef(); 

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]); 

  return (
    <div className="chat-window">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} user={user} />
      ))}
      {loading && (
        <div className="chat-bubble-row">
          <div className="chat-avatar">
            <span>✦</span>
          </div>
          <TypingAnimation />
        </div>
      )}
      <div ref={end} />
    </div>
  ); 
};
