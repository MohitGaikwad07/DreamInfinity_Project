import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clearAuthError, registerUser } from '../../redux/slices/authSlice.js';
import { PasswordInput } from './PasswordInput.jsx';

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const RegisterForm = () => {
  const dispatch = useDispatch(); const navigate = useNavigate(); const { loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  useEffect(() => { if (error) { toast.error(error); dispatch(clearAuthError()); } }, [error, dispatch]);
  const submit = async (values) => { const action = await dispatch(registerUser(values)); if (registerUser.fulfilled.match(action)) { toast.success('Your account is ready.'); navigate('/dashboard', { replace: true }); } };
  return <form onSubmit={handleSubmit(submit)} className="space-y-5">
    <label className="block space-y-1.5"><span className="text-sm font-medium text-violet-100">Full name</span><input className={`field ${errors.name ? 'field-error' : ''}`} autoComplete="name" {...register('name', { required: 'Name is required.', minLength: { value: 2, message: 'Use at least 2 characters.' }, maxLength: { value: 80, message: 'Use no more than 80 characters.' } })} />{errors.name && <span className="text-sm text-rose-300">{errors.name.message}</span>}</label>
    <label className="block space-y-1.5"><span className="text-sm font-medium text-violet-100">Email address</span><input className={`field ${errors.email ? 'field-error' : ''}`} autoComplete="email" {...register('email', { required: 'Email is required.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' } })} />{errors.email && <span className="text-sm text-rose-300">{errors.email.message}</span>}</label>
    <PasswordInput label="Password" autoComplete="new-password" error={errors.password?.message} {...register('password', { required: 'Password is required.', pattern: { value: strongPassword, message: 'Use 8+ characters with uppercase, lowercase, number, and symbol.' } })} />
    <PasswordInput label="Confirm password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword', { required: 'Please confirm your password.', validate: (value) => value === watch('password') || 'Passwords do not match.' })} />
    <button className="primary-button" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
  </form>;
};
