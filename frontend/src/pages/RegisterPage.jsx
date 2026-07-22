import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm.jsx';

export const RegisterPage = () => <><header className="mb-7"><h1 className="text-2xl font-bold">Start preparing smarter</h1><p className="mt-2 text-sm text-violet-100/65">Build interview confidence with Dream & Infinity.</p></header><RegisterForm /><p className="mt-6 text-center text-sm text-violet-100/65">Already have an account? <Link className="text-link" to="/login">Sign in</Link></p></>;
