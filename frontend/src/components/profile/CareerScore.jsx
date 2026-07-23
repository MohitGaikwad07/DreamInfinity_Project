import React from 'react';

const CircularProgress = ({ score = 0, label = '' }) => {
  const percentage = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 32;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-chart-wrapper">
      <div className="relative circular-chart">
        <svg viewBox="0 0 76 76" className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            className="stroke-white/5"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx="38"
            cy="38"
          />
          {/* Progress circle */}
          <circle
            className="stroke-[url(#chart-gradient)] transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="38"
            cy="38"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-base font-extrabold text-violet-100 leading-none">{percentage}</span>
          <span className="text-[8px] text-violet-100/40 uppercase tracking-wider mt-0.5">%</span>
        </div>
      </div>
      <p className="text-[10px] font-bold text-violet-200 mt-2.5 uppercase tracking-wide truncate max-w-full">
        {label}
      </p>
    </div>
  );
};

export const CareerScore = ({ scores }) => {
  const normalizedScores = scores || {
    overall: 0,
    programming: 0,
    frontend: 0,
    backend: 0,
    database: 0,
    communication: 0,
    problemSolving: 0
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-violet-100">AI Skill Metrics</h2>
          <p className="text-xs text-violet-100/50 mt-0.5">Calculated by platform engagement, coding submissions, and mock transcripts.</p>
        </div>
      </div>

      <div className="score-charts-grid">
        <CircularProgress score={normalizedScores.overall} label="Overall" />
        <CircularProgress score={normalizedScores.programming} label="Programming" />
        <CircularProgress score={normalizedScores.frontend} label="Frontend" />
        <CircularProgress score={normalizedScores.backend} label="Backend" />
        <CircularProgress score={normalizedScores.database} label="Database" />
        <CircularProgress score={normalizedScores.communication} label="Speech & Comm" />
        <CircularProgress score={normalizedScores.problemSolving} label="Problem Solve" />
      </div>
    </div>
  );
};
