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
    if (history.length > 0) {
      setActiveTab('ai_review');
    }
  }, [history.length]);

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

  if (!question) {
    return <div className="p-8 text-center text-slate-300">Loading coding workspace...</div>;
  }

  // Get status coloring class for execution results
  const getStatusClass = (status) => {
    if (!status) return '';
    const st = status.toLowerCase();
    if (st.includes('accept') || st.includes('success')) return 'status-accepted';
    if (st.includes('compile')) return 'status-compilation';
    return 'status-error';
  };

  // Find latest AI review for current question
  const currentReview = history.find((sub) => sub.questionId === question.id)?.aiFeedback;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="dash-kicker">CODING INTERVIEW PLATFORM</p>
          <h1 className="text-xl font-bold text-white">LeetCode Workspace Sandbox</h1>
        </div>
        <div className="flex gap-2">
          <select 
            value={mode} 
            onChange={(e) => dispatch(setMode(e.target.value))} 
            className="rounded-lg bg-white/10 p-2 text-xs font-semibold text-white outline-none"
          >
            <option value="practice">Practice Mode</option>
            <option value="interview">Interview Mode</option>
            <option value="contest">Contest Mode</option>
            <option value="company_assessment">Company Assessment</option>
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
          {/* Header Row with dropdown problem selector */}
          <div className="problem-dropdown-wrapper">
            <select
              value={question.id}
              onChange={(e) => {
                const selected = questions.find((q) => q.id === e.target.value);
                if (selected) dispatch(selectQuestion(selected));
              }}
              className="problem-select"
            >
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
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
                <p className="text-sm font-semibold text-violet-300">Category: {question.category}</p>
                <p className="text-sm leading-relaxed text-slate-200">{question.statement}</p>
                
                <h3>Constraints</h3>
                <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
                  {question.constraints.map((c) => <li key={c}>{c}</li>)}
                </ul>

                <h3>Example Cases</h3>
                {question.examples.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-xs text-violet-400 font-bold">Case {idx + 1}:</span>
                    <pre className="overflow-auto rounded bg-black/35 p-3 text-xs text-emerald-300 font-mono">
                      Input: {item.input}{'\n'}Output: {item.output}
                    </pre>
                  </div>
                ))}

                <details className="mt-4 text-xs text-violet-300 cursor-pointer p-2 rounded bg-white/5 border border-white/5">
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
              theme="vs-dark" 
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
