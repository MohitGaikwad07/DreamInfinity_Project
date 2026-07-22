import { Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm.jsx';

export const LoginPage = () => <><header className="mb-7"><h1 className="text-2xl font-bold">Welcome back</h1><p className="mt-2 text-sm text-violet-100/65">Continue your interview preparation journey.</p></header><LoginForm /><p className="mt-6 text-center text-sm text-violet-100/65">New to Dream Infinity? <Link className="text-link" to="/register">Create an account</Link></p></>;
