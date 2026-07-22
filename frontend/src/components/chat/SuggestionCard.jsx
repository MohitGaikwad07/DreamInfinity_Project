import { motion } from 'framer-motion';
export const SuggestionCard = ({ icon: Icon, title, text, onClick }) => <motion.button whileHover={{ y: -3 }} className="suggestion-card" onClick={onClick}><Icon /><b>{title}</b><p>{text}</p></motion.button>;
