import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export const AuthLayout = () => <main className="auth-canvas grid min-h-screen place-items-center p-4 sm:p-8"><motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-md rounded-3xl p-6 sm:p-9"><Link to="/" className="mb-8 block text-xl font-extrabold tracking-tight">Dream <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Infinity</span></Link><Outlet /></motion.section></main>;
