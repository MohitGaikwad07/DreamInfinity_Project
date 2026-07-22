import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clearAuthError, loginUser } from '../../redux/slices/authSlice.js';
import { PasswordInput } from './PasswordInput.jsx';
import { SocialLoginButton } from './SocialLoginButton.jsx';

export const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { email: '', password: '' } });

  useEffect(() => { if (error) { toast.error(error); dispatch(clearAuthError()); } }, [error, dispatch]);
  const submit = async (values) => {
    const action = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(action)) { toast.success('Welcome back.'); navigate('/dashboard', { replace: true }); }
  };
  return <form onSubmit={handleSubmit(submit)} className="space-y-5">
    <label className="block space-y-1.5"><span className="text-sm font-medium text-violet-100">Email address</span><input className={`field ${errors.email ? 'field-error' : ''}`} autoComplete="email" {...register('email', { required: 'Email is required.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' } })} />{errors.email && <span className="text-sm text-rose-300">{errors.email.message}</span>}</label>
    <PasswordInput label="Password" autoComplete="current-password" error={errors.password?.message} {...register('password', { required: 'Password is required.' })} />
    <div className="text-right text-sm"><Link className="text-link" to="/forgot-password">Forgot password?</Link></div>
    <button className="primary-button" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
    <div className="flex items-center gap-3 text-xs text-violet-200/55"><span className="h-px flex-1 bg-white/10" />OR<span className="h-px flex-1 bg-white/10" /></div>
    <SocialLoginButton />
  </form>;
};
