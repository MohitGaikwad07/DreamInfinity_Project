import { motion } from 'framer-motion';
export const QuickActionCard = ({ icon: Icon, title, text, tone }) => <motion.button whileHover={{ y: -4 }} className="quick-action"><span className={tone}><Icon /></span><b>{title}</b><p>{text}</p></motion.button>;
