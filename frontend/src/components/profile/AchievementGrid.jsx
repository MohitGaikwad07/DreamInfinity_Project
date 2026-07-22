import React from 'react';
import { FiAward, FiZap, FiTarget, FiActivity, FiTrendingUp } from 'react-icons/fi';

export const AchievementGrid = ({ achievements, activity }) => {
  const data = achievements || {
    xp: 0,
    level: 1,
    longestStreak: 0,
    careerScore: 0,
    interviewReadiness: 0,
    badges: []
  };

  const getRank = (lvl) => {
    if (lvl >= 30) return 'Grandmaster';
    if (lvl >= 20) return 'Master';
    if (lvl >= 10) return 'Expert';
    if (lvl >= 5) return 'Specialist';
    return 'Novice';
  };

  const getBadgeClass = (tier) => {
    switch (tier) {
      case 'gold': return 'gold';
      case 'silver': return 'silver';
      case 'bronze': return 'bronze';
      case 'platinum':
      case 'diamond':
      case 'legend':
      default:
        return 'platinum';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-violet-100">Achievements & Rankings</h2>
        <p className="text-xs text-violet-100/50 mt-0.5">Platform engagement indicators and gamification statistics.</p>
      </div>

      <div className="achievement-grid">
        {/* Streak card */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <span className="p-2 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-300">
            <FiActivity />
          </span>
          <div>
            <span className="text-[10px] text-violet-100/40 uppercase tracking-wider font-bold">Longest Streak</span>
            <p className="text-sm font-extrabold text-white mt-0.5">{data.longestStreak} Days</p>
            <span className="text-[10px] text-violet-100/40 font-semibold">Mock Practice</span>
          </div>
        </div>

        {/* Readiness card */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <span className="p-2 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-300">
            <FiTarget />
          </span>
          <div>
            <span className="text-[10px] text-violet-100/40 uppercase tracking-wider font-bold">Readiness</span>
            <p className="text-sm font-extrabold text-white mt-0.5">{data.interviewReadiness}% Avg</p>
            <span className="text-[10px] text-violet-100/40 font-semibold">Interview Score</span>
          </div>
        </div>
      </div>

      {/* Badges Earned */}
      <div className="glass-card rounded-3xl p-5">
        <h3 className="text-xs font-extrabold text-violet-300 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
          Earned Badges
        </h3>
        
        {data.badges.length === 0 ? (
          <p className="text-xs text-violet-100/40 text-center py-4 italic">No credentials badges unlocked yet. Solve coding challenges to earn badges.</p>
        ) : (
          <div className="badge-grid mt-0">
            {data.badges.map((b) => (
              <article key={b.key} className={`badge ${getBadgeClass(b.tier)}`}>
                <FiAward />
                <b>{b.title}</b>
                <span>{b.tier.toUpperCase()} Tier</span>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
