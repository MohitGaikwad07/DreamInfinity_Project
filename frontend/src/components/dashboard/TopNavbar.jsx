import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiBell, 
  FiChevronDown, 
  FiMenu, 
  FiSearch, 
  FiSettings, 
  FiUser, 
  FiZap, 
  FiCheck, 
  FiTrash2, 
  FiMic, 
  FiCode, 
  FiAward,
  FiLogOut 
} from 'react-icons/fi';
import { 
  fetchNotifications, 
  markNotificationRead, 
  clearNotifications 
} from '../../redux/slices/notificationSlice.js';
import toast from 'react-hot-toast';

export const TopNavbar = ({ user, onMenu, onLogout, onSettings }) => {
  const dispatch = useDispatch();
  const [menu, setMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const { notifications } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id))
      .unwrap()
      .then(() => toast.success('Notification marked as read.'))
      .catch((err) => toast.error(err));
  };

  const handleClearAll = () => {
    dispatch(clearNotifications())
      .unwrap()
      .then(() => toast.success('Cleared all notifications.'))
      .catch((err) => toast.error(err));
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'xp': return <FiZap className="text-amber-400" />;
      case 'interview': return <FiMic className="text-pink-400" />;
      case 'coding': return <FiCode className="text-blue-400" />;
      default: return <FiAward className="text-violet-400" />;
    }
  };

  return (
    <header className="dashboard-topbar">
      <button className="lg:hidden" onClick={onMenu}><FiMenu /></button>
      <label className="dashboard-search">
        <FiSearch />
        <input placeholder="Search your workspace" />
      </label>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Link to="/assistant" className="ai-shortcut">
          <FiZap />
          <span>Ask AI</span>
        </Link>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotif(!showNotif); setMenu(false); }}
            className={`rounded-lg p-2 text-violet-100/70 hover:bg-white/5 relative ${showNotif ? 'bg-white/5' : ''}`}
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#161424] p-4 shadow-2xl z-50">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                <h4 className="text-xs font-black uppercase tracking-wider text-violet-300">Notifications ({unreadCount})</h4>
                {notifications.length > 0 && (
                  <button 
                    onClick={handleClearAll}
                    className="text-[10px] text-rose-300 hover:text-rose-400 flex items-center gap-1 font-semibold"
                  >
                    <FiTrash2 /> Clear all
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div 
                      key={item._id} 
                      className={`flex gap-3 p-2.5 rounded-lg border text-xs transition cursor-pointer ${
                        item.isRead 
                          ? 'bg-transparent border-transparent text-gray-400' 
                          : 'bg-white/5 border-white/5 text-white hover:bg-white/8'
                      }`}
                      onClick={() => !item.isRead && handleMarkRead(item._id)}
                    >
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <b className="font-semibold block">{item.title}</b>
                        <p className="text-[10px] mt-0.5 text-violet-200/75 leading-relaxed">{item.message}</p>
                      </div>
                      {!item.isRead && (
                        <div className="shrink-0 flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setMenu(!menu); setShowNotif(false); }} 
            className="flex items-center gap-2"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 font-bold">
              {user?.name?.[0] || 'U'}
            </span>
            <FiChevronDown className="hidden text-xs sm:block" />
          </button>

          {menu && (
            <div className="user-menu">
              <Link to="/profile" onClick={() => setMenu(false)}>
                <FiUser /> Profile
              </Link>
              <button onClick={() => { setMenu(false); onSettings && onSettings(); }}>
                <FiSettings /> Settings
              </button>
              <button onClick={onLogout} className="text-rose-300">
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
