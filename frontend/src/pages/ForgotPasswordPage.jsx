import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient.js';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Token & New Password
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      toast.success(response.data.message);
      // Highlight token in dev mode
      if (response.data.token) {
        toast(`🔑 Dev Mode Verification Code: ${response.data.token}`, { duration: 15000 });
      }
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send recovery code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || !password) return;
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token: code, password });
      toast.success('Password updated successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code or password requirements not met.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reset your password</h1>
        <p className="mt-2 text-sm text-violet-100/65">
          {step === 1 ? 'Enter your email to receive a recovery code.' : 'Enter the recovery code and your new password.'}
        </p>
      </header>

      {step === 1 ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-violet-100">Email address</span>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field w-full"
              placeholder="name@company.com"
            />
          </label>
          <button 
            type="submit" 
            disabled={loading}
            className="primary-button w-full"
          >
            {loading ? 'Sending code...' : 'Send Recovery Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-violet-100">Verification Code</span>
            <input 
              required
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="field w-full text-center tracking-widest font-mono text-lg"
              placeholder="123456"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-violet-100">New Password</span>
            <input 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field w-full"
              placeholder="••••••••"
            />
          </label>
          <button 
            type="submit" 
            disabled={loading}
            className="primary-button w-full"
          >
            {loading ? 'Resetting password...' : 'Update Password'}
          </button>
        </form>
      )}

      <Link className="block text-center text-sm text-link mt-6" to="/login">
        Back to sign in
      </Link>
    </div>
  );
};
