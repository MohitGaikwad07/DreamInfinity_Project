import React from 'react';
import { FiGlobe, FiCornerRightDown } from 'react-icons/fi';
import { SocialLinks } from './SocialLinks.jsx';

export const PortfolioPreview = ({ profile, activity }) => {
  const publicShareUrl = `${window.location.origin}/u/${profile?.username || ''}`;

  return (
    <div className="glass-card rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h2 className="text-base font-bold text-violet-100">Live Portfolio Preview</h2>
          <p className="text-xs text-violet-100/50 mt-0.5">Real-time simulation of recruiter and public landing views.</p>
        </div>
        <a 
          href={`/u/${profile?.username}`} 
          target="_blank" 
          rel="noreferrer" 
          className="text-xs text-violet-300 hover:text-white flex items-center gap-1 font-semibold"
        >
          <FiGlobe /> Open Live View
        </a>
      </div>

      {/* Mock Browser Container */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-neutral-950/40 shadow-inner">
        {/* Browser Topbar */}
        <div className="flex items-center justify-between bg-neutral-900/60 px-4 py-2 border-b border-white/5">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500/40"></span>
            <span className="h-2 w-2 rounded-full bg-amber-500/40"></span>
            <span className="h-2 w-2 rounded-full bg-emerald-500/40"></span>
          </div>
          <div className="bg-black/35 rounded-lg px-6 py-0.5 text-[10px] text-violet-100/30 truncate max-w-xs select-none">
            {publicShareUrl}
          </div>
          <div className="w-8"></div>
        </div>

        {/* Browser Page Body */}
        <div className="p-5 space-y-4 text-left max-h-[350px] overflow-y-auto">
          {/* Header block mock */}
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex-shrink-0 flex items-center justify-center font-extrabold text-sm text-white">
              {profile?.user?.name?.slice(0, 1) || activity?.user?.name?.slice(0, 1) || 'U'}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">{activity?.user?.name || 'Professional User'}</h3>
              <p className="text-[10px] text-violet-300 font-semibold">{profile?.headline || 'Interview Candidate @ Dream Infinity'}</p>
              <p className="text-[9px] text-violet-100/50 mt-1">{profile?.location || 'Location not configured'}</p>
            </div>
          </div>

          {/* Social icons mock */}
          <div className="border-t border-white/5 pt-3 flex justify-between items-center">
            <SocialLinks socialLinks={profile?.socialLinks} />
            <span className="text-[9px] text-violet-400 font-bold px-2 py-0.5 bg-violet-600/10 border border-violet-600/20 rounded">
              Ready to Interview
            </span>
          </div>

          {/* Bio preview */}
          {profile?.bio && (
            <div className="bg-white/2 p-3 rounded-xl border border-white/5 text-[10px] text-violet-100/70 leading-relaxed">
              {profile.bio}
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-[10px]">
            <div className="bg-white/2 p-2.5 rounded-xl border border-white/5">
              <span className="text-violet-100/40 uppercase tracking-wider font-extrabold text-[8px]">Projects count</span>
              <p className="text-sm font-extrabold text-white mt-0.5">{profile?.projects?.length || 0} Builds</p>
            </div>
            <div className="bg-white/2 p-2.5 rounded-xl border border-white/5">
              <span className="text-violet-100/40 uppercase tracking-wider font-extrabold text-[8px]">Credentials</span>
              <p className="text-sm font-extrabold text-white mt-0.5">{profile?.certificates?.length || 0} Badges</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
