import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadInterviewDashboard } from '../redux/slices/interviewSlice.js';
import { 
  loadAnalyticsOverview,
  loadCodingAnalytics,
  loadResumeAnalytics,
  loadCompanyReadiness
} from '../redux/slices/analyticsSlice.js';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { 
  FiCode, 
  FiFileText, 
  FiMessageCircle, 
  FiMic, 
  FiUploadCloud, 
  FiUsers, 
  FiAward, 
  FiBarChart2, 
  FiTrendingUp, 
  FiX 
} from 'react-icons/fi';
import { StatCard } from '../components/dashboard/StatCard.jsx';
import { QuickActionCard } from '../components/dashboard/QuickActionCard.jsx';
import { ChartCard } from '../components/dashboard/ChartCard.jsx';
import { RecommendationCard } from '../components/dashboard/RecommendationCard.jsx';
import { ActivityCard } from '../components/dashboard/ActivityCard.jsx';
import { FloatingAIButton } from '../components/dashboard/FloatingAIButton.jsx';
import { updateUserDirectly } from '../redux/slices/authSlice.js';
import { apiClient } from '../services/apiClient.js';
import toast from 'react-hot-toast';

const statIcons = [FiMic, FiAward, FiCode, FiFileText, FiUsers, FiBarChart2];

