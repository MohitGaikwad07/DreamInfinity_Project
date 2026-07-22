import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiAward,
  FiZap,
  FiCalendar,
  FiCheck,
  FiUserPlus,
  FiUserMinus,
  FiSearch,
  FiShoppingBag,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiUser,
  FiCpu,
  FiSettings,
  FiHeart
} from 'react-icons/fi';
import { FaCoins, FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

import {
  loadGamification,
  loadLeaderboard,
  searchUsers,
  addFriend,
  removeFriend,
  redeemCosmetic,
  selectCosmetics,
  updateProfileFields,
  clearErrors
} from '../../redux/slices/gamificationSlice.js';

import '../../styles/gamification.css';

const tiers = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
  legend: 'Legend'
};

const ConfettiEffect = () => {
  const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {Array.from({ length: 50 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2.5;
        const duration = Math.random() * 2 + 1.5;
        const size = Math.random() * 8 + 6;
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '-20px',
              left: `${left}%`,
              width: `${size}px`,
              height: `${size * (Math.random() > 0.5 ? 1.5 : 1)}px`,
              backgroundColor: color,
              borderRadius: '2px',
              opacity: Math.random(),
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `confettiFall ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confettiFall {
          0% { top: -20px; transform: translateY(0) rotate(0deg); }
          100% { top: 105%; transform: translateY(600px) rotate(720deg); }
        }
      `}</style>
    </div>
  );
};

export const RankingsPage = () => {
  const dispatch = useDispatch();
  const {
    data,
    leaderboard,
    searchResults,
    period,
    scope,
    loading,
    actionLoading,
    error,
    actionError
  } = useSelector((state) => state.gamification);

  // Local States
  const [activeTab, setActiveTab] = useState('overview'); // overview, leaderboard, achievements, challenges, shop, career_score, history
  const [leadPeriod, setLeadPeriod] = useState('all');
  const [leadScope, setLeadScope] = useState('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeVal, setCollegeVal] = useState('');
  const [companyVal, setCompanyVal] = useState('');
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [localLevel, setLocalLevel] = useState(null);

  // Initialize profile values and check level up
  useEffect(() => {
    dispatch(loadGamification());
  }, [dispatch]);

  useEffect(() => {
    if (data?.profile?.level) {
      if (localLevel !== null && data.profile.level > localLevel) {
        setShowLevelUpModal(true);
        toast.success(`🎉 LEVEL UP! You reached Level ${data.profile.level}!`, { duration: 5000 });
      }
      setLocalLevel(data.profile.level);
    }
    if (data?.college) setCollegeVal(data.college);
    if (data?.company) setCompanyVal(data.company);
  }, [data, localLevel]);

  // Load leaderboard when filters change
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      dispatch(loadLeaderboard({ period: leadPeriod, scope: leadScope }));
    }
  }, [dispatch, activeTab, leadPeriod, leadScope]);

  // Handle Search Users for Friend Finder
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchUsers(searchQuery));
    }
  };

  // Profile fields update
  const handleSaveProfileFields = (e) => {
    e.preventDefault();
    dispatch(updateProfileFields({ college: collegeVal, company: companyVal }))
      .unwrap()
      .then(() => toast.success('Profile details saved! Leaderboards updated.'))
      .catch((err) => toast.error(err));
  };

  // Cosmetic redemption & equips
  const handleBuyCosmetic = (itemId, itemType) => {
    dispatch(redeemCosmetic({ itemId, itemType }))
      .unwrap()
      .then((res) => toast.success(res.message))
      .catch((err) => toast.error(err));
  };

  const handleEquipCosmetic = (itemId, itemType, isEquip = true) => {
    const payload = itemType === 'title' 
      ? { titleId: isEquip ? itemId : null } 
      : { frameId: isEquip ? itemId : null };
      
    dispatch(selectCosmetics(payload))
      .unwrap()
      .then(() => toast.success(isEquip ? 'Equipped successfully!' : 'Unequipped successfully!'))
      .catch((err) => toast.error(err));
  };

  // Friend actions
  const handleAddFriend = (friendId) => {
    dispatch(addFriend(friendId))
      .unwrap()
      .then(() => toast.success('Connected with peer! +15 XP.'))
      .catch((err) => toast.error(err));
  };

  const handleRemoveFriend = (friendId) => {
    dispatch(removeFriend(friendId))
      .unwrap()
      .then(() => toast.success('Removed learning partner.'))
      .catch((err) => toast.error(err));
  };

  // Display Calendar Calculation
  const getCalendarDays = () => {
    const dates = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      dates.push({
        dateStr: str,
        dayNum: d.getDate(),
        weekday: weekdays[d.getDay()],
        isActive: data?.streakCalendar?.includes(str)
      });
    }
    return dates;
  };

  if (loading && !data) {
    return <div className="game-loading">Loading gamified training center...</div>;
  }

  const profileInfo = data?.profile;
  const career = data?.careerScore;
  const streak = data?.streak;
  
  // Format cosmetic shop list
  const shopTitles = data?.shopItems?.titles || [];
  const shopFrames = data?.shopItems?.frames || [];

  return (
    <div className="game-page px-4 md:px-8 py-6">
      <AnimatePresence>
        {showLevelUpModal && (
          <div className="level-up-modal-overlay">
            <ConfettiEffect />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="level-up-content z-10"
            >
              <h2 className="level-up-title">Level Up!</h2>
              <p className="text-violet-200">You earned sufficient XP to advance!</p>
              <div className="level-up-badge">🏆</div>
              <div className="text-6xl font-black text-violet-400">LVL {profileInfo?.level}</div>
              <button 
                onClick={() => setShowLevelUpModal(false)}
                className="level-up-btn-close"
              >
                Let's Practise More!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="game-hero mb-6">
        <div>
          <p className="dash-kicker">RANKINGS, CHALLENGES & COSMETICS</p>
          <h1 className="text-3xl font-black">Level Up Your <span>Career.</span></h1>
          <p className="max-w-2xl text-sm text-gray-400 mt-2">
            Earn experience, maintain streaks, compete with peers, and customize your profile border using coins earned by mock training.
          </p>
        </div>
        <div className="level-orb">
          <FiZap />
          <b>LVL {profileInfo?.level || 1}</b>
          <small>{profileInfo?.currentXp || 0} XP</small>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="xp-panel grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs font-semibold text-violet-300">LEVEL PROGRESSION</span>
            <span className="text-xs text-gray-400">{profileInfo?.currentXp} / {profileInfo?.nextLevelXp} XP</span>
          </div>
          <i>
            <em style={{ width: `${profileInfo?.progress || 0}%` }} />
          </i>
          <p className="text-[10px] text-gray-500 mt-1">{profileInfo?.progress || 0}% towards Level {(profileInfo?.level || 1) + 1}</p>
        </div>
        <div className="game-stat">
          <FiCalendar />
          <b>{streak?.current || 0} Days</b>
          <span>active streak</span>
        </div>
        <div className="game-stat">
          <FaCoins className="text-amber-400" />
          <b>{data?.coins || 0}</b>
          <span>coins in bank</span>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="game-tabs flex space-x-2">
        {[
          ['overview', 'Overview', <FiUser />],
          ['leaderboard', 'Leaderboards', <FiAward />],
          ['achievements', 'Achievements', <FiAward />],
          ['challenges', 'Challenges', <FiCpu />],
          ['shop', 'Coin Shop', <FiShoppingBag />],
          ['career_score', 'Career Score', <FiTrendingUp />],
          ['history', 'Reward History', <FiClock />]
        ].map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`game-tab-btn ${activeTab === key ? 'active' : ''}`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <div className="game-content mt-4">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Equipped Cosmetics Display */}
            <div className="profile-card col-span-1">
              <h3 className="text-base font-bold text-violet-300">Profile Customize Card</h3>
              <div className="flex flex-col items-center py-4 relative">
                <div className={`avatar-container ${data?.selectedFrame ? `frame-${data.selectedFrame}` : ''}`}>
                  <div className="user-avatar-img">
                    {profileInfo?.level ? profileInfo.level : '1'}
                  </div>
                </div>
                <h2 className="text-xl font-bold mt-4">{profileInfo?.name || 'User'}</h2>
                {data?.selectedTitle ? (
                  <span className="profile-title-tag">{data.selectedTitle.replace('_', ' ')}</span>
                ) : (
                  <span className="text-xs text-gray-500 mt-1">No title equipped</span>
                )}
                <div className="flex gap-4 mt-6 text-sm text-center">
                  <div>
                    <b className="block text-violet-400 text-lg">{streak?.longest || 0}</b>
                    <span className="text-[10px] text-gray-400 uppercase">Longest Streak</span>
                  </div>
                  <div>
                    <b className="block text-violet-400 text-lg">#{data?.rank || '—'}</b>
                    <span className="text-[10px] text-gray-400 uppercase">Global Rank</span>
                  </div>
                </div>
              </div>

              {/* Quick Settings Form */}
              <form onSubmit={handleSaveProfileFields} className="profile-settings-form">
                <div className="form-group-game">
                  <label htmlFor="collegeInput">College / Institution</label>
                  <input
                    id="collegeInput"
                    type="text"
                    placeholder="Enter your college"
                    value={collegeVal}
                    onChange={(e) => setCollegeVal(e.target.value)}
                  />
                </div>
                <div className="form-group-game">
                  <label htmlFor="companyInput">Target Prep Company</label>
                  <input
                    id="companyInput"
                    type="text"
                    placeholder="e.g. Google, Amazon"
                    value={companyVal}
                    onChange={(e) => setCompanyVal(e.target.value)}
                  />
                </div>
                <button type="submit" className="game-btn-save w-full mt-2">
                  Update Affiliations
                </button>
              </form>
            </div>

            {/* Right: Streak Calendar */}
            <div className="lg:col-span-2 space-y-6">
              <div className="streak-calendar-wrapper">
                <div className="streak-calendar-header">
                  <div>
                    <h3 className="text-base font-bold text-violet-300">Streak Calendar Tracker</h3>
                    <p className="text-xs text-gray-400">Complete exercises daily to maintain consistency.</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                    <FiCheckCircle />
                    <span>Active Streak: {streak?.current || 0} days</span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 mt-4">
                  {getCalendarDays().map((day, idx) => (
                    <div
                      key={idx}
                      className={`calendar-day-cell ${day.isActive ? 'active-day' : ''}`}
                    >
                      <span className="calendar-day-label">{day.weekday}</span>
                      <span className="font-extrabold text-sm">{day.dayNum}</span>
                      {day.isActive && <FiCheck className="absolute bottom-1 text-[10px]" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Challenges preview */}
              <div className="challenge-panel">
                <h3 className="text-base font-bold text-violet-300 mb-3">Daily & Weekly Milestones</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {data?.challenges?.slice(0, 3).map((c) => (
                    <article className="border border-white/5 bg-white/[0.01] rounded-lg p-3 relative flex flex-col justify-between" key={c._id}>
                      <div>
                        <div className="flex justify-between items-start">
                          <b className="text-xs block text-violet-200">{c.title}</b>
                          {c.completed && <FiCheckCircle className="text-emerald-400" />}
                        </div>
                        <small className="text-[10px] text-gray-400 uppercase mt-1 block">{c.type} · +{c.rewardXp} XP</small>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{c.progress} / {c.target}</span>
                        </div>
                        <i>
                          <em style={{ width: `${Math.min(100, (c.progress / c.target) * 100)}%` }} />
                        </i>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Find Friends Finder */}
            <div className="col-span-1 flex flex-col gap-4">
              <div className="friends-search-panel">
                <h3 className="text-sm font-bold text-violet-300 mb-2">Find Learning Partners</h3>
                <form onSubmit={handleSearchSubmit} className="friends-search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search user name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="game-btn-save">
                    <FiSearch />
                  </button>
                </form>

                <div className="search-results-list mt-3">
                  {searchResults.length > 0 ? (
                    searchResults.map((user) => {
                      const isFriend = data?.friends?.some(f => String(f._id || f) === String(user._id));
                      return (
                        <div className="search-user-row" key={user._id}>
                          <div className="search-user-info">
                            <div className="search-user-avatar">
                              {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="search-user-details">
                              <b>{user.name}</b>
                              <span>Level {user.level || 1} · {user.xp || 0} XP</span>
                            </div>
                          </div>
                          {isFriend ? (
                            <button
                              onClick={() => handleRemoveFriend(user._id)}
                              className="btn-remove-friend"
                            >
                              Unfollow
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddFriend(user._id)}
                              className="btn-add-friend"
                            >
                              <FiUserPlus /> Follow
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    searchQuery && <p className="text-xs text-gray-500 text-center py-2">No users match your query.</p>
                  )}
                </div>
              </div>

              {/* Following Friends list */}
              <div className="border border-white/8 bg-white/[0.01] rounded-xl p-4">
                <h3 className="text-sm font-bold text-violet-300 mb-3">Friends List ({data?.friends?.length || 0})</h3>
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {data?.friends?.length ? (
                    data.friends.map((friend) => (
                      <div className="flex items-center justify-between" key={friend._id}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-xs">
                            {friend.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{friend.name}</p>
                            <span className="text-[10px] text-gray-400">LVL {friend.level || 1}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFriend(friend._id)}
                          className="text-[10px] text-rose-300 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">You aren't following anyone yet. Search users above to build a peer list!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Leaderboard lists */}
            <div className="lg:col-span-2">
              <div className="leaderboard-panel mt-0">
                <div className="leaderboard-filters flex justify-between flex-wrap gap-2 mb-4">
                  {/* Period Filters */}
                  <div className="btn-group-game">
                    {[
                      ['all', 'All-Time'],
                      ['weekly', 'Weekly'],
                      ['monthly', 'Monthly']
                    ].map(([p, label]) => (
                      <button
                        key={p}
                        onClick={() => setLeadPeriod(p)}
                        className={leadPeriod === p ? 'active' : ''}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Scope Filters */}
                  <div className="btn-group-game">
                    {[
                      ['global', 'Global'],
                      ['college', 'College'],
                      ['company', 'Company'],
                      ['friends', 'Friends']
                    ].map(([s, label]) => (
                      <button
                        key={s}
                        onClick={() => setLeadScope(s)}
                        className={leadScope === s ? 'active' : ''}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="leaderboard-list">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((user, index) => {
                      const rank = index + 1;
                      const hasFrame = user.selectedFrame;
                      return (
                        <article
                          key={`${user.name}-${index}`}
                          className={`leaderboard-list-row ${rank <= 3 ? 'top' : ''} leaderboard-rank-${rank}`}
                        >
                          <span>{rank}</span>
                          <div className={`leader-avatar flex items-center justify-center relative ${hasFrame ? `frame-${user.selectedFrame}` : ''}`}>
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <b>{user.name}</b>
                            {user.selectedTitle && (
                              <span className="block text-[8px] text-violet-400 font-bold uppercase tracking-wider">
                                {user.selectedTitle.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <small>Level {user.level || 1} · {user.streak || 0} day streak</small>
                          <strong>{user.xp} XP</strong>
                        </article>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">No records found for this scope.</p>
                      {leadScope === 'college' && !data?.college && (
                        <p className="text-xs text-violet-300 mt-2">Hint: Add your college in the Overview tab to view this leaderboard!</p>
                      )}
                      {leadScope === 'company' && !data?.company && (
                        <p className="text-xs text-violet-300 mt-2">Hint: Add your target company in the Overview tab to view this leaderboard!</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Achievements Cabinet & Badges */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Badges Overview */}
            <div className="achievement-panel">
              <header className="mb-4">
                <div>
                  <p className="dash-kicker">TRAINING BADGES</p>
                  <h2>Milestone Progression Tiers</h2>
                </div>
              </header>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { key: 'bronze', label: 'Bronze', emoji: '🥉', desc: 'Basic skills' },
                  { key: 'silver', label: 'Silver', emoji: '🥈', desc: 'Active student' },
                  { key: 'gold', label: 'Gold', emoji: '🥇', desc: 'Advanced status' },
                  { key: 'platinum', label: 'Platinum', emoji: '💎', desc: 'High capability' },
                  { key: 'diamond', label: 'Diamond', emoji: '✨', desc: 'Master level' },
                  { key: 'legend', label: 'Legend', emoji: '👑', desc: 'Prestige ready' }
                ].map((tier) => {
                  const unlockedCount = data?.achievements?.filter(a => a.tier === tier.key).length || 0;
                  return (
                    <div className={`badge ${tier.key} flex flex-col justify-center items-center p-3 border rounded-xl`} key={tier.key}>
                      <span className="text-4xl mb-2">{tier.emoji}</span>
                      <b className="text-sm font-bold">{tier.label}</b>
                      <span className="text-[10px] text-gray-400">{unlockedCount} unlocked</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements Cabinet */}
            <div className="achievement-panel mt-0">
              <h3 className="text-base font-bold text-violet-300 mb-4">Achievement Cabinet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'first_interview', title: 'First Interview', desc: 'Complete your first AI mock interview', tier: 'bronze' },
                  { key: 'resume_master', title: 'Resume Master', desc: 'Achieve an ATS score of 80 or higher', tier: 'gold' },
                  { key: 'hundred_coding', title: 'Coding Champion', desc: 'Solve 100 coding problems (5 for early badge)', tier: 'platinum' },
                  { key: 'community_helper', title: 'Community Helper', desc: 'Write 5 comments/replies to help others', tier: 'silver' },
                  { key: 'ai_interview_expert', title: 'AI Interview Expert', desc: 'Complete 10 AI mock interviews', tier: 'diamond' },
                  { key: 'top_mentor', title: 'Top Mentor', desc: 'Write 10 or more helpful replies', tier: 'legend' },
                  { key: 'top_contributor', title: 'Top Contributor', desc: 'Post 5 community experiences', tier: 'gold' },
                  { key: 'hundred_day_streak', title: 'Consistency King', desc: 'Maintain a 100-day practice streak (7 for early badge)', tier: 'legend' },
                  { key: 'google_ready_badge', title: 'Google Ready', desc: 'Complete 3 Google company prep sessions', tier: 'platinum' },
                  { key: 'amazon_ready_badge', title: 'Amazon Ready', desc: 'Complete 3 Amazon company prep sessions', tier: 'platinum' }
                ].map((item) => {
                  const unlocked = data?.achievements?.find((a) => a.key === item.key);
                  return (
                    <div 
                      key={item.key} 
                      className={`border p-4 rounded-xl flex items-center justify-between ${
                        unlocked 
                          ? 'border-violet-500/30 bg-violet-950/5' 
                          : 'border-white/5 opacity-50 bg-white/[0.01]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <b className="text-sm text-violet-200">{item.title}</b>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-extrabold bg-white/10 ${item.tier}`}>
                            {item.tier}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                      </div>
                      <div className="text-right">
                        {unlocked ? (
                          <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <FiCheckCircle /> Unlocked
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Locked</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Challenges */}
        {activeTab === 'challenges' && (
          <div className="achievement-panel mt-0">
            <h3 className="text-base font-bold text-violet-300 mb-2">Practice Challenges</h3>
            <p className="text-xs text-gray-400 mb-4">Complete target requirements to receive automatic XP & Coin rewards!</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data?.challenges?.map((c) => (
                <div key={c._id} className="border border-white/8 bg-white/[0.02] rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <b className="text-sm font-bold text-violet-100">{c.title}</b>
                      {c.completed ? (
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FiCheck /> Done
                        </span>
                      ) : (
                        <span className="bg-violet-500/10 text-violet-300 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                          {c.type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Target value: {c.target} items</p>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Progress</span>
                      <b className="text-violet-400">{c.progress} / {c.target}</b>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500" 
                        style={{ width: `${Math.min(100, (c.progress / c.target) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-amber-300 bg-amber-500/5 px-2.5 py-1.5 rounded-lg border border-amber-500/10 mt-2">
                      <span>Reward:</span>
                      <span className="font-bold flex items-center gap-2">
                        <span>+{c.rewardXp} XP</span>
                        <span>+{c.rewardCoins} Coins</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Rewards Shop */}
        {activeTab === 'shop' && (
          <div className="achievement-panel mt-0">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-base font-bold text-violet-300">Cosmetics Rewards Shop</h3>
                <p className="text-xs text-gray-400">Unlock custom titles and borders to customize your profile card.</p>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-400 font-bold">
                <FaCoins />
                <span>{data?.coins || 0} Coins</span>
              </div>
            </div>

            {/* shop item grid */}
            <h4 className="text-sm font-bold text-violet-300 mt-6 border-b border-white/5 pb-2">Custom Profile Titles</h4>
            <div className="shop-grid">
              {shopTitles.map((item) => {
                const unlocked = data?.unlockedTitles?.includes(item.id);
                const equipped = data?.selectedTitle === item.id;
                return (
                  <div className="shop-card" key={item.id}>
                    {unlocked && <span className="shop-card-owned-badge">Owned</span>}
                    <div className="shop-card-preview">
                      <span className="profile-title-tag">{item.name}</span>
                    </div>
                    <h5 className="shop-card-name">{item.name}</h5>
                    <p className="shop-card-desc">{item.description}</p>
                    <div className="shop-card-footer">
                      {!unlocked ? (
                        <>
                          <div className="shop-card-price">
                            <FaCoins /> {item.price}
                          </div>
                          <button
                            onClick={() => handleBuyCosmetic(item.id, 'title')}
                            disabled={actionLoading}
                            className="btn-shop-buy"
                          >
                            Purchase
                          </button>
                        </>
                      ) : (
                        <div className="w-full">
                          {equipped ? (
                            <button
                              onClick={() => handleEquipCosmetic(item.id, 'title', false)}
                              className="btn-shop-unequip w-full"
                            >
                              Unequip
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEquipCosmetic(item.id, 'title', true)}
                              className="btn-shop-equip w-full"
                            >
                              Equip
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <h4 className="text-sm font-bold text-violet-300 mt-8 border-b border-white/5 pb-2">Avatar Border Frames</h4>
            <div className="shop-grid">
              {shopFrames.map((item) => {
                const unlocked = data?.unlockedFrames?.includes(item.id);
                const equipped = data?.selectedFrame === item.id;
                return (
                  <div className="shop-card" key={item.id}>
                    {unlocked && <span className="shop-card-owned-badge">Owned</span>}
                    <div className="shop-card-preview">
                      <div className={`avatar-container scale-75 ${item.id ? `frame-${item.id}` : ''}`}>
                        <div className="user-avatar-img text-sm">Preview</div>
                      </div>
                    </div>
                    <h5 className="shop-card-name">{item.name}</h5>
                    <p className="shop-card-desc">{item.description}</p>
                    <div className="shop-card-footer">
                      {!unlocked ? (
                        <>
                          <div className="shop-card-price">
                            <FaCoins /> {item.price}
                          </div>
                          <button
                            onClick={() => handleBuyCosmetic(item.id, 'frame')}
                            disabled={actionLoading}
                            className="btn-shop-buy"
                          >
                            Purchase
                          </button>
                        </>
                      ) : (
                        <div className="w-full">
                          {equipped ? (
                            <button
                              onClick={() => handleEquipCosmetic(item.id, 'frame', false)}
                              className="btn-shop-unequip w-full"
                            >
                              Unequip
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEquipCosmetic(item.id, 'frame', true)}
                              className="btn-shop-equip w-full"
                            >
                              Equip
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 6: Career Score */}
        {activeTab === 'career_score' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="career-score col-span-1 lg:col-span-2">
              <div className="career-header-row">
                <div>
                  <p className="dash-kicker">CAREER READINESS</p>
                  <h2>Career Readiness Dashboard</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Overall Score</span>
                  <strong className="block text-3xl font-black text-violet-400">{career?.overall || 0} / 100</strong>
                </div>
              </div>

              {/* Chart */}
              <div className="h-[250px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Resume', score: career?.resume || 0 },
                      { name: 'Coding', score: career?.coding || 0 },
                      { name: 'Comm.', score: career?.communication || 0 },
                      { name: 'Projects', score: career?.projects || 0 },
                      { name: 'Community', score: career?.community || 0 },
                      { name: 'Learning', score: career?.learning || 0 }
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.4)" domain={[0, 100]} fontSize={10} />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(20,20,30,0.95)', borderColor: '#8b5cf6', color: '#fff', borderRadius: '8px' }}
                      labelStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {[0, 1, 2, 3, 4, 5].map((_, index) => (
                        <Cell key={index} fill={index % 2 === 0 ? '#8b5cf6' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Suggestions list */}
            <div className="career-score col-span-1">
              <h3 className="text-base font-bold text-violet-300">Action Recommendations</h3>
              <p className="text-xs text-gray-400 mt-1">Suggested steps based on your current preparedness indicators.</p>

              <div className="career-suggestions mt-4">
                <h4>Resume suggestions (Score: {career?.resume}%)</h4>
                <ul>
                  <li>Improve ATS scores by uploading your updated experience files.</li>
                  <li>Incorporate relevant industry keywords to match hiring algorithms.</li>
                </ul>
              </div>

              <div className="career-suggestions mt-3">
                <h4>Coding skills (Score: {career?.coding}%)</h4>
                <ul>
                  <li>Solve intermediate algorithms on the Coding Platform.</li>
                  <li>Focus on data structures (linked lists, trees).</li>
                </ul>
              </div>

              <div className="career-suggestions mt-3">
                <h4>Communication (Score: {career?.communication}%)</h4>
                <ul>
                  <li>Attend at least 3 AI Mock Interview rooms.</li>
                  <li>Verify vocabulary and grammar accuracy indicators.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Reward History */}
        {activeTab === 'history' && (
          <div className="reward-panel mt-0">
            <header className="mb-4">
              <div>
                <p className="dash-kicker">HISTORY OF ACTIONS</p>
                <h2>Reward log timeline</h2>
              </div>
            </header>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {data?.activities?.length ? (
                data.activities.map((activity) => (
                  <article className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-lg" key={activity._id}>
                    <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm">
                      <FiCheckCircle />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-200">{activity.description || activity.action}</p>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{new Date(activity.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-emerald-400 text-xs font-bold font-mono">+{activity.xp} XP</span>
                      {activity.coins > 0 && (
                        <span className="block text-amber-300 text-[10px] font-bold font-mono">+{activity.coins} Coins</span>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <p className="game-empty text-center py-4">No recent rewards activity recorded.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
