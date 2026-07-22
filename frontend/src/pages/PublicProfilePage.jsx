import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicProfile, resetPublicProfile } from '../redux/slices/profileSlice.js';
import { ProfileHeader } from '../components/profile/ProfileHeader.jsx';
import { ProfileSidebar } from '../components/profile/ProfileSidebar.jsx';
import { CareerScore } from '../components/profile/CareerScore.jsx';
import { ProjectCards } from '../components/profile/ProjectCards.jsx';
import { SkillCards } from '../components/profile/SkillCards.jsx';
import { CertificateCards } from '../components/profile/CertificateCards.jsx';
import { FiDownload, FiTwitter, FiMessageCircle, FiMail, FiArrowLeft, FiAward, FiCode, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const PublicProfilePage = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { publicProfile, publicActivity, loading, error } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchPublicProfile(username));
    return () => {
      dispatch(resetPublicProfile());
    };
  }, [dispatch, username]);

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleExportAiSummary = () => {
    if (!publicProfile) return;
    
    const summaryText = `
DREAM INFINITY CAREER PORTFOLIO SUMMARY
==================================
Name: ${publicActivity?.user?.name || 'Professional User'}
Role: ${publicProfile.headline || 'Software Engineer'}
Location: ${publicProfile.location || ''}

AI SKILL RATINGS
----------------
Overall score: ${publicProfile.aiSkillScores?.overall || 0}%
Programming: ${publicProfile.aiSkillScores?.programming || 0}%
Frontend: ${publicProfile.aiSkillScores?.frontend || 0}%
Backend: ${publicProfile.aiSkillScores?.backend || 0}%
Database: ${publicProfile.aiSkillScores?.database || 0}%
Communication: ${publicProfile.aiSkillScores?.communication || 0}%
Problem solving: ${publicProfile.aiSkillScores?.problemSolving || 0}%

AI PROFESSIONAL SUMMARY
-----------------------
${publicProfile.aiCareerSummary?.summary || 'Summary not generated.'}

CAREER GOALS
------------
${publicProfile.aiCareerSummary?.careerGoal || ''}

STRENGTHS
---------
${publicProfile.aiCareerSummary?.strengths?.map(s => `- ${s}`).join('\n') || ''}

WEAKNESSES / IMPROVEMENTS
-------------------------
${publicProfile.aiCareerSummary?.weaknesses?.map(w => `- ${w}`).join('\n') || ''}

PROJECTS BUILT
--------------
${publicProfile.projects?.map(p => `- ${p.title}: ${p.description || ''}`).join('\n') || 'None'}
`;

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${username}_career_summary.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen public-portfolio-wrapper">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
        <p className="text-violet-200/50 text-xs mt-3.5">Loading public career portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen public-portfolio-wrapper p-6 text-center">
        <p className="text-rose-400 font-bold text-sm">Failed to access public profile</p>
        <p className="text-violet-100/50 text-xs mt-1">{error}</p>
        <Link to="/" className="secondary-button !py-2 !px-4 !text-xs mt-6 flex items-center gap-1.5 no-print">
          <FiArrowLeft /> Back to Landing Page
        </Link>
      </div>
    );
  }

  if (!publicProfile) return null;

  const portfolioUrl = window.location.href;
  const shareText = `Check out ${publicActivity?.user?.name || 'my'} professional AI Career Portfolio on Dream Infinity!`;

  return (
    <div className="public-portfolio-wrapper">
      {/* Action panel no-print */}
      <div className="bg-neutral-900/50 border-b border-white/5 py-4 px-6 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <Link to="/dashboard" className="text-xs text-violet-300 hover:text-white flex items-center gap-1.5 font-bold">
            <FiArrowLeft /> Return to Platform Dashboard
          </Link>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportAiSummary} 
              className="secondary-button !py-1.5 !px-3 !text-xs flex items-center gap-1.5 font-bold"
            >
              Export AI Summary (.txt)
            </button>
            <button 
              onClick={handleDownloadPdf} 
              className="primary-button !w-auto !py-1.5 !px-3.5 !text-xs flex items-center gap-1.5"
            >
              <FiDownload /> Export Portfolio PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="public-container space-y-6">
        {/* Banner header */}
        <ProfileHeader profile={publicProfile} activity={publicActivity} isPublic={true} />

        {/* Dynamic score ratings */}
        <CareerScore scores={publicProfile.aiSkillScores} />

        {/* 2-column details section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column info */}
          <div className="space-y-6">
            <ProfileSidebar profile={publicProfile} activity={publicActivity} isPublic={true} />
            
            {/* Social shares no-print */}
            <div className="glass-card rounded-3xl p-5 space-y-3 no-print">
              <h3 className="text-xs font-extrabold text-violet-200 uppercase tracking-widest text-center">Share This Profile</h3>
              <div className="grid grid-cols-3 gap-2">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(portfolioUrl)}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 bg-white/5 border border-white/10 hover:border-violet-600/30 rounded-xl text-violet-300 transition-all text-xs"
                >
                  <FiTwitter className="text-base mb-1" /> Twitter / X
                </a>
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + portfolioUrl)}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 bg-white/5 border border-white/10 hover:border-violet-600/30 rounded-xl text-violet-300 transition-all text-xs"
                >
                  <FiMessageCircle className="text-base mb-1" /> WhatsApp
                </a>
                <a 
                  href={`mailto:?subject=${encodeURIComponent('Dream Infinity Career Portfolio')}&body=${encodeURIComponent(shareText + '\n\n' + portfolioUrl)}`}
                  className="flex flex-col items-center justify-center p-2.5 bg-white/5 border border-white/10 hover:border-violet-600/30 rounded-xl text-violet-300 transition-all text-xs"
                >
                  <FiMail className="text-base mb-1" /> Email
                </a>
              </div>
            </div>
          </div>

          {/* Right Column details */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI career summary */}
            {publicProfile.aiCareerSummary?.summary && (
              <div className="glass-card rounded-3xl p-5 space-y-3">
                <h3 className="text-sm font-extrabold text-violet-300 uppercase tracking-wider">AI Executive Summary</h3>
                <p className="text-xs text-violet-100/80 leading-relaxed font-medium">
                  {publicProfile.aiCareerSummary.summary}
                </p>
                {publicProfile.aiCareerSummary.careerGoal && (
                  <div className="border-t border-white/5 pt-3 mt-3">
                    <span className="text-[10px] text-violet-100/40 uppercase font-bold tracking-wider">Target Goal Direction</span>
                    <p className="text-xs text-violet-200 mt-1 italic font-semibold">&ldquo;{publicProfile.aiCareerSummary.careerGoal}&rdquo;</p>
                  </div>
                )}
              </div>
            )}

            {/* Projects cards */}
            <ProjectCards projects={publicProfile.projects} isPublic={true} />

            {/* Skills & Certificates */}
            <SkillCards skills={publicProfile.skills} isPublic={true} />
            <CertificateCards certificates={publicProfile.certificates} isPublic={true} />

            {/* Achievements & Timeline prints */}
            {publicActivity?.achievements && (
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-violet-300 uppercase tracking-wider">Achievements & Badges</h3>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/2 border border-white/5 rounded-2xl p-3 flex items-center gap-2.5">
                    <FiCode className="text-violet-300" />
                    <div>
                      <span className="text-[9px] text-violet-100/40 uppercase font-bold">Coding Score</span>
                      <p className="text-sm font-extrabold text-white mt-0.5">{publicActivity.codingHistory?.codingScore || 0}% Accuracy</p>
                    </div>
                  </div>
                  <div className="bg-white/2 border border-white/5 rounded-2xl p-3 flex items-center gap-2.5">
                    <FiAward className="text-violet-300" />
                    <div>
                      <span className="text-[9px] text-violet-100/40 uppercase font-bold">Mock Readiness</span>
                      <p className="text-sm font-extrabold text-white mt-0.5">{publicActivity.interviewHistory?.averageScore || 0}% Index</p>
                    </div>
                  </div>
                </div>

                {publicActivity.achievements.badges?.length > 0 && (
                  <div className="border-t border-white/5 pt-3.5 space-y-2">
                    <span className="text-[10px] text-violet-100/40 uppercase font-bold tracking-widest">Unlocked Credentials</span>
                    <div className="flex flex-wrap gap-1.5">
                      {publicActivity.achievements.badges.map(badge => (
                        <span key={badge.key} className="text-[10px] font-bold px-2 py-0.5 border border-violet-600/20 bg-violet-600/5 text-violet-300 rounded-md">
                          {badge.title} ({badge.tier.toUpperCase()})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
