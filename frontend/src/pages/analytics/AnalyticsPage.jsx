import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiBarChart2,
  FiAward,
  FiTrendingUp,
  FiCalendar,
  FiCheck,
  FiFileText,
  FiZap,
  FiCpu,
  FiMessageSquare,
  FiBookOpen,
  FiUsers,
  FiArrowRight,
  FiMaximize,
  FiCheckCircle,
  FiHelpCircle
} from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

import {
  loadAnalyticsOverview,
  loadInterviewAnalytics,
  loadCodingAnalytics,
  loadResumeAnalytics,
  loadSkillAnalytics,
  loadCompanyReadiness,
  loadLearningAnalytics,
  completeWeek,
  loadCommunityAnalytics,
  loadWeeklyReport,
  loadAIInsights,
  setSelectedRange,
  setCustomDateRange
} from '../../redux/slices/analyticsSlice.js';

import '../../styles/analytics.css';

export const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const {
    overview,
    interviews,
    coding,
    resume,
    skills,
    readiness,
    learning,
    community,
    weeklyReport,
    aiInsights,
    selectedRange,
    customDateRange,
    loading
  } = useSelector((state) => state.analytics);

  // Sub-tab: overview (default), interviews, coding, resume, skills, company, learning, community
  const [activeSubTab, setActiveSubTab] = useState('overview');
  
  // Custom range display toggle
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  
  // Weekly report modal toggle
  const [showReportModal, setShowReportModal] = useState(false);

  // Initial load
  useEffect(() => {
    fetchFilteredData(selectedRange);
    dispatch(loadResumeAnalytics());
    dispatch(loadSkillAnalytics());
    dispatch(loadCompanyReadiness());
    dispatch(loadLearningAnalytics());
    dispatch(loadCommunityAnalytics());
    dispatch(loadAIInsights());
  }, [dispatch]);

  const fetchFilteredData = (range, customStart = null, customEnd = null) => {
    const params = range === 'custom' 
      ? { range, startDate: customStart, endDate: customEnd }
      : { range };

    dispatch(loadAnalyticsOverview(params));
    dispatch(loadInterviewAnalytics(params));
    dispatch(loadCodingAnalytics(params));
  };

  const handleRangeChange = (range) => {
    dispatch(setSelectedRange(range));
    if (range === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      fetchFilteredData(range);
    }
  };

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    if (startInput && endInput) {
      dispatch(setCustomDateRange({ startDate: startInput, endDate: endInput }));
      fetchFilteredData('custom', startInput, endInput);
    } else {
      toast.error('Please specify both dates.');
    }
  };

  // Complete roadmap week
  const handleCheckWeek = (week) => {
    dispatch(completeWeek(week))
      .unwrap()
      .then((res) => toast.success(`🎉 Focused week checked off! Completion: ${res.roadmapCompletion}%`))
      .catch((err) => toast.error(err));
  };

  // Generate weekly report on click
  const handleOpenWeeklyReport = () => {
    setShowReportModal(true);
    if (!weeklyReport) {
      dispatch(loadWeeklyReport());
    }
  };

  // Empty state checker
  const isUserNew = 
    !overview?.snapshots?.length && 
    !interviews?.aiInterviewsCompleted && 
    !coding?.problemsAttempted && 
    !resume?.versions?.length;

  return (
    <div className="analytics-page px-4 md:px-8 py-6">
      
      {/* Header and range bar */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <p className="dash-kicker">ANALYTICS & PROGRESS TRACKER</p>
          <h1 className="text-3xl font-black text-white">Your Training <span>Dashboard.</span></h1>
        </div>

        {/* Date Filters Toolbar */}
        <div className="date-toolbar">
          <div className="flex bg-white/5 border border-white/8 rounded-lg p-0.5">
            {[
              ['7d', '7 Days'],
              ['30d', '30 Days'],
              ['3m', '3 Months'],
              ['6m', '6 Months'],
              ['1y', '1 Year'],
              ['all', 'All Time'],
              ['custom', 'Custom']
            ].map(([r, label]) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition ${
                  selectedRange === r ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {showCustomPicker && (
            <form onSubmit={handleCustomRangeSubmit} className="custom-range-inputs">
              <input
                type="date"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="date"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
              />
              <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-2.5 py-1.5 rounded font-bold">
                Apply
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Sub-nav layout Tabs */}
      <nav className="analytics-tabs flex space-x-2 mb-6">
        {[
          ['overview', 'Overview', <FiBarChart2 />],
          ['interviews', 'Interviews', <FiCpu />],
          ['coding', 'Algorithms & DSA', <FiAward />],
          ['resume', 'Resume Versioning', <FiFileText />],
          ['skills', 'Skill Map', <FiZap />],
          ['company', 'Company Readiness', <FiTrendingUp />],
          ['learning', 'Roadmap checklist', <FiBookOpen />],
          ['community', 'Community Impact', <FiUsers />]
        ].map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setActiveSubTab(key)}
            className={`game-tab-btn ${activeSubTab === key ? 'active' : ''}`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Main Analytics Content Container */}
      <div className="analytics-content">
        {loading && !overview && (
          <div className="text-center py-12 text-violet-300 font-bold">Compiling your career analytics snapshot...</div>
        )}

        {/* Empty state for new users */}
        {!loading && isUserNew && (
          <div className="analytics-empty-state">
            <h3 className="text-lg font-bold text-violet-300 mb-2">No Training Data Yet</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              Complete your first AI mock interview, solve a coding question, or upload your resume to populate progress charts!
            </p>
            <div className="next-best-action-card max-w-lg mx-auto">
              <div className="nba-icon-wrapper">
                <FiZap />
              </div>
              <div className="text-left">
                <span className="nba-badge">Recommended Starting Point</span>
                <p className="text-sm font-bold text-white">Upload your resume to retrieve your first ATS score!</p>
              </div>
            </div>
          </div>
        )}

        {!isUserNew && (
          <>
            {/* Tab 1: Overview Dashboard */}
            {activeSubTab === 'overview' && (
              <div className="space-y-6">
                
                {/* AI Next Best Action alert */}
                {aiInsights?.nextAction && (
                  <div className="next-best-action-card">
                    <div className="nba-icon-wrapper">
                      <FiZap />
                    </div>
                    <div className="text-left">
                      <span className="nba-badge">AI Next Best Action</span>
                      <p className="text-base font-extrabold text-white">{aiInsights.nextAction}</p>
                      <p className="text-xs text-violet-300/80 mt-1">Based on Amazon targets and graph problem declines.</p>
                    </div>
                    <button 
                      onClick={handleOpenWeeklyReport}
                      className="ml-auto flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold transition"
                    >
                      <FiBookOpen /> Open Weekly Report
                    </button>
                  </div>
                )}

                {/* KPI Metrics Summary Grid */}
                <div className="kpi-grid">
                  {[
                    { label: 'Overall Career Score', val: `${overview?.overallCareerScore || 0}%`, sub: 'Combined index', color: 'text-violet-400' },
                    { label: 'Interview Score', val: `${overview?.interviewReadinessScore || 0}%`, sub: 'AI Mock avg', color: 'text-sky-400' },
                    { label: 'Resume ATS Score', val: `${overview?.resumeScore || 0}%`, sub: 'Latest parsed file', color: 'text-emerald-400' },
                    { label: 'Coding Speed/Score', val: `${overview?.codingScore || 0}%`, sub: 'Average submission', color: 'text-pink-400' }
                  ].map((card, idx) => (
                    <div className="kpi-card" key={idx}>
                      <div className="kpi-card-header">
                        <span>{card.label}</span>
                        <FiMaximize className="text-gray-600 text-xs" />
                      </div>
                      <div className="kpi-value-row">
                        <span className={`kpi-value ${card.color}`}>{card.val}</span>
                        <span className="kpi-change-tag up">+5%</span>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-2 block">{card.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Longitudinal progress area chart & milestones timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Career score AreaChart */}
                  <div className="lg:col-span-2 border border-white/6 bg-white/[0.015] rounded-xl p-5">
                    <h3 className="text-sm font-bold text-violet-300 mb-4">Overall Career Progression</h3>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={overview?.snapshots || []}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                          <YAxis stroke="rgba(255,255,255,0.4)" domain={[0, 100]} fontSize={9} />
                          <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.95)', border: '1px solid #8b5cf6', color: '#fff', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="careerScore" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Achievements Milestone Timeline */}
                  <div className="border border-white/6 bg-white/[0.015] rounded-xl p-4 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-violet-300 mb-3">Milestone timeline</h3>
                    <div className="timeline-wrapper max-h-[250px] overflow-y-auto pr-1">
                      {overview?.timeline?.length ? (
                        overview.timeline.map((item, idx) => (
                          <div className="timeline-item" key={idx}>
                            <span className={`timeline-marker ${item.type}`} />
                            <div className="timeline-item-content">
                              <div className="flex justify-between items-baseline mb-1">
                                <b className="text-[10px] text-violet-200">{item.title}</b>
                                <span className="text-[8px] text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[9px] text-gray-400">{item.detail}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">Milestone timeline will populate as activities complete.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Interviews */}
            {activeSubTab === 'interviews' && (
              <div className="space-y-6">
                
                {/* Substats */}
                <div className="kpi-grid">
                  {[
                    { label: 'Completed AI Interviews', val: interviews?.aiInterviewsCompleted || 0, sub: 'Auto evaluated sessions' },
                    { label: 'Completed Human Rooms', val: interviews?.humanInterviewsCompleted || 0, sub: 'Peer mock sessions' },
                    { label: 'Average Evaluation Score', val: `${interviews?.averageScore || 0}%`, sub: 'Global overall index' },
                    { label: 'Peer Overall Rating', val: `${interviews?.averageHumanRating || 0}%`, sub: 'Human room peer feedback' }
                  ].map((card, idx) => (
                    <div className="kpi-card" key={idx}>
                      <span className="text-xs text-gray-400 font-semibold">{card.label}</span>
                      <span className="kpi-value text-sky-400 my-2">{card.val}</span>
                      <span className="text-[10px] text-gray-500 block">{card.sub}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Interview score LineChart */}
                  <div className="lg:col-span-2 border border-white/6 bg-white/[0.015] rounded-xl p-5">
                    <h3 className="text-sm font-bold text-sky-300 mb-4">Interview Readiness Score Trend</h3>
                    <div className="h-[200px] w-full">
                      {interviews?.scoreTrend?.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={interviews.scoreTrend}>
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                            <YAxis stroke="rgba(255,255,255,0.4)" domain={[0, 100]} fontSize={9} />
                            <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.95)', border: '1px solid #38bdf8', color: '#fff', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-12 text-xs text-gray-500">Not enough data to render trend.</div>
                      )}
                    </div>
                  </div>

                  {/* Comparisons: Last 3 vs preceding */}
                  <div className="border border-white/6 bg-white/[0.015] rounded-xl p-4 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-sky-300 mb-3">Improvement Indices (Last 3 vs Prior)</h3>
                    <div className="space-y-4">
                      {['technical', 'communication', 'confidence'].map((item) => {
                        const scoreData = interviews?.improvement?.[item] || { val1: 60, val2: 60, diff: 0, status: 'No Significant Change' };
                        return (
                          <div className="comparison-card" key={item}>
                            <span className="comparison-card-title">{item}</span>
                            <div className="comparison-val-row">
                              <span className="text-lg font-bold text-white">
                                {scoreData.val1}% <FiArrowRight className="inline mx-1 text-gray-500" /> {scoreData.val2}%
                              </span>
                              <span className={`kpi-change-tag ${scoreData.diff >= 0 ? 'up' : 'down'}`}>
                                {scoreData.diff >= 0 ? `+${scoreData.diff}` : scoreData.diff}%
                              </span>
                            </div>
                            <span className="text-[9px] text-gray-500 uppercase font-semibold">{scoreData.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Difficulty and role breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-white/6 bg-white/[0.01] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-sky-300 mb-3">Performance by Difficulty</h4>
                    {interviews?.performanceByDifficulty?.map(d => (
                      <div className="flex justify-between items-center text-xs py-2 border-b border-white/5" key={d.name}>
                        <span>{d.name}</span>
                        <b className="text-sky-400">{d.score}% avg</b>
                      </div>
                    )) || <p className="text-xs text-gray-500">No difficulty stats.</p>}
                  </div>
                  <div className="border border-white/6 bg-white/[0.01] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-sky-300 mb-3">Performance by Role</h4>
                    {interviews?.performanceByRole?.map(r => (
                      <div className="flex justify-between items-center text-xs py-2 border-b border-white/5" key={r.name}>
                        <span className="truncate max-w-[120px]">{r.name}</span>
                        <b className="text-sky-400">{r.score}% avg</b>
                      </div>
                    )) || <p className="text-xs text-gray-500">No role stats.</p>}
                  </div>
                  <div className="border border-white/6 bg-white/[0.01] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-sky-300 mb-3">Performance by Target Company</h4>
                    {interviews?.performanceByCompany?.map(c => (
                      <div className="flex justify-between items-center text-xs py-2 border-b border-white/5" key={c.name}>
                        <span>{c.name}</span>
                        <b className="text-sky-400">{c.score}% avg</b>
                      </div>
                    )) || <p className="text-xs text-gray-500">No company stats.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Coding */}
            {activeSubTab === 'coding' && (
              <div className="space-y-6">
                
                {/* Substats */}
                <div className="kpi-grid">
                  {[
                    { label: 'Submissions Solved', val: coding?.problemsSolved || 0, sub: '100% accuracy tests passed' },
                    { label: 'Submissions Attempted', val: coding?.problemsAttempted || 0, sub: 'Total algorithm submissions' },
                    { label: 'Average Execution Time', val: `${coding?.averageExecutionTime || 0}s`, sub: 'Speed runtime index' },
                    { label: 'Average Memory footprint', val: `${coding?.averageMemoryUsage || 0} KB`, sub: 'Memory load allocation' }
                  ].map((card, idx) => (
                    <div className="kpi-card" key={idx}>
                      <span className="text-xs text-gray-400 font-semibold">{card.label}</span>
                      <span className="kpi-value text-emerald-400 my-2">{card.val}</span>
                      <span className="text-[10px] text-gray-500 block">{card.sub}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Problems Solved LineChart */}
                  <div className="lg:col-span-2 border border-white/6 bg-white/[0.015] rounded-xl p-5">
                    <h3 className="text-sm font-bold text-emerald-300 mb-4">Algorithms Solved over Time</h3>
                    <div className="h-[200px] w-full">
                      {coding?.problemsSolvedOverTime?.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={coding.problemsSolvedOverTime}>
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                            <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.95)', border: '1px solid #10b981', color: '#fff', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-12 text-xs text-gray-500">No solved submissions recorded.</div>
                      )}
                    </div>
                  </div>

                  {/* Topic Performance Gauges */}
                  <div className="border border-white/6 bg-white/[0.015] rounded-xl p-4 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-emerald-300 mb-3">DSA Topic Performance</h3>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {coding?.topicPerformance?.length ? (
                        coding.topicPerformance.map(topic => (
                          <div key={topic.name}>
                            <div className="flex justify-between text-xs mb-1">
                              <span>{topic.name}</span>
                              <b className="text-emerald-400">{topic.averageScore}% avg ({topic.solved} solved)</b>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${topic.averageScore}%` }} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">Topic accuracy scores will map here once problems are solved.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Resume */}
            {activeSubTab === 'resume' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Version progress line chart */}
                <div className="lg:col-span-2 border border-white/6 bg-white/[0.015] rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-sky-300">Resume ATS Score History</h3>
                    <span className="text-xs text-emerald-400 font-bold">Total versions: {resume?.versions?.length || 0}</span>
                  </div>
                  <div className="h-[200px] w-full">
                    {resume?.versions?.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={resume.versions}>
                          <XAxis dataKey="versionName" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                          <YAxis stroke="rgba(255,255,255,0.4)" domain={[0, 100]} fontSize={9} />
                          <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.95)', border: '1px solid #38bdf8', color: '#fff', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-xs text-gray-500">No resumes analyzed yet.</div>
                    )}
                  </div>
                </div>

                {/* Skills added vs missing */}
                <div className="border border-white/6 bg-white/[0.015] rounded-xl p-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 mb-2">Skills Added ({resume?.skillsAdded?.length || 0})</h4>
                    <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto pr-1">
                      {resume?.skillsAdded?.length ? (
                        resume.skillsAdded.map(s => (
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded" key={s}>
                            {s}
                          </span>
                        ))
                      ) : (
                        <p className="text-[10px] text-gray-500">No skills parsed.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-400 mb-2">Missing Skills Target ({resume?.missingSkills?.length || 0})</h4>
                    <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto pr-1">
                      {resume?.missingSkills?.length ? (
                        resume.missingSkills.map(s => (
                          <span className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded" key={s}>
                            {s}
                          </span>
                        ))
                      ) : (
                        <p className="text-[10px] text-gray-500">No missing skills.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Skills */}
            {activeSubTab === 'skills' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Radar chart of capabilities */}
                <div className="lg:col-span-2 border border-white/6 bg-white/[0.015] rounded-xl p-5 flex flex-col items-center">
                  <h3 className="text-sm font-bold text-violet-300 align-self-start mb-4">Competency Map Comparison</h3>
                  <div className="h-[250px] w-full max-w-[400px]">
                    {skills?.radarData?.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skills.radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.08)" />
                          <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" fontSize={8} />
                          <Radar name="Current Capability" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                          <Radar name="Hiring Standard" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-xs text-gray-500">Run a Skill Gap analysis to populate the radar chart.</div>
                    )}
                  </div>
                </div>

                {/* Heatmap lists */}
                <div className="border border-white/6 bg-white/[0.015] rounded-xl p-4">
                  <h3 className="text-sm font-bold text-violet-300 mb-2">Skill Heatmap</h3>
                  <p className="text-[10px] text-gray-500">Detailed categorization of your parsed technical keywords.</p>
                  
                  <div className="skills-heatmap-grid">
                    {skills?.strongSkills?.map(s => <span className="heatmap-cell heatmap-strong" key={s}>{s}</span>)}
                    {skills?.improvingSkills?.map(s => <span className="heatmap-cell heatmap-improving" key={s}>{s}</span>)}
                    {skills?.weakSkills?.map(s => <span className="heatmap-cell heatmap-weak" key={s}>{s}</span>)}
                    {skills?.missingSkills?.slice(2).map(s => <span className="heatmap-cell heatmap-missing" key={s}>{s}</span>)}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Company Readiness */}
            {activeSubTab === 'company' && (
              <div className="border border-white/6 bg-white/[0.015] rounded-xl p-5">
                <h3 className="text-sm font-bold text-violet-300 mb-4">Target Company Readiness Comparisons</h3>
                <div className="space-y-6">
                  {readiness?.companies?.length ? (
                    readiness.companies.map((comp) => (
                      <div className="border border-white/5 bg-white/[0.01] rounded-xl p-4" key={comp.company}>
                        <div className="flex justify-between items-center mb-3">
                          <b className="text-sm text-white">{comp.company} Preparation Index</b>
                          <span className="text-base font-extrabold text-violet-400">{comp.score}% Ready</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {comp.breakdown.map((item) => (
                            <div key={item.name} className="bg-white/[0.01] border border-white/5 rounded-lg p-2.5">
                              <span className="text-[10px] text-gray-500 block font-semibold">{item.name}</span>
                              <b className="text-sm text-violet-200 mt-1 block">{item.value}%</b>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-violet-500" style={{ width: `${item.value}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-xs text-gray-500">No company preparation center modules initialized.</div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 7: Learning Roadmap checklist */}
            {activeSubTab === 'learning' && (
              <div className="learning-roadmap-card">
                <div className="flex justify-between items-baseline mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-violet-300">Target Preparation Roadmap Checklist</h3>
                    <p className="text-xs text-gray-500">Ticking off completed weeks dynamically updates your career stats!</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{learning?.roadmapCompletion || 0}% Completed</span>
                </div>

                <div className="space-y-1">
                  {learning?.roadmap?.length ? (
                    learning.roadmap.map((week) => {
                      const isCompleted = learning.completedWeeks?.includes(week.week);
                      return (
                        <div className="learning-week-row" key={week.week}>
                          <div
                            onClick={() => handleCheckWeek(week.week)}
                            className={`learning-checkbox ${isCompleted ? 'checked' : ''}`}
                          >
                            {isCompleted && <FiCheck />}
                          </div>
                          <div>
                            <div className="flex gap-2 items-center">
                              <b className="text-xs text-violet-200">{week.week}: {week.focus}</b>
                              <span className={`text-[8px] px-1 rounded uppercase font-semibold ${
                                week.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-white/10 text-gray-400'
                              }`}>
                                {week.priority} priority
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-gray-400">
                              <span>Outcomes:</span>
                              {week.outcomes.map((o, idx) => (
                                <span className="bg-white/5 px-1.5 py-0.5 rounded" key={idx}>{o}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-6">Please run a Skill Gap Analysis to establish your roadmap checklist.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 8: Community */}
            {activeSubTab === 'community' && (
              <div className="space-y-6">
                
                {/* Stats cards */}
                <div className="kpi-grid">
                  {[
                    { label: 'Experiences Shared', val: community?.interviewExperiences || 0, sub: 'Verified mock summaries' },
                    { label: 'Comments / Replies', val: community?.answers || 0, sub: 'Written comments answers' },
                    { label: 'Community Upvotes Received', val: community?.upvotesReceived || 0, sub: 'Summed helpful indicators' },
                    { label: 'Learning Partners Following', val: community?.followers || 0, sub: 'Total follow count' }
                  ].map((card, idx) => (
                    <div className="kpi-card" key={idx}>
                      <span className="text-xs text-gray-400 font-semibold">{card.label}</span>
                      <span className="kpi-value text-indigo-400 my-2">{card.val}</span>
                      <span className="text-[10px] text-gray-500 block">{card.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Helpful index */}
                <div className="border border-white/6 bg-white/[0.015] rounded-xl p-5">
                  <h3 className="text-sm font-bold text-indigo-300 mb-2">Community Impact Score</h3>
                  <p className="text-xs text-gray-400">Your total score based on shares (+10), replies (+3), and upvotes (+2) received.</p>
                  <strong className="text-4xl font-black text-indigo-400 block mt-4">{community?.helpfulScore || 0} pts</strong>
                  <span className="text-xs text-gray-500 block mt-2">Community Authority Rank: #{community?.communityRank || 100}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Weekly Report Modal overlay */}
      <AnimatePresence>
        {showReportModal && (
          <div className="weekly-report-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="weekly-report-box"
            >
              <div className="flex justify-between items-center mb-4 border-b border-white/8 pb-3">
                <h2 className="text-lg font-black text-white">AI Weekly Progress Report</h2>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Close
                </button>
              </div>

              {!weeklyReport ? (
                <div className="text-center py-12 text-violet-300">Gemini compiles study accomplishments...</div>
              ) : (
                <div className="space-y-4 text-sm text-gray-300">
                  <div>
                    <h4 className="font-extrabold text-violet-400">Achievements This Week</h4>
                    <p className="mt-1">{weeklyReport.achievementsThisWeek}</p>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-violet-400">Performance Improvements</h4>
                    <p className="mt-1">{weeklyReport.performanceImprovements}</p>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-rose-400">Areas That Declined</h4>
                    <p className="mt-1">{weeklyReport.areasDeclined}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold">Strongest Skill</span>
                      <p className="text-xs mt-1 font-bold text-white">{weeklyReport.strongestSkill}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-rose-400 uppercase font-bold">Weakest Skill</span>
                      <p className="text-xs mt-1 font-bold text-white">{weeklyReport.weakestSkill}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-violet-400">Recommended Focus</h4>
                    <p className="mt-1">{weeklyReport.recommendedFocus}</p>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-violet-400">Suggested Action Items</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Coding Problems: {weeklyReport.suggestedCodingProblems?.join(', ')}</li>
                      <li>Mock Interview Room: {weeklyReport.suggestedMockInterview}</li>
                      <li>Learning task: {weeklyReport.recommendedLearningTasks?.join(', ')}</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