const actions = [
  [FiUploadCloud, 'Upload Resume', 'Get immediate AI feedback', 'tone-purple', '/resume'],
  [FiMic, 'Start AI Interview', 'Practise your next round', 'tone-pink', '/mock-interview'],
  [FiCode, 'Practice Coding', 'Solve a curated problem', 'tone-blue', '/coding'],
  [FiMessageCircle, 'Ask AI', 'Get a focused study plan', 'tone-indigo', '/assistant'],
  [FiUsers, 'Browse Community', 'Learn from real experiences', 'tone-cyan', '/community']
];

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  
  // Real aggregates selectors
  const interviewDashboard = useSelector((state) => state.interview.dashboard);
  const { overview, coding, resume, readiness } = useSelector((state) => state.analytics);

  const [verifying, setVerifying] = useState(false);
  const [verCode, setVerCode] = useState('');
  const [verLoading, setVerLoading] = useState(false);

  useEffect(() => {
    dispatch(loadInterviewDashboard());
    dispatch(loadAnalyticsOverview({ range: '30d' }));
    dispatch(loadCodingAnalytics({ range: '30d' }));
    dispatch(loadResumeAnalytics());
    dispatch(loadCompanyReadiness());
  }, [dispatch]);

  // Construct real KPI metrics
  const metrics = [
    ['Total Interviews', String(interviewDashboard?.total || 0), 'Completed mock sessions'], 
    ['AI Interviews', String(interviewDashboard?.total || 0), 'Saved interview history'], 
    ['Coding Problems', String(user?.codingStats?.problemsSolved || 0), 'Problems successfully solved'], 
    ['Resume Score', `${overview?.resumeScore || 0}%`, 'Parsed ATS score'], 
    ['Weak Areas', String(interviewDashboard?.weakAreas?.length || 0), 'Key topics to improve'], 
    ['Average Score', `${interviewDashboard?.averageScore || 0}%`, 'Mock evaluations average']
  ];

  // Dynamic values maps
  const interviewProgress = interviewDashboard?.progress?.length ? interviewDashboard.progress : [];

  const codingData = coding?.topicPerformance?.length 
    ? coding.topicPerformance.map(item => ({ name: item.name, value: item.averageScore })) 
    : [];

  const resumeData = resume?.versions?.length 
    ? resume.versions.map(item => ({ name: item.versionName, value: item.score })) 
    : [];

  const careerScore = overview?.overallCareerScore || 0;

  const solvedCount = user?.codingStats?.problemsSolved || 0;
  const codingGoalProgress = `${Math.min(100, Math.round((solvedCount / 15) * 100))}%`;
  const interviewGoalProgress = (interviewDashboard?.total || 0) > 0 ? '100%' : '0%';

  const goals = [
    ['Daily goal', 'Complete one mock interview', interviewGoalProgress],
    ['Weekly goal', 'Solve 15 coding problems', codingGoalProgress],
    ['Interview reminder', 'Amazon SDE practice', (interviewDashboard?.total || 0) > 0 ? 'Completed mock practice' : 'No mock sessions scheduled'],
    ['Coding reminder', 'Algorithm preparation session', solvedCount > 0 ? 'Ready for next challenge' : 'No algorithm logs recorded']
  ];

  const companyData = readiness?.companies?.length
    ? readiness.companies.map(c => [c.company, c.score])
    : [];

  const handleSendVerification = async () => {
    try {
      const response = await apiClient.post('/auth/send-verification');
      toast.success(response.data.message || 'Verification email code sent.');
      if (response.data.token) {
        toast(`🔑 Dev Mode Code: ${response.data.token}`, { duration: 15000 });
      }
      setVerifying(true);
    } catch (err) {
      toast.error('Failed to trigger verification code resend.');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verCode) return;
    setVerLoading(true);
    try {
      const response = await apiClient.post('/auth/verify-email', { code: verCode });
      toast.success('Email successfully verified! ✦');
      dispatch(updateUserDirectly(response.data.user));
      setVerifying(false);
      setVerCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setVerLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Email Verification Alert Banner */}
      {!user?.isEmailVerified && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-semibold rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>Your email address is unverified. Please verify your email to unlock all features.</span>
          </div>
          <button 
            onClick={handleSendVerification}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4 py-1.5 font-bold transition whitespace-nowrap"
          >
            Verify Now
          </button>
        </div>
      )}

      <section className="welcome-panel">
        <div>
          <p className="dash-kicker">YOUR INTERVIEW WORKSPACE</p>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'there'} <span>✦</span></h1>
          <p>Keep your momentum going—your next opportunity is getting closer.</p>
        </div>
      </section>

      <section>
        <div className="section-title">
          <div>
            <p className="dash-kicker">GET STARTED</p>
            <h2>Quick actions</h2>
          </div>
        </div>
        <div className="quick-actions">
          {actions.map(([Icon, title, text, tone, path]) => (
            <div key={title} onClick={() => navigate(path)} className="cursor-pointer">
              <QuickActionCard icon={Icon} title={title} text={text} tone={tone} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-title">
          <div>
            <p className="dash-kicker">YOUR PROGRESS</p>
            <h2>Performance overview</h2>
          </div>
          <button onClick={() => navigate('/analytics')} className="subtle-button">
            View analytics
          </button>
        </div>
        <div className="stats-grid-dashboard">
          {metrics.map(([title, value, trend], index) => (
            <StatCard key={title} title={title} value={value} trend={trend} icon={statIcons[index]} index={index} />
          ))}
        </div>
      </section>

      <section className="dashboard-charts">
        <ChartCard title="Weekly interview progress" subtitle="Mock sessions completed">
          {interviewProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={interviewProgress}>
                <defs>
                  <linearGradient id="interviewFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".5" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff0d" vertical={false} />
                <XAxis dataKey="day" stroke="#b9b4c9" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#181421', border: '1px solid #ffffff1f', borderRadius: 10 }} />
                <Area dataKey="value" stroke="#a78bfa" strokeWidth={2.5} fill="url(#interviewFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-xs text-gray-500">
              No mock interviews completed this week.
            </div>
          )}
        </ChartCard>

        <ChartCard title="Coding progress" subtitle="Topic mastery">
          {codingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={codingData}>
                <CartesianGrid stroke="#ffffff0d" vertical={false} />
                <XAxis dataKey="name" stroke="#b9b4c9" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#181421', border: '1px solid #ffffff1f', borderRadius: 10 }} />
                <Bar dataKey="value" fill="#3979ed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-xs text-gray-500">
              Solve algorithm problems to show topic mastery.
            </div>
          )}
        </ChartCard>

        <ChartCard title="Resume improvement" subtitle="Score across versions">
          {resumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={resumeData}>
                <CartesianGrid stroke="#ffffff0d" vertical={false} />
                <XAxis dataKey="name" stroke="#b9b4c9" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#181421', border: '1px solid #ffffff1f', borderRadius: 10 }} />
                <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-xs text-gray-500">
              Upload your resume versions to track ATS progress.
            </div>
          )}
        </ChartCard>

        <ChartCard title="Skill growth" subtitle="Career Index">
          <div className="skill-growth">
            <FiTrendingUp />
            <strong>{careerScore}%</strong>
            <p>Overall Career Readiness Index</p>
            <div>
              <span style={{ width: `${careerScore}%` }} />
            </div>
          </div>
        </ChartCard>
      </section>

      <section className="dashboard-columns">
        <div className="space-y-5">
          <RecommendationCard />
          <section className="dash-card goals-card">
            <h3>Upcoming tasks</h3>
            <div className="mt-4 grid gap-3">
              {goals.map(([title, detail, progress]) => (
                <div className="goal-row" key={title}>
                  <span><FiAward /></span>
                  <div>
                    <b>{title}</b>
                    <small>{detail}</small>
                    {progress.includes('%') ? (
                      <div className="goal-progress"><i style={{ width: progress }} /></div>
                    ) : (
                      <em>{progress}</em>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="space-y-5">
          <ActivityCard />
        </div>
      </section>

      <section className="dash-card company-card">
        <header>
          <div>
            <p className="dash-kicker">TARGET COMPANIES</p>
            <h3>Company readiness</h3>
          </div>
          <span>Based on your profile and practice</span>
        </header>
        
        {companyData.length > 0 ? (
          <div className="company-grid">
            {companyData.map(([company, value]) => (
              <div key={company}>
                <div>
                  <b>{company}</b>
                  <strong>{value}%</strong>
                </div>
                <div className="company-progress"><i style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-gray-500">
            Please run a Skill Gap Assessment to map company readiness benchmarks.
          </div>
        )}
      </section>

      <FloatingAIButton />

      {/* Verification Overlay Modal */}
      {verifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#161424] shadow-2xl p-6 relative">
            <button 
              onClick={() => setVerifying(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-1 hover:bg-white/5 rounded-lg"
            >
              <FiX size={18} />
            </button>

            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-2xl mb-4">
                ✉️
              </span>
              <h3 className="text-lg font-bold text-white mb-2">Verify Your Email</h3>
              <p className="text-xs text-gray-400 mb-6">
                We sent a 6-digit verification code. Please input it below to verify your account.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <input 
                required
                type="text"
                maxLength="6"
                value={verCode}
                onChange={(e) => setVerCode(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 text-center text-xl font-mono tracking-widest text-white focus:border-violet-500 outline-none"
                placeholder="000000"
              />
              <button 
                type="submit"
                disabled={verLoading}
                className="primary-button w-full flex items-center justify-center gap-2"
              >
                {verLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={handleSendVerification}
                className="text-xs text-link font-semibold hover:underline"
              >
                Resend Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
