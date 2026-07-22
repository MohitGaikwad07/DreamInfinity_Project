import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadCurrentUser } from '../redux/slices/authSlice.js';

export const ProtectedRoute = () => { const dispatch = useDispatch(); const { token, isAuthenticated, initialized, loading } = useSelector((state) => state.auth); useEffect(() => { if (token && !initialized) dispatch(loadCurrentUser()); }, [dispatch, token, initialized]); if (token && !initialized && loading) return <div className="auth-canvas grid min-h-screen place-items-center">Loading your workspace…</div>; return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />; };
