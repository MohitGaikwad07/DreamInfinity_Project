import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice.js';
import { Sidebar } from '../components/dashboard/Sidebar.jsx';
import { TopNavbar } from '../components/dashboard/TopNavbar.jsx';
import { SettingsModal } from '../components/dashboard/SettingsModal.jsx';

export const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  
  const logout = () => dispatch(logoutUser());
  
  return (
    <div className="dashboard-app">
      <Sidebar 
        open={open} 
        onClose={() => setOpen(false)} 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        onLogout={logout}
        onSettings={() => setSettingsOpen(true)}
      />
      <div className={`dashboard-main ${collapsed ? 'main-collapsed' : ''}`}>
        <TopNavbar 
          user={user} 
          onMenu={() => setOpen(true)} 
          onLogout={logout} 
          onSettings={() => setSettingsOpen(true)}
        />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
      
      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
};
