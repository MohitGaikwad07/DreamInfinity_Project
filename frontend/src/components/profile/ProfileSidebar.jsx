import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiGithub, FiLinkedin, FiGlobe, FiShare2, FiEye, FiEyeOff, FiCheck, FiSettings } from 'react-icons/fi';
import { updateProfileDetails } from '../../redux/slices/profileSlice.js';
import toast from 'react-hot-toast';

export const ProfileSidebar = ({ profile, activity, isPublic = false }) => {
  const dispatch = useDispatch();
  const [editingSocial, setEditingSocial] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Social fields
  const [linkedin, setLinkedin] = useState(profile?.socialLinks?.linkedin || '');
  const [github, setGithub] = useState(profile?.socialLinks?.github || '');
  const [portfolioWebsite, setPortfolioWebsite] = useState(profile?.socialLinks?.portfolioWebsite || '');

  // Privacy states
  const [publicProfile, setPublicProfile] = useState(profile?.privacySettings?.publicProfile ?? true);
  const [recruiterView, setRecruiterView] = useState(profile?.privacySettings?.recruiterView ?? true);
  const [hideEmail, setHideEmail] = useState(profile?.privacySettings?.hideEmail ?? false);
  const [hidePhone, setHidePhone] = useState(profile?.privacySettings?.hidePhone ?? false);
  const [hideResume, setHideResume] = useState(profile?.privacySettings?.hideResume ?? false);

  const handleTogglePrivacy = async (key, val) => {
    if (isPublic) return;
    try {
      const updatedPrivacy = {
        publicProfile,
        recruiterView,
        hideEmail,
        hidePhone,
        hideResume,
        [key]: val
      };
      
      // Update local state first for responsiveness
      if (key === 'publicProfile') setPublicProfile(val);
      if (key === 'recruiterView') setRecruiterView(val);
      if (key === 'hideEmail') setHideEmail(val);
      if (key === 'hidePhone') setHidePhone(val);
      if (key === 'hideResume') setHideResume(val);

      const result = await dispatch(updateProfileDetails({ privacySettings: updatedPrivacy }));
      if (updateProfileDetails.fulfilled.match(result)) {
        toast.success('Privacy settings updated.');
      } else {
        toast.error('Failed to save privacy settings.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  const handleSaveSocials = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(updateProfileDetails({
        socialLinks: { linkedin, github, portfolioWebsite }
      }));
      if (updateProfileDetails.fulfilled.match(result)) {
        toast.success('Social links updated.');
        setEditingSocial(false);
      } else {
        toast.error('Failed to update social links.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  // Generate public sharing link
  const publicShareUrl = `${window.location.origin}/u/${profile?.username || ''}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    toast.success('Public URL copied to clipboard!');
  };

  return (
    <div className="space-y-5">
      {/* Share / QR Code section */}
      <div className="glass-card rounded-3xl p-5 text-center">
        <h2 className="text-sm font-extrabold text-violet-200 uppercase tracking-widest mb-3">Portfolio Sharing</h2>
        <div className="space-y-2">
          <button 
            onClick={copyShareLink} 
            className="primary-button !py-2.5 flex items-center justify-center gap-2 text-xs w-full"
          >
            <FiShare2 /> Copy Portfolio URL
          </button>
          
          <button 
            onClick={() => setShowQr(!showQr)} 
            className="secondary-button py-2.5 flex items-center justify-center gap-2 text-xs w-full"
          >
            <FiCheck /> {showQr ? 'Hide QR Code' : 'Generate QR Code'}
          </button>
        </div>

        {showQr && (
          <div className="mt-4 p-3 bg-white rounded-2xl inline-block shadow-lg animate-fade-in transition-all">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicShareUrl)}`} 
              alt="QR Code to Share Portfolio" 
              className="mx-auto"
            />
            <p className="text-[10px] text-neutral-600 font-bold mt-2">Scan to View Portfolio</p>
          </div>
        )}
      </div>

      {/* Social Links Panel */}
      <div className="glass-card rounded-3xl p-5 hover-action-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold text-violet-200 uppercase tracking-widest">Connect</h2>
          {!isPublic && (
            <button 
              onClick={() => setEditingSocial(true)} 
              className="text-violet-300 hover:text-white text-xs font-semibold no-print"
            >
              Configure
            </button>
          )}
        </div>

        <div className="space-y-3.5">
          {github ? (
            <a href={github.startsWith('http') ? github : `https://${github}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-violet-100/80 hover:text-white transition text-xs md:text-sm">
              <FiGithub className="text-base text-violet-300" />
              <span className="truncate">GitHub Profile</span>
            </a>
          ) : (
            <span className="flex items-center gap-3 text-violet-100/40 text-xs">
              <FiGithub className="text-base" /> GitHub not linked
            </span>
          )}

          {linkedin ? (
            <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-violet-100/80 hover:text-white transition text-xs md:text-sm">
              <FiLinkedin className="text-base text-violet-300" />
              <span className="truncate">LinkedIn Profile</span>
            </a>
          ) : (
            <span className="flex items-center gap-3 text-violet-100/40 text-xs">
              <FiLinkedin className="text-base" /> LinkedIn not linked
            </span>
          )}

          {portfolioWebsite ? (
            <a href={portfolioWebsite.startsWith('http') ? portfolioWebsite : `https://${portfolioWebsite}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-violet-100/80 hover:text-white transition text-xs md:text-sm">
              <FiGlobe className="text-base text-violet-300" />
              <span className="truncate">Portfolio Web</span>
            </a>
          ) : (
            <span className="flex items-center gap-3 text-violet-100/40 text-xs">
              <FiGlobe className="text-base" /> Website not linked
            </span>
          )}
        </div>
      </div>

      {/* Privacy Settings Panel */}
      {!isPublic && (
        <div className="glass-card rounded-3xl p-5 space-y-4 no-print">
          <h2 className="text-sm font-extrabold text-violet-200 uppercase tracking-widest">Privacy Toggles</h2>
          
          <div className="space-y-3.5">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-violet-100">Public Portfolio</span>
                <span className="text-[10px] text-violet-100/40">Visible at /u/{profile?.username}</span>
              </div>
              <input 
                type="checkbox" 
                checked={publicProfile} 
                onChange={(e) => handleTogglePrivacy('publicProfile', e.target.checked)} 
                className="w-4 h-4 accent-violet-600 rounded bg-neutral-900 border-white/10"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-violet-100">Recruiter View</span>
                <span className="text-[10px] text-violet-100/40">Special badge access</span>
              </div>
              <input 
                type="checkbox" 
                checked={recruiterView} 
                onChange={(e) => handleTogglePrivacy('recruiterView', e.target.checked)} 
                className="w-4 h-4 accent-violet-600 rounded bg-neutral-900 border-white/10"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-violet-100">Anonymize Contact</span>
                <span className="text-[10px] text-violet-100/40">Hide Email & Phone</span>
              </div>
              <input 
                type="checkbox" 
                checked={hideEmail && hidePhone} 
                onChange={(e) => {
                  handleTogglePrivacy('hideEmail', e.target.checked);
                  handleTogglePrivacy('hidePhone', e.target.checked);
                }} 
                className="w-4 h-4 accent-violet-600 rounded bg-neutral-900 border-white/10"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-violet-100">Hide Resume</span>
                <span className="text-[10px] text-violet-100/40">Block file downloads</span>
              </div>
              <input 
                type="checkbox" 
                checked={hideResume} 
                onChange={(e) => handleTogglePrivacy('hideResume', e.target.checked)} 
                className="w-4 h-4 accent-violet-600 rounded bg-neutral-900 border-white/10"
              />
            </label>
          </div>
        </div>
      )}

      {/* Edit Social Modal */}
      {editingSocial && (
        <div className="community-modal no-print">
          <form onSubmit={handleSaveSocials} className="space-y-4">
            <h2 className="text-lg font-bold text-violet-100">Configure Portfolio Connections</h2>
            
            <label className="block text-xs text-violet-100/70">
              GitHub Profile Link
              <input 
                type="text" 
                value={github} 
                onChange={(e) => setGithub(e.target.value)} 
                placeholder="github.com/yourusername" 
                className="field mt-1" 
              />
            </label>

            <label className="block text-xs text-violet-100/70">
              LinkedIn Profile Link
              <input 
                type="text" 
                value={linkedin} 
                onChange={(e) => setLinkedin(e.target.value)} 
                placeholder="linkedin.com/in/yourusername" 
                className="field mt-1" 
              />
            </label>

            <label className="block text-xs text-violet-100/70">
              Portfolio / Website Link
              <input 
                type="text" 
                value={portfolioWebsite} 
                onChange={(e) => setPortfolioWebsite(e.target.value)} 
                placeholder="www.yourportfolio.com" 
                className="field mt-1" 
              />
            </label>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setEditingSocial(false)} 
                className="secondary-button !py-2 !px-4 !text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="primary-button !w-auto !py-2 !px-5 !text-xs"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
