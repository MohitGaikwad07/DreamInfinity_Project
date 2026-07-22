import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { Interview } from '../models/Interview.js';
import { CodingSubmission } from '../models/CodingSubmission.js';
import { CommunityPost, CommunityComment } from '../models/Community.js';
import { Achievement } from '../models/Gamification.js';
import { Company, CompanyPreparation } from '../models/Company.js';
import { Profile } from '../models/Profile.js';

/**
 * Capitalizes first letter of words.
 */
const slugToTitle = (slug) => slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/**
 * Calculates a dynamic, live company readiness percentage.
 */
const calculateLiveCompanyReadiness = (companyName, userStats) => {
  const ats = userStats.latestResumeScore || 42;
  const coding = Math.min(100, Math.max(30, 30 + userStats.problemsSolved * 5));
  const interview = Math.min(100, Math.max(35, 35 + userStats.interviewCount * 8 + userStats.avgInterviewScore * 0.25));
  const communication = Math.min(100, Math.max(45, 45 + userStats.avgCommunicationScore * 0.4));
  
  // Custom modifiers based on company profiles
  let skillMatch = 45;
  if (companyName === 'Google') skillMatch = Math.min(100, 35 + userStats.problemsSolved * 6);
  else if (companyName === 'Meta') skillMatch = Math.min(100, 40 + userStats.problemsSolved * 5 + userStats.interviewCount * 4);
  else if (companyName === 'Microsoft') skillMatch = Math.min(100, 45 + userStats.experienceYears * 8);
  else skillMatch = Math.min(100, 50 + userStats.skillsCount * 4);

  const overall = Math.round(ats * 0.22 + skillMatch * 0.28 + coding * 0.2 + interview * 0.2 + communication * 0.1);
  return Math.max(10, Math.min(100, overall));
};

