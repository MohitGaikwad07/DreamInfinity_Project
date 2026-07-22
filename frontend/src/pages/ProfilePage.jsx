import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProfile, 
  triggerAiSummary, 
  triggerAiReview 
} from '../redux/slices/profileSlice.js';
import { ProfileHeader } from '../components/profile/ProfileHeader.jsx';
import { ProfileSidebar } from '../components/profile/ProfileSidebar.jsx';
import { CareerScore } from '../components/profile/CareerScore.jsx';
import { ProjectCards } from '../components/profile/ProjectCards.jsx';
import { CertificateCards } from '../components/profile/CertificateCards.jsx';
import { SkillCards } from '../components/profile/SkillCards.jsx';
import { AchievementGrid } from '../components/profile/AchievementGrid.jsx';
import { ActivityTimeline } from '../components/profile/ActivityTimeline.jsx';
import { PortfolioPreview } from '../components/profile/PortfolioPreview.jsx';
import { FiAward, FiTarget, FiZap, FiBookOpen, FiCpu, FiTrendingUp, FiActivity, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const { 
    profile, 
    activity, 
    loading, 
    error, 
    aiSummaryLoading, 
    aiReviewLoading 
  } = useSelector((state) => state.profile);

  const [activeTab, setActiveTab] = useState('overview'); // overview, projects, skills_certs, ai_insights, activity

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleGenerateSummary = async () => {
    try {
      const res = await dispatch(triggerAiSummary());
      if (triggerAiSummary.fulfilled.match(res)) {
        toast.success('AI Career Summary generated!');
      } else {
        toast.error('Failed to generate summary.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  const handleGenerateReview = async () => {
    try {
      const res = await dispatch(triggerAiReview());
      if (triggerAiReview.fulfilled.match(res)) {
        toast.success('AI Portfolio Review completed!');
      } else {
        toast.error('Failed to execute AI review.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
        <p className="text-violet-200/50 text-xs mt-3.5">Loading your Career Dashboard...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <p className="text-rose-400 font-bold text-sm">Failed to load profile details</p>
        <p className="text-violet-100/50 text-xs mt-1">{error}</p>
        <button 
          onClick={() => dispatch(fetchProfile())} 
          className="secondary-button !py-2 !px-4 !text-xs mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div>
        <p className="dash-kicker">MODULE 14</p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-violet-100 tracking-tight flex items-center gap-2">
          Career Dashboard <span className="text-violet-400">&</span> Portfolio
        </h1>
        <p className="text-violet-100/50 text-xs md:text-sm mt-1">
          Review, manage, and share your technical credentials, live activity metrics, and AI recommendations.
        </p>
      </div>

      {/* Main Container */}
      <div className="profile-container">
        {/* Sidebar Left */}
        <div className="space-y-5">
          <ProfileSidebar profile={profile} activity={activity} />
        </div>

        {/* Content Right */}
        <div className="space-y-5">
          <ProfileHeader profile={profile} activity={activity} />
          
          <CareerScore scores={profile?.aiSkillScores} />

          {/* Navigation tabs */}
          <div className="profile-tabs">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('projects')} 
              className={`profile-tab ${activeTab === 'projects' ? 'active' : ''}`}
            >
              Projects ({profile?.projects?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('skills_certs')} 
              className={`profile-tab ${activeTab === 'skills_certs' ? 'active' : ''}`}
            >
              Skills & Credentials
            </button>
            <button 
              onClick={() => setActiveTab('ai_insights')} 
              className={`profile-tab ${activeTab === 'ai_insights' ? 'active' : ''}`}
            >
              AI Insights & Reviews
            </button>
            <button 
              onClick={() => setActiveTab('activity')} 
              className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
            >
              Timeline & Stats
            </button>
          </div>

          {/* TAB CONTENTS */}
          
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {profile?.aiCareerSummary?.summary ? (
                <div className="glass-card rounded-3xl p-5 space-y-3.5">
                  <h3 className="text-sm font-extrabold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FiCpu /> Executive Summary
                  </h3>
                  <p className="text-xs text-violet-100/80 leading-relaxed font-medium">
                    {profile.aiCareerSummary.summary}
                  </p>
                  {profile.aiCareerSummary.careerGoal && (
                    <div className="border-t border-white/5 pt-3.5">
                      <span className="text-[10px] text-violet-100/40 uppercase tracking-widest font-bold">Career Goal Direction</span>
                      <p className="text-xs text-violet-200 mt-1 italic font-semibold">&ldquo;{profile.aiCareerSummary.careerGoal}&rdquo;</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-6 text-center space-y-3">
                  <p className="text-xs text-violet-100/50">Your professional summary has not been generated by AI yet.</p>
                  <button 
                    onClick={handleGenerateSummary} 
                    className="primary-button !w-auto !py-2 !px-4 !text-xs"
                    disabled={aiSummaryLoading}
                  >
                    {aiSummaryLoading ? 'Generating Summary...' : 'Generate AI Career Summary'}
                  </button>
                </div>
              )}

              <PortfolioPreview profile={profile} activity={activity} />
            </div>
          )}

          {/* Projects */}
          {activeTab === 'projects' && (
            <ProjectCards projects={profile?.projects} />
          )}

          {/* Skills & Credentials */}
          {activeTab === 'skills_certs' && (
            <div className="space-y-5">
              <SkillCards skills={profile?.skills} />
              <CertificateCards certificates={profile?.certificates} />
            </div>
          )}

          {/* AI Insights & Reviews */}
          {activeTab === 'ai_insights' && (
            <div className="space-y-5">
              {/* AI Career Summary Box */}
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-violet-100 uppercase tracking-wider flex items-center gap-1.5">
                      <FiCpu /> AI Career Summary
                    </h3>
                    <p className="text-[11px] text-violet-100/50 mt-0.5">Gemini-powered evaluation of strengths, weaknesses and skills roadmap.</p>
                  </div>
                  <button 
                    onClick={handleGenerateSummary} 
                    className="primary-button !w-auto !py-1.5 !px-3 !text-xs no-print"
                    disabled={aiSummaryLoading}
                  >
                    {aiSummaryLoading ? 'Analyzing...' : 'Re-Run AI Summary'}
                  </button>
                </div>

                {profile?.aiCareerSummary?.summary ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl space-y-2">
                      <h4 className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                        <FiTrendingUp /> Candidate Strengths
                      </h4>
                      <ul className="list-disc list-inside space-y-1.5 text-violet-100/80 font-medium">
                        {profile.aiCareerSummary.strengths?.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl space-y-2">
                      <h4 className="font-extrabold text-rose-400 flex items-center gap-1.5">
                        <FiTarget /> Areas of Growth
                      </h4>
                      <ul className="list-disc list-inside space-y-1.5 text-violet-100/80 font-medium">
                        {profile.aiCareerSummary.weaknesses?.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-violet-600/5 border border-violet-600/10 p-4 rounded-2xl space-y-2 md:col-span-2">
                      <h4 className="font-extrabold text-violet-300 flex items-center gap-1.5">
                        <FiBookOpen /> Recommended Skills Expansion
                      </h4>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {profile.aiCareerSummary.recommendedSkills?.map((s, idx) => (
                          <span key={idx} className="bg-violet-600/10 border border-violet-600/20 text-violet-300 font-bold px-2.5 py-1 rounded-xl">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-violet-100/40 italic py-3 text-center">Run the AI Summary tool to generate personalized lists.</p>
                )}
              </div>

              {/* AI Portfolio Review Box */}
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-violet-100 uppercase tracking-wider flex items-center gap-1.5">
                      <FiCpu /> AI Portfolio Review
                    </h3>
                    <p className="text-[11px] text-violet-100/50 mt-0.5">Automated assessment of projects completeness, resume parsing and performance.</p>
                  </div>
                  <button 
                    onClick={handleGenerateReview} 
                    className="primary-button !w-auto !py-1.5 !px-3 !text-xs no-print"
                    disabled={aiReviewLoading}
                  >
                    {aiReviewLoading ? 'Analyzing...' : 'Run Portfolio Review'}
                  </button>
                </div>

                {profile?.aiPortfolioReview?.score ? (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                      <div>
                        <span className="text-[10px] text-violet-100/40 uppercase tracking-wider font-extrabold">Portfolio Health Index</span>
                        <p className="text-lg font-extrabold text-violet-100 mt-0.5">{profile.aiPortfolioReview.score}% Quality Score</p>
                      </div>
                      <span className="text-2xl font-extrabold text-violet-300">
                        {profile.aiPortfolioReview.score >= 80 ? 'A+' : profile.aiPortfolioReview.score >= 60 ? 'B' : 'C'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-violet-300">Suggestions & Additions</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-violet-100/70">
                          {profile.aiPortfolioReview.suggestions?.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-extrabold text-violet-300">Missing Portfolio Blocks</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-violet-100/70">
                          {profile.aiPortfolioReview.missingSections?.map((m, idx) => (
                            <li key={idx}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-violet-100/40 italic py-3 text-center">Run the AI Portfolio Review to gauge your competitive edge.</p>
                )}
              </div>

              {/* Dynamic Action items / Profile Recommendations */}
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-violet-100 uppercase tracking-wider flex items-center gap-1.5">
                  <FiTrendingUp /> Actionable Recommendations
                </h3>
                
                <div className="space-y-3 text-xs">
                  {/* Mock Interview recommendation */}
                  {(!activity?.interviewHistory?.completedCount || activity.interviewHistory.completedCount < 3) && (
                    <div className="flex gap-3 bg-white/2 border border-white/5 rounded-2xl p-3.5">
                      <span className="p-2 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-300 h-8 w-8 flex-shrink-0">
                        <FiActivity />
                      </span>
                      <div>
                        <h4 className="font-bold text-violet-100">Practice Mock Interviews</h4>
                        <p className="text-violet-100/50 mt-0.5 text-[11px] leading-relaxed">
                          Your mock interview history is light. Complete mock attempts to calculate communication ratings.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Project Recommendation */}
                  {(!profile?.projects || profile.projects.length < 2) && (
                    <div className="flex gap-3 bg-white/2 border border-white/5 rounded-2xl p-3.5">
                      <span className="p-2 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-300 h-8 w-8 flex-shrink-0">
                        <FiBriefcase />
                      </span>
                      <div>
                        <h4 className="font-bold text-violet-100">Add Live Code Projects</h4>
                        <p className="text-violet-100/50 mt-0.5 text-[11px] leading-relaxed">
                          Recruiters look for working projects. Link GitHub repositories and live demo paths on your Projects tab.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resume score recommendation */}
                  {(!activity?.latestResume || activity.latestResume.atsScore < 70) && (
                    <div className="flex gap-3 bg-white/2 border border-white/5 rounded-2xl p-3.5">
                      <span className="p-2 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-300 h-8 w-8 flex-shrink-0">
                        <FiZap />
                      </span>
                      <div>
                        <h4 className="font-bold text-violet-100">Optimize ATS Resume Keywords</h4>
                        <p className="text-violet-100/50 mt-0.5 text-[11px] leading-relaxed">
                          Your latest resume ATS index is below 70%. Use the Resume Analyzer to patch missing keywords.
                        </p>
                      </div>
                    </div>
                  )}

                  {activity?.interviewHistory?.completedCount > 0 && activity?.latestResume && profile?.projects?.length > 0 && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 font-bold text-center">
                      Excellent progress! Complete mock roadmaps to maximize company-specific readiness.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline & Stats */}
          {activeTab === 'activity' && (
            <div className="space-y-5">
              <AchievementGrid achievements={activity?.achievements} activity={activity} />
              <ActivityTimeline activity={activity} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
