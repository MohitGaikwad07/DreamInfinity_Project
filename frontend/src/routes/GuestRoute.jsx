import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const GuestRoute = () => useSelector((state) => state.auth.isAuthenticated) ? <Navigate to="/dashboard" replace /> : <Outlet />;
