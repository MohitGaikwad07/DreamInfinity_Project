export const QuickPromptCard = ({ prompt, onClick }) => <button className="quick-prompt" onClick={() => onClick(prompt)}>{prompt}</button>;
