import React, { useState } from 'react';
import { FiCode, FiMic, FiMessageSquare, FiClock } from 'react-icons/fi';

export const ActivityTimeline = ({ activity }) => {
  const [activeTab, setActiveTab] = useState('coding'); // coding, interviews, community

  const coding = activity?.codingHistory || { problemsSolved: 0, recentSubmissions: [], executionStatistics: { totalSubmissions: 0, languageBreakdown: {} } };
  const interviews = activity?.interviewHistory || { completedCount: 0, averageScore: 0, recentInterviews: [], feedback: [] };
  const community = activity?.communityProfile || { postCount: 0, commentCount: 0, helpfulScore: 0, communityRank: 0 };

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s === 'accepted' || s === 'completed' || s === 'success') return 'text-emerald-400';
    if (s === 'in_progress') return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="glass-card rounded-3xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <h2 className="text-base font-bold text-violet-100">Activity Timeline</h2>
          <p className="text-xs text-violet-100/50 mt-0.5">Live activity synchronization across platform modules.</p>
        </div>

        <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('coding')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'coding' ? 'bg-violet-600 text-white' : 'text-violet-100/50 hover:text-violet-200'}`}
          >
            Coding ({coding.problemsSolved})
          </button>
          <button 
            onClick={() => setActiveTab('interviews')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'interviews' ? 'bg-violet-600 text-white' : 'text-violet-100/50 hover:text-violet-200'}`}
          >
            Interviews ({interviews.completedCount})
          </button>
        </div>
      </div>

      {activeTab === 'coding' && (
        <div className="space-y-3">
          {coding.recentSubmissions.length === 0 ? (
            <p className="text-xs text-violet-100/40 italic py-4 text-center">No coding submissions found. Open the Coding Platform to start.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {coding.recentSubmissions.map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-violet-600/10 rounded-lg text-violet-300">
                      <FiCode />
                    </span>
                    <div>
                      <h4 className="font-bold text-violet-100">{sub.questionTitle}</h4>
                      <span className="text-[10px] text-violet-100/40">Language: {sub.language}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-bold ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                    <p className="text-[10px] text-violet-100/40 mt-0.5">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'interviews' && (
        <div className="space-y-3">
          {interviews.recentInterviews.length === 0 ? (
            <p className="text-xs text-violet-100/40 italic py-4 text-center">No interviews completed yet. Complete a Mock Interview to log history.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {interviews.recentInterviews.map((int) => (
                <div key={int.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-violet-600/10 rounded-lg text-violet-300">
                      <FiMic />
                    </span>
                    <div>
                      <h4 className="font-bold text-violet-100">{int.targetCompany || 'General'} Preparation</h4>
                      <span className="text-[10px] text-violet-100/40">Role: {int.targetRole || 'Software Engineer'} &bull; {int.type}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-violet-300">
                      Score: {int.score}%
                    </span>
                    <p className="text-[10px] text-violet-100/40 mt-0.5">
                      {new Date(int.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
