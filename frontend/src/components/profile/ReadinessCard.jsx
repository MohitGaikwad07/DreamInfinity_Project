import React from 'react';

const CompanyReadinessRow = ({ name = '', percentage = 0 }) => {
  const rounded = Math.round(percentage);
  
  // Decide color scheme based on score
  const getProgressColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 60) return 'from-violet-500 to-indigo-400';
    return 'from-rose-500 to-amber-400';
  };

  const getInitial = (company) => {
    return company.slice(0, 1);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-white/5 flex items-center justify-center font-extrabold text-violet-300">
            {getInitial(name)}
          </span>
          <span className="text-violet-200">{name}</span>
        </div>
        <span className="text-violet-300">{rounded}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(rounded)} transition-all duration-1000`} 
          style={{ width: `${rounded}%` }}
        />
      </div>
    </div>
  );
};

export const ReadinessCard = ({ companyReadiness }) => {
  const readiness = companyReadiness || {
    Google: 0,
    Amazon: 0,
    Microsoft: 0,
    Adobe: 0,
    Netflix: 0,
    Oracle: 0,
    Meta: 0
  };

  return (
    <div className="glass-card rounded-3xl p-6 space-y-4">
      <div>
        <h2 className="text-base font-bold text-violet-100">Big-Tech Readiness</h2>
        <p className="text-xs text-violet-100/50 mt-0.5">Mock evaluation index adjusted for specific hiring benchmarks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {Object.entries(readiness).map(([company, score]) => (
          <CompanyReadinessRow key={company} name={company} percentage={score} />
        ))}
      </div>
    </div>
  );
};
