import { motion } from 'framer-motion';
const stats = [['1000+','Students'],['5000+','Mock Interviews'],['150+','Companies'],['95%','Success Rate']];
export const StatsSection = () => <section className="section-block"><div className="stats-grid">{stats.map(([number,label], index) => <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} key={label}><strong>{number}</strong><span>{label}</span></motion.div>)}</div></section>;
