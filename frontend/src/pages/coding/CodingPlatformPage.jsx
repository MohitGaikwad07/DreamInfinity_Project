import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import '../../styles/coding.css';
import { 
  clearCodingError, 
  loadCodingData, 
  runCode, 
  selectQuestion, 
  setCode, 
  setInput, 
  setLanguage, 
  setMode, 
  submitCode 
} from '../../redux/slices/codingSlice.js';
import { 
  FiCheckCircle, 
  FiCircle, 
  FiSearch, 
  FiChevronLeft, 
  FiAward, 
  FiZap, 
  FiPlay, 
  FiCheck,
  FiCode,
  FiBookOpen,
  FiTerminal,
  FiCpu,
  FiClock
} from 'react-icons/fi';

const languageMap = { 
  javascript: 'javascript', 
  python: 'python', 
  java: 'java', 
  cpp: 'cpp', 
  c: 'c', 
  go: 'go', 
  rust: 'rust', 
  typescript: 'typescript' 
};

export const CodingPlatformPage = () => {
  const dispatch = useDispatch();
  const state = useSelector((store) => store.coding);
  const { theme } = useSelector((store) => store.settings);
  const { 
    questions, 
    currentQuestion: question, 
    code, 
    language, 
    mode, 
    input, 
    result, 
    history, 
    leaderboard, 
    loading, 
    error 
  } = state;

  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('description'); // description, submissions, leaderboard, ai_review

  useEffect(() => {
    dispatch(loadCodingData());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCodingError());
    }
  }, [error, dispatch]);

  // Automatically switch to AI Review tab upon successful submission
  useEffect(() => {
    if (history.length > 0 && view === 'editor') {
      setActiveTab('ai_review');
    }
  }, [history.length, view]);

  const payload = () => ({
    questionId: question?.id,
    code,
    language,
    input,
    mode
  });

  const handleRun = () => {
    dispatch(runCode(payload()))
      .unwrap()
      .then(() => toast.success('Code execution finished.'))
      .catch((err) => toast.error(err));
  };

  const handleSubmit = () => {
    dispatch(submitCode(payload()))
      .unwrap()
      .then(() => toast.success('Submission evaluated by AI!'))
      .catch((err) => toast.error(err));
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    const st = status.toLowerCase();
    if (st.includes('accept') || st.includes('success')) return 'status-accepted';
    if (st.includes('compile')) return 'status-compilation';
    return 'status-error';
  };

  // Helper to check if a question is solved
  const isQuestionSolved = (questionId) => {
    return history.some(sub => sub.questionId === questionId && sub.score?.accuracy === 100);
  };

  // Stats calculations
  const totalQuestions = questions.length;
  const totalSolved = questions.filter(q => isQuestionSolved(q.id)).length;
  
  const getDifficultyStats = (diff) => {
    const total = questions.filter(q => q.difficulty === diff).length;
    const solved = questions.filter(q => q.difficulty === diff && isQuestionSolved(q.id)).length;
    return { total, solved, percent: total > 0 ? Math.round((solved / total) * 100) : 0 };
  };

  const easyStats = getDifficultyStats('Easy');
  const mediumStats = getDifficultyStats('Medium');
  const hardStats = getDifficultyStats('Hard');

  // Heatmap generation
  const generateHeatmapWeeks = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 111); // 16 weeks * 7 days = 112 days
    
    for (let i = 0; i < 112; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      days.push(currentDate);
    }
    
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const weeks = generateHeatmapWeeks();

  // Streak calculations
  const calculateStreak = () => {
    let streak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    const hasSubToday = history.some(sub => new Date(sub.createdAt).toDateString() === new Date().toDateString());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const hasSubYesterday = history.some(sub => new Date(sub.createdAt).toDateString() === yesterday.toDateString());
    
    if (!hasSubToday && !hasSubYesterday) {
      return 0;
    }
    
    const startCheckDate = hasSubToday ? new Date() : yesterday;
    startCheckDate.setHours(0, 0, 0, 0);
    
    while (true) {
      const dateStr = startCheckDate.toDateString();
      const hasSub = history.some(sub => new Date(sub.createdAt).toDateString() === dateStr);
      if (hasSub) {
        streak++;
        startCheckDate.setDate(startCheckDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const activeStreak = calculateStreak();

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || 
                          q.category.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  // Circular progress specs
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const percentSolved = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;
  const strokeDashoffset = circumference - (percentSolved / 100) * circumference;

  const handleSelectQuestion = (q) => {
    dispatch(selectQuestion(q));
    setView('editor');
    setActiveTab('description');
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-slate-300">
        <div className="h-10 w-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wider text-slate-400">LOADING PROBLEM SET...</span>
      </div>
    );
  }

  // RENDER PROBLEM LIST DASHBOARD
  if (view === 'list') {
    return (
      <div className="space-y-6">
        <div>
          <p className="dash-kicker">CODING INTERVIEW PLATFORM</p>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Challenge Dashboard</h1>
        </div>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Solved Stats Card */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur flex items-center justify-around gap-4 hover:border-white/10 transition-all duration-300 shadow-xl">
            {/* Circle Progress SVG */}
            <div className="relative flex items-center justify-center h-28 w-28 flex-shrink-0">
              <svg className="h-full w-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-slate-800/80"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-violet-500 transition-all duration-500 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold text-white">{totalSolved}</span>
                <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">/{totalQuestions} Solved</span>
              </div>
            </div>

            {/* Solved Breakdown List */}
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-1">
                  <span className="text-emerald-400">Easy</span>
                  <span>{easyStats.solved}/{easyStats.total}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${easyStats.percent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-1">
                  <span className="text-amber-400">Medium</span>
                  <span>{mediumStats.solved}/{mediumStats.total}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${mediumStats.percent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-1">
                  <span className="text-rose-400">Hard</span>
                  <span>{hardStats.solved}/{hardStats.total}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${hardStats.percent}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Submission Heatmap Card */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur flex flex-col justify-between gap-4 hover:border-white/10 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 tracking-wide uppercase">Submission Streak Heatmap</span>
              <div className="flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full text-violet-300 text-xs font-bold">
                <FiZap className="text-amber-500 animate-bounce" />
                <span>{activeStreak} Day Streak</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5 flex-shrink-0">
                  {week.map((day, dIdx) => {
                    const dateStr = day.toDateString();
                    const daySubs = history.filter(sub => new Date(sub.createdAt).toDateString() === dateStr);
                    const solved = daySubs.some(sub => sub.score?.accuracy === 100);
                    const attempted = daySubs.length > 0;
                    
                    let colorClass = 'bg-white/5 border border-white/5';
                    if (solved) {
                      colorClass = 'bg-emerald-500 hover:bg-emerald-400 cursor-pointer shadow-[0_0_8px_rgba(16,185,129,0.3)]';
                    } else if (attempted) {
                      colorClass = 'bg-emerald-800 hover:bg-emerald-700 cursor-pointer';
                    }
                    
                    return (
                      <div 
                        key={dIdx} 
                        className={`h-3.5 w-3.5 rounded-sm transition ${colorClass}`}
                        title={`${day.toLocaleDateString()}: ${daySubs.length} submissions (${solved ? 'Passed' : attempted ? 'Attempted' : 'None'})`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold border-t border-white/5 pt-2.5">
              <span>{history.length} Submissions recorded</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <div className="h-2.5 w-2.5 rounded-sm bg-white/5" />
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-800" />
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Filter and Table Card */}
        <div className="p-5 rounded-2xl bg-[#110f1c] border border-white/10 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-xs">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/30 border border-white/5 text-xs text-white placeholder-gray-500 outline-none focus:border-violet-500 transition"
                placeholder="Search question name..."
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                    difficultyFilter === diff 
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' 
                      : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Question List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4 w-12">Status</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 w-28">Acceptance</th>
                  <th className="py-3 px-4 w-28">Difficulty</th>
                  <th className="py-3 px-4 w-24 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredQuestions.length ? (
                  filteredQuestions.map((q) => {
                    const solved = isQuestionSolved(q.id);
                    return (
                      <tr key={q.id} className="hover:bg-white/2 transition duration-200">
                        {/* Status Icon */}
                        <td className="py-3.5 px-4">
                          {solved ? (
                            <FiCheckCircle className="text-emerald-400" size={16} />
                          ) : (
                            <FiCircle className="text-gray-600" size={16} />
                          )}
                        </td>
                        
                        {/* Title */}
                        <td className="py-3.5 px-4">
                          <button 
                            onClick={() => handleSelectQuestion(q)}
                            className="font-bold text-white hover:text-violet-400 text-left transition cursor-pointer"
                          >
                            {q.title}
                          </button>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-gray-400">
                          {q.category}
                        </td>

                        {/* Acceptance Rate */}
                        <td className="py-3.5 px-4 text-gray-400 font-medium">
                          {q.acceptanceRate}%
                        </td>

                        {/* Difficulty Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>
                            {q.difficulty}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button 
                            onClick={() => handleSelectQuestion(q)}
                            className="bg-violet-600/10 border border-violet-500/20 hover:bg-violet-600 hover:text-white transition px-3 py-1 rounded-lg text-violet-300 font-bold tracking-wide cursor-pointer"
                          >
                            {solved ? 'Retry' : 'Solve'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">
                      No questions found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // RENDER CODING WORKSPACE EDITOR
  const currentReview = history.find((sub) => sub.questionId === question.id)?.aiFeedback;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('list')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer text-xs font-bold"
          >
            <FiChevronLeft size={14} />
            <span>Problems List</span>
          </button>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">{question.title}</h1>
            <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Coding Workspace Sandbox</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={mode} 
            onChange={(e) => dispatch(setMode(e.target.value))} 
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-500 transition cursor-pointer"
          >
            <option className="bg-[#110f1c]" value="practice">Practice Mode</option>
            <option className="bg-[#110f1c]" value="interview">Interview Mode</option>
            <option className="bg-[#110f1c]" value="contest">Contest Mode</option>
            <option className="bg-[#110f1c]" value="company_assessment">Company Assessment</option>
          </select>
          <button 
            className="subtle-button" 
            disabled={loading} 
            onClick={handleRun}
          >
            {loading ? 'Running...' : 'Run code'}
          </button>
          <button 
            className="finish-interview" 
            disabled={loading} 
            onClick={handleSubmit}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Main layout splits */}
      <div className="coding-layout">
        {/* Left Side Workspace (Tabs) */}
        <section className="workspace-panel">
          {/* Header Row with details */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="text-sm font-bold text-white tracking-tight">{question.title}</h2>
            <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
              {question.difficulty}
            </span>
          </div>

          {/* Left panel Tabs Navigation */}
          <div className="workspace-tabs">
            <button 
              className={`workspace-tab ${activeTab === 'description' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`workspace-tab ${activeTab === 'submissions' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              Submissions ({history.filter(h => h.questionId === question.id).length})
            </button>
            <button 
              className={`workspace-tab ${activeTab === 'leaderboard' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              Leaderboard
            </button>
            <button 
              className={`workspace-tab ${activeTab === 'ai_review' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('ai_review')}
            >
              AI Review
            </button>
          </div>

          {/* Tab content panel */}
          <div className="pane-content">
            {activeTab === 'description' && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs font-bold text-violet-300">Category: {question.category}</p>
                <p className="text-sm leading-relaxed text-slate-200">{question.statement}</p>
                
                <h3>Constraints</h3>
                <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
                  {question.constraints.map((c) => <li key={c}>{c}</li>)}
                </ul>

                <h3>Example Cases</h3>
                {question.examples.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-xs text-violet-400 font-bold">Case {idx + 1}:</span>
                    <pre className="overflow-auto rounded-xl bg-black/35 p-3 text-xs text-emerald-300 font-mono border border-white/5">
                      Input: {item.input}{'\n'}Output: {item.output}
                    </pre>
                  </div>
                ))}

                <details className="mt-4 text-xs text-violet-300 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/5">
                  <summary className="font-bold select-none">AI-Safe Guidance Hints</summary>
                  <div className="mt-2 space-y-2 text-slate-300">
                    {question.hints.map((hint, idx) => (
                      <p key={idx}>• {hint}</p>
                    ))}
                  </div>
                </details>

                <div className="mt-6 flex flex-wrap gap-2">
                  {question.tags.map((t) => (
                    <span key={t} className="rounded bg-white/5 border border-white/5 px-2.5 py-1 text-xs text-slate-400">
                      #{t}
                    </span>
                  ))}
                  <span className="rounded bg-violet-500/10 border border-violet-500/10 px-2.5 py-1 text-xs text-violet-300">
                    📈 {question.acceptanceRate}% acceptance
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-3 animate-fadeIn">
                <h4 className="text-xs font-black uppercase tracking-wider text-violet-300 mb-2">My Submissions</h4>
                {history.filter(h => h.questionId === question.id).length ? (
                  history.filter(h => h.questionId === question.id).map((item) => (
                    <div key={item._id} className="submission-row">
                      <div className="submission-meta">
                        <b>{item.result?.status || 'Submitted'}</b>
                        <span>Language: {item.language} · {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className="submission-score">
                        Score: {item.score?.overall || 0}/100
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="empty-copy">You haven't submitted a solution for this question yet.</p>
                )}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-3 animate-fadeIn">
                <h4 className="text-xs font-black uppercase tracking-wider text-violet-300 mb-2">Global Leaderboard</h4>
                {leaderboard.length ? (
                  leaderboard.slice(0, 8).map((item, index) => (
                    <div key={`${item.name}-${index}`} className="rank-row">
                      <span>#{index + 1}</span>
                      <b>{item.name}</b>
                      <strong>{item.score} pts</strong>
                    </div>
                  ))
                ) : (
                  <p className="empty-copy">No scores recorded in this leaderboard category.</p>
                )}
              </div>
            )}

            {activeTab === 'ai_review' && (
              <div className="ai-review-wrapper animate-fadeIn">
                {currentReview ? (
                  <>
                    <div className="ai-review-header">
                      <h4>AI Feedback Report</h4>
                      <p className="text-xs text-slate-400">Review metrics of your latest submission</p>
                    </div>

                    <div className="ai-review-grid">
                      <div className="ai-review-metric">
                        <small>Accuracy</small>
                        <b>{currentReview.correctness}</b>
                      </div>
                      <div className="ai-review-metric">
                        <small>Time Complexity</small>
                        <b>{currentReview.timeComplexity}</b>
                      </div>
                      <div className="ai-review-metric">
                        <small>Space Complexity</small>
                        <b>{currentReview.spaceComplexity}</b>
                      </div>
                    </div>

                    <div className="ai-review-notes">
                      {currentReview.optimizationSuggestions?.length > 0 && (
                        <section>
                          <h5>Optimization Suggestions</h5>
                          <ul>
                            {currentReview.optimizationSuggestions.map((note) => (
                              <li key={note}>{note}</li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {currentReview.bestPractices?.length > 0 && (
                        <section>
                          <h5>Best Practices</h5>
                          <ul>
                            {currentReview.bestPractices.map((note) => (
                              <li key={note}>{note}</li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {currentReview.edgeCases?.length > 0 && (
                        <section>
                          <h5>Edge Cases to Consider</h5>
                          <ul>
                            {currentReview.edgeCases.map((note) => (
                              <li key={note}>{note}</li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {currentReview.alternativeApproaches?.length > 0 && (
                        <section>
                          <h5>Alternative Approaches</h5>
                          <ul>
                            {currentReview.alternativeApproaches.map((note) => (
                              <li key={note}>{note}</li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-400 border border-dashed border-white/10 rounded-xl">
                    <p>No AI analysis report available yet.</p>
                    <p className="text-xs mt-1 text-slate-500">Submit a solution in the editor on the right to receive automated diagnostics.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Side Editor & Console */}
        <section className="flex flex-col gap-4">
          {/* Solution Editor Panel */}
          <div className="workspace-panel editor-panel">
            <div className="panel-header-bar">
              <b className="text-xs font-bold text-white tracking-wider">SOLUTION WORKSPACE</b>
              <select 
                value={language} 
                onChange={(e) => dispatch(setLanguage(e.target.value))} 
                className="bg-black/50 border border-white/10 rounded px-2.5 py-1 text-xs font-bold text-violet-300 outline-none cursor-pointer"
              >
                {Object.keys(languageMap).map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <Editor 
              height="450px" 
              language={languageMap[language]} 
              theme={theme === 'light' ? 'vs' : 'vs-dark'} 
              value={code} 
              onChange={(value) => dispatch(setCode(value || ''))} 
              options={{ 
                minimap: { enabled: false }, 
                fontSize: 14, 
                automaticLayout: true, 
                wordWrap: 'on',
                lineHeight: 22,
                cursorBlinking: 'smooth',
                fontFamily: 'Fira Code, ui-monospace, monospace'
              }}
            />
          </div>

          {/* Custom Input Panel */}
          <div className="workspace-panel !min-height-0 !p-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Stdin Input</label>
            <textarea 
              value={input} 
              onChange={(e) => dispatch(setInput(e.target.value))} 
              rows="2" 
              className="mt-2 w-full rounded-lg border border-white/5 bg-black/35 p-3 text-xs font-mono text-white outline-none focus:border-violet-500" 
              placeholder="Provide arguments to feed to your program (optional)..."
            />
          </div>

          {/* Execution Output drawer */}
          <div className="console-wrapper">
            <div className="console-header">Run Console Output</div>
            {result ? (
              <div className={`console-result ${getStatusClass(result.status)}`}>
                <div className="font-bold mb-1">Status: {result.status}</div>
                {result.executionTime !== undefined && (
                  <div className="text-xs text-slate-400 mb-2">
                    Execution speed: {result.executionTime || 0}s · Memory: {result.memory || 0} KB
                  </div>
                )}
                <hr className="border-white/5 my-2" />
                <div className="whitespace-pre-wrap mt-2 overflow-auto max-h-48 text-[11px] font-mono leading-relaxed">
                  {result.stdout || result.stderr || result.compileOutput || 'Program execution completed with no output log.'}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Run code in the editor above to view standard outputs, errors, execution time, and sandbox memory logs here.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