export const aggregateProfileActivity = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found.');

  // Fetch parallel data from all modules
  const [
    resumes,
    interviews,
    submissions,
    posts,
    comments,
    earnedAchievements,
    companyPreps
  ] = await Promise.all([
    Resume.find({ user: userId }).sort({ createdAt: -1 }),
    Interview.find({ user: userId }).sort({ createdAt: -1 }),
    CodingSubmission.find({ user: userId }).sort({ createdAt: -1 }),
    CommunityPost.find({ author: userId }).sort({ createdAt: -1 }),
    CommunityComment.find({ author: userId }).sort({ createdAt: -1 }),
    Achievement.find({ user: userId }),
    CompanyPreparation.find({ user: userId }).populate('company')
  ]);

  // 1. Resume Metrics
  const latestResume = resumes[0] || null;
  const resumeHistory = resumes.map(r => ({
    id: r._id,
    originalFilename: r.originalFilename,
    targetRole: r.targetRole,
    atsScore: r.atsScore,
    createdAt: r.createdAt,
    fileUrl: r.fileUrl
  }));

  // 2. Coding Metrics
  const problemsSolved = user.codingStats?.problemsSolved || submissions.filter(s => s.result?.status === 'accepted' || s.result?.status === 'Accepted' || s.result?.passedTests === s.result?.totalTests).length;
  const codingScore = Math.round(submissions.reduce((acc, curr) => acc + (curr.score?.overall || 0), 0) / (submissions.length || 1));
  const languagesUsed = [...new Set(submissions.map(s => s.language))].filter(Boolean);
  const recentSubmissions = submissions.slice(0, 10).map(s => ({
    id: s._id,
    questionTitle: s.questionTitle || s.questionId,
    language: s.language,
    status: s.result?.status || 'Submitted',
    score: s.score?.overall || 0,
    createdAt: s.createdAt
  }));
  
  // Basic language statistics
  const languageStats = submissions.reduce((acc, s) => {
    if (s.language) acc[s.language] = (acc[s.language] || 0) + 1;
    return acc;
  }, {});

  // 3. Interview Metrics
  const interviewCount = interviews.length;
  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const avgInterviewScore = Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.scores?.overall || 0), 0) / (completedInterviews.length || 1));
  const avgCommunicationScore = Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.scores?.communication || 0), 0) / (completedInterviews.length || 1));
  const avgProblemSolvingScore = Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.scores?.problemSolving || 0), 0) / (completedInterviews.length || 1));
  const avgTechnicalScore = Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.scores?.technical || 0), 0) / (completedInterviews.length || 1));
  
  const interviewHistory = interviews.slice(0, 10).map(i => ({
    id: i._id,
    targetCompany: i.targetCompany,
    targetRole: i.targetRole,
    type: i.interviewType,
    score: i.scores?.overall || 0,
    status: i.status,
    completedAt: i.completedAt || i.startedAt
  }));

  // 4. Community Profile
  const postCount = posts.length;
  const commentCount = comments.length;
  const helpfulScore = posts.reduce((acc, curr) => acc + (curr.helpfulCount || 0) + (curr.votes || 0), 0);
  const communityRank = Math.max(1, 100 - Math.floor(helpfulScore / 5));

  // 5. Achievements & Gamification
  const badgesList = earnedAchievements.map(a => ({
    key: a.key,
    title: a.title,
    tier: a.tier,
    earnedAt: a.earnedAt
  }));

  // Compute overall profile statistics helper
  const profile = await Profile.findOne({ user: userId });
  const skillsCount = profile ? (
    (profile.skills?.programmingLanguages?.length || 0) +
    (profile.skills?.frameworks?.length || 0) +
    (profile.skills?.databases?.length || 0) +
    (profile.skills?.cloud?.length || 0) +
    (profile.skills?.devOps?.length || 0) +
    (profile.skills?.aiMl?.length || 0) +
    (profile.skills?.tools?.length || 0) +
    (profile.skills?.softSkills?.length || 0)
  ) : 0;
  
  const experienceYears = profile?.experience?.reduce((acc, exp) => {
    const start = exp.startDate ? new Date(exp.startDate) : new Date();
    const end = exp.current ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
    const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
    return acc + Math.max(0, years);
  }, 0) || 0;

  const userStats = {
    latestResumeScore: latestResume?.atsScore || user.resumeScore || 0,
    problemsSolved,
    interviewCount,
    avgInterviewScore: avgInterviewScore || 0,
    avgCommunicationScore: avgCommunicationScore || 0,
    skillsCount,
    experienceYears
  };

  // 6. Company Readiness
  const targetCompanies = ['Google', 'Amazon', 'Microsoft', 'Adobe', 'Netflix', 'Oracle', 'Meta'];
  const readinessPercentages = {};
  targetCompanies.forEach(company => {
    // Check if we have a saved prep record
    const prep = companyPreps.find(p => p.company?.name?.toLowerCase() === company.toLowerCase() || p.companyName?.toLowerCase() === company.toLowerCase());
    if (prep && prep.readiness?.overall) {
      readinessPercentages[company] = prep.readiness.overall;
    } else {
      // Calculate live readiness dynamically
      readinessPercentages[company] = calculateLiveCompanyReadiness(company, userStats);
    }
  });

  // 7. Dynamic AI Skill Scores calculation
  const calculatedSkillScores = {
    programming: codingScore || Math.min(95, Math.max(20, 45 + problemsSolved * 3)),
    frontend: profile?.skills?.frameworks?.some(s => ['react', 'vue', 'angular', 'nextjs'].includes(s.name.toLowerCase())) ? 75 : 50,
    backend: profile?.skills?.frameworks?.some(s => ['nodejs', 'express', 'django', 'spring'].includes(s.name.toLowerCase())) ? 80 : 55,
    database: profile?.skills?.databases?.length ? Math.min(95, 60 + profile.skills.databases.length * 8) : 45,
    communication: avgCommunicationScore || 70,
    problemSolving: avgProblemSolvingScore || Math.min(95, Math.max(30, 50 + problemsSolved * 2.5)),
  };
  
  calculatedSkillScores.overall = Math.round(
    (calculatedSkillScores.programming +
     calculatedSkillScores.frontend +
     calculatedSkillScores.backend +
     calculatedSkillScores.database +
     calculatedSkillScores.communication +
     calculatedSkillScores.problemSolving) / 6
  );

  return {
    user: {
      name: user.name,
      email: user.email,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      longestStreak: user.longestStreak,
      coins: user.coins,
      avatar: user.avatar
    },
    latestResume: latestResume ? {
      fileUrl: latestResume.fileUrl,
      originalFilename: latestResume.originalFilename,
      atsScore: latestResume.atsScore,
      targetRole: latestResume.targetRole,
      createdAt: latestResume.createdAt
    } : null,
    resumeHistory,
    codingHistory: {
      problemsSolved,
      languages: languagesUsed,
      recentSubmissions,
      codingScore: codingScore || 0,
      executionStatistics: {
        totalSubmissions: submissions.length,
        languageBreakdown: languageStats
      }
    },
    interviewHistory: {
      completedCount: completedInterviews.length,
      averageScore: avgInterviewScore || 0,
      feedback: completedInterviews.map(i => i.feedback?.suggestedImprovements || []).flat().slice(0, 5),
      recentInterviews: interviewHistory
    },
    companyReadiness: readinessPercentages,
    communityProfile: {
      postCount,
      commentCount,
      helpfulScore,
      communityRank
    },
    achievements: {
      badges: badgesList,
      xp: user.xp,
      level: user.level,
      longestStreak: user.longestStreak,
      careerScore: calculatedSkillScores.overall,
      interviewReadiness: avgInterviewScore || 0
    },
    calculatedSkillScores
  };
};
