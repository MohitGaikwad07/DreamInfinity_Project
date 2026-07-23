import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Interview } from '../models/Interview.js';
import { InterviewRoom } from '../models/InterviewRoom.js';
import { CodingSubmission } from '../models/CodingSubmission.js';
import { Resume } from '../models/Resume.js';
import { SkillGap } from '../models/SkillGap.js';
import { CommunityPost, CommunityComment, CommunityFollow } from '../models/Community.js';
import { Achievement, XPActivity } from '../models/Gamification.js';
import { AnalyticsSnapshot } from '../models/AnalyticsSnapshot.js';
import { getAIService } from './ai/index.js';

// Dictionary mapping coding question IDs to DSA Categories and metadata
const problemDetails = {
  'two-sum': { difficulty: 'Easy', category: 'Arrays', companies: ['Google', 'Amazon'] },
  'valid-parentheses': { difficulty: 'Easy', category: 'Stacks', companies: ['Meta', 'Microsoft'] },
  'number-of-islands': { difficulty: 'Medium', category: 'Graphs', companies: ['Amazon', 'Google'] },
  'reverse-string': { difficulty: 'Easy', category: 'Strings', companies: ['Google', 'Apple'] },
  'linked-list-cycle': { difficulty: 'Medium', category: 'Linked Lists', companies: ['Amazon', 'Microsoft'] },
  'merge-k-sorted-lists': { difficulty: 'Hard', category: 'Linked Lists', companies: ['Google', 'Facebook'] },
  'binary-tree-inorder': { difficulty: 'Easy', category: 'Trees', companies: ['Amazon', 'Microsoft'] },
  'climbing-stairs': { difficulty: 'Easy', category: 'Dynamic Programming', companies: ['Google', 'Adobe'] },
  'coin-change': { difficulty: 'Medium', category: 'Dynamic Programming', companies: ['Amazon', 'Google'] },
  'lru-cache': { difficulty: 'Hard', category: 'Linked Lists', companies: ['Google', 'Amazon'] },
  'fibonacci': { difficulty: 'Easy', category: 'Recursion', companies: ['Microsoft'] },
  'sudoku-solver': { difficulty: 'Hard', category: 'Backtracking', companies: ['Google'] },
};

const getProblemMeta = (questionId) => {
  return problemDetails[questionId] || { difficulty: 'Medium', category: 'Arrays', companies: [] };
};

// Date helper mapping filter queries to dates
export const resolveDateFilter = (range, startDate, endDate) => {
  if (range === 'custom' && startDate) {
    return { $gte: new Date(startDate), $lte: new Date(endDate || Date.now()) };
  }
  let ms = 0;
  switch (range) {
    case '7d': ms = 7 * 86400000; break;
    case '30d': ms = 30 * 86400000; break;
    case '3m': ms = 90 * 86400000; break;
    case '6m': ms = 180 * 86400000; break;
    case '1y': ms = 365 * 86400000; break;
    case 'all': default: return null;
  }
  return { $gte: new Date(Date.now() - ms) };
};

// Lazy snapshotting evaluator
export const getOrCreateSnapshot = async (userId) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const startOfDay = new Date(todayStr);
  const endOfDay = new Date(todayStr + 'T23:59:59.999Z');

  let snapshot = await AnalyticsSnapshot.findOne({
    user: userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });

  if (snapshot) return snapshot;

  const user = await User.findById(userId);
  if (!user) return null;

  const [coding, interviews, community] = await Promise.all([
    CodingSubmission.countDocuments({ user: userId }),
    Interview.countDocuments({ user: userId }),
    CommunityPost.countDocuments({ author: userId })
  ]);

  const resume = user.resumeScore || 0;
  const codingScore = Math.min(100, coding * 12);
  const interviewScore = interviews > 0 ? Math.min(100, interviews * 18 + 35) : 0;
  const skillScore = Math.min(100, Math.round(user.xp / 18));
  const communicationScore = interviews > 0 ? Math.min(100, interviews * 18 + 35) : 0;

  const overall = Math.min(100, Math.round(
    resume * 0.25 +
    codingScore * 0.25 +
    interviewScore * 0.20 +
    (community > 0 ? Math.min(100, community * 15 + 30) : 0) * 0.1 +
    Math.min(100, user.xp / 20) * 0.2
  ));

  const rank = await User.countDocuments({ xp: { $gt: user.xp } }) + 1;

  snapshot = await AnalyticsSnapshot.create({
    user: userId,
    date: new Date(),
    careerScore: overall,
    interviewScore,
    codingScore,
    resumeScore: resume,
    skillScore,
    communicationScore,
    readinessScore: overall,
    xp: user.xp,
    rank
  });

  return snapshot;
};

// Core Analytics calculators

export const getOverviewAnalytics = async (userId, dateFilter) => {
  await getOrCreateSnapshot(userId);

  const user = await User.findById(userId);
  const snapshotQuery = { user: userId };
  if (dateFilter) {
    snapshotQuery.date = dateFilter;
  }

  const snapshots = await AnalyticsSnapshot.find(snapshotQuery).sort({ date: 1 });

  const [codingCount, interviewCount, communityCount] = await Promise.all([
    CodingSubmission.countDocuments({ user: userId }),
    Interview.countDocuments({ user: userId, status: 'completed' }),
    CommunityPost.countDocuments({ author: userId })
  ]);

  const resumeScore = user.resumeScore || 0;
  const codingScore = Math.min(100, codingCount * 12);
  const interviewScore = interviewCount > 0 ? Math.min(100, interviewCount * 18 + 35) : 0;
  const communicationScore = interviewCount > 0 ? Math.min(100, interviewCount * 18 + 35) : 0;
  const technicalScore = interviewCount > 0 ? Math.min(100, interviewCount * 14 + 40) : 0;

  const overall = Math.min(100, Math.round(
    resumeScore * 0.25 +
    codingScore * 0.25 +
    interviewScore * 0.20 +
    (communityCount > 0 ? Math.min(100, communityCount * 15 + 30) : 0) * 0.1 +
    Math.min(100, user.xp / 20) * 0.2
  ));

  const rank = await User.countDocuments({ xp: { $gt: user.xp } }) + 1;

  return {
    overallCareerScore: overall,
    interviewReadinessScore: interviewScore,
    resumeScore,
    codingScore,
    communicationScore,
    technicalScore,
    currentRank: rank,
    xp: user.xp,
    level: user.level,
    currentStreak: user.streak,
    longestStreak: user.longestStreak,
    snapshots: snapshots.map(s => ({
      date: s.date.toISOString().slice(0, 10),
      careerScore: s.careerScore,
      interviewScore: s.interviewScore,
      codingScore: s.codingScore,
      resumeScore: s.resumeScore
    }))
  };
};

export const getInterviewAnalytics = async (userId, dateFilter) => {
  const query = { user: userId, status: 'completed' };
  if (dateFilter) {
    query.completedAt = dateFilter;
  }

  const aiInterviews = await Interview.find(query).sort({ completedAt: 1 });
  const humanRooms = await InterviewRoom.find({
    participants: userId,
    status: 'completed',
    ...(dateFilter ? { endedAt: dateFilter } : {})
  });

  const totalAI = aiInterviews.length;
  const totalHuman = humanRooms.length;
  const total = totalAI + totalHuman;

  // Calculate AI scores
  let average = 0;
  let best = 0;
  let technical = 0;
  let communication = 0;
  let confidence = 0;
  let problemSolving = 0;
  let grammar = 0;
  let totalDurationSeconds = 0;

  if (totalAI > 0) {
    let sumScore = 0;
    let sumTech = 0;
    let sumComm = 0;
    let sumConf = 0;
    let sumProblem = 0;
    let sumGrammar = 0;

    aiInterviews.forEach(interview => {
      const s = interview.scores || {};
      sumScore += s.overall || 0;
      sumTech += s.technical || 0;
      sumComm += s.communication || 0;
      sumConf += s.confidence || 0;
      sumProblem += s.problemSolving || 0;
      sumGrammar += s.grammar || 0;
      best = Math.max(best, s.overall || 0);
      totalDurationSeconds += interview.actualDurationSeconds || 0;
    });

    average = Math.round(sumScore / totalAI);
    technical = Math.round(sumTech / totalAI);
    communication = Math.round(sumComm / totalAI);
    confidence = Math.round(sumConf / totalAI);
    problemSolving = Math.round(sumProblem / totalAI);
    grammar = Math.round(sumGrammar / totalAI);
  }

  // Calculate peer ratings
  let peerOverallSum = 0;
  let peerCount = 0;
  humanRooms.forEach(room => {
    room.ratings.forEach(rating => {
      if (String(rating.to) === String(userId)) {
        peerOverallSum += rating.overallExperience || 0;
        peerCount++;
      }
    });
  });
  const averageHumanRating = peerCount > 0 ? Math.round((peerOverallSum / peerCount) * 20) : 75; // out of 100

  // Score Trend
  const trend = aiInterviews.map((item, idx) => ({
    name: `Int. ${idx + 1}`,
    score: item.scores?.overall || 0,
    date: item.completedAt.toISOString().slice(0, 10)
  }));

  // Group-bys
  const diffMap = {};
  const roleMap = {};
  const compMap = {};

  aiInterviews.forEach(item => {
    const diff = item.difficulty || 'Medium';
    const role = item.targetRole || 'Software Engineer';
    const comp = item.targetCompany || 'General';
    const score = item.scores?.overall || 0;

    if (!diffMap[diff]) diffMap[diff] = { sum: 0, count: 0 };
    diffMap[diff].sum += score;
    diffMap[diff].count++;

    if (!roleMap[role]) roleMap[role] = { sum: 0, count: 0 };
    roleMap[role].sum += score;
    roleMap[role].count++;

    if (!compMap[comp]) compMap[comp] = { sum: 0, count: 0 };
    compMap[comp].sum += score;
    compMap[comp].count++;
  });

  const performanceByDifficulty = Object.entries(diffMap).map(([k, v]) => ({ name: k, score: Math.round(v.sum / v.count) }));
  const performanceByRole = Object.entries(roleMap).map(([k, v]) => ({ name: k, score: Math.round(v.sum / v.count) })).slice(0, 5);
  const performanceByCompany = Object.entries(compMap).map(([k, v]) => ({ name: k, score: Math.round(v.sum / v.count) })).slice(0, 5);

  // Comparison metrics (Last 3 vs prior)
  let improvement = {
    communication: { val1: 65, val2: 65, diff: 0, status: 'No Significant Change' },
    technical: { val1: 60, val2: 60, diff: 0, status: 'No Significant Change' },
    confidence: { val1: 65, val2: 65, diff: 0, status: 'No Significant Change' }
  };

  if (totalAI >= 5) {
    const recent = aiInterviews.slice(-3);
    const prior = aiInterviews.slice(0, -3);

    const getAvg = (list, key) => Math.round(list.reduce((sum, item) => sum + (item.scores?.[key] || 0), 0) / list.length);
    const getStatus = (diff) => diff > 2 ? 'Improved' : diff < -2 ? 'Declined' : 'No Significant Change';

    const fields = ['communication', 'technical', 'confidence'];
    fields.forEach(field => {
      const val1 = getAvg(prior, field);
      const val2 = getAvg(recent, field);
      const diff = val2 - val1;
      improvement[field] = { val1, val2, diff, status: getStatus(diff) };
    });
  }

  return {
    totalInterviews: total,
    aiInterviewsCompleted: totalAI,
    humanInterviewsCompleted: totalHuman,
    averageScore: average,
    bestScore: best,
    technicalScore: technical,
    communicationScore: communication,
    confidenceScore: confidence,
    problemSolvingScore: problemSolving,
    grammarScore: grammar,
    averageHumanRating,
    averageDurationMinutes: Math.round(totalDurationSeconds / (totalAI || 1) / 60),
    scoreTrend: trend,
    performanceByDifficulty,
    performanceByRole,
    performanceByCompany,
    improvement
  };
};

export const getCodingAnalytics = async (userId, dateFilter) => {
  const query = { user: userId };
  if (dateFilter) {
    query.createdAt = dateFilter;
  }

  const submissions = await CodingSubmission.find(query).sort({ createdAt: 1 });
  const solvedList = submissions.filter(s => s.score?.accuracy === 100);

  const attempted = submissions.length;
  const solved = solvedList.length;
  const successRate = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;

  // Language mapping
  const langCount = {};
  let totalTime = 0;
  let totalMem = 0;

  submissions.forEach(s => {
    langCount[s.language] = (langCount[s.language] || 0) + 1;
    totalTime += s.result?.executionTime || 0;
    totalMem += s.result?.memory || 0;
  });

  const languageDistribution = Object.entries(langCount).map(([k, v]) => ({ name: k, count: v }));
  const mostUsedLanguage = languageDistribution.sort((a,b) => b.count - a.count)[0]?.name || 'JavaScript';

  // Topic performance and Difficulty distribution
  const topicStats = {};
  let easy = 0, medium = 0, hard = 0;

  solvedList.forEach(s => {
    const meta = getProblemMeta(s.questionId);
    if (meta.difficulty === 'Easy') easy++;
    if (meta.difficulty === 'Medium') medium++;
    if (meta.difficulty === 'Hard') hard++;

    const cat = meta.category;
    if (!topicStats[cat]) topicStats[cat] = { solved: 0, scoreSum: 0 };
    topicStats[cat].solved++;
    topicStats[cat].scoreSum += s.score?.overall || 0;
  });

  const topicPerformance = Object.entries(topicStats).map(([k, v]) => ({
    name: k,
    solved: v.solved,
    averageScore: Math.round(v.scoreSum / v.solved)
  }));

  // Solved Over Time
  const dailySolved = {};
  solvedList.forEach(s => {
    const day = s.createdAt.toISOString().slice(0, 10);
    dailySolved[day] = (dailySolved[day] || 0) + 1;
  });
  const problemsSolvedOverTime = Object.entries(dailySolved).map(([k, v]) => ({ date: k, count: v }));

  return {
    problemsAttempted: attempted,
    problemsSolved: solved,
    easyProblemsSolved: easy,
    mediumProblemsSolved: medium,
    hardProblemsSolved: hard,
    successRate,
    averageExecutionTime: attempted > 0 ? Number((totalTime / attempted).toFixed(3)) : 0,
    averageMemoryUsage: attempted > 0 ? Number((totalMem / attempted).toFixed(1)) : 0,
    mostUsedProgrammingLanguage,
    problemsSolvedOverTime,
    difficultyDistribution: [
      { name: 'Easy', count: easy },
      { name: 'Medium', count: medium },
      { name: 'Hard', count: hard }
    ],
    topicPerformance,
    languageDistribution
  };
};

export const getResumeAnalytics = async (userId) => {
  const resumes = await Resume.find({ user: userId }).sort({ createdAt: 1 });
  const total = resumes.length;

  if (total === 0) {
    return {
      currentAtsScore: 0,
      versions: [],
      skillsAdded: [],
      missingSkills: [],
      suggestions: []
    };
  }

  const latest = resumes[total - 1];
  const first = resumes[0];
  const improvement = latest.atsScore - first.atsScore;

  const versions = resumes.map((item, idx) => ({
    versionName: `V.${idx + 1}`,
    score: item.atsScore,
    date: item.createdAt.toISOString().slice(0, 10)
  }));

  return {
    currentAtsScore: latest.atsScore,
    previousAtsScores: resumes.slice(0, -1).map(r => r.atsScore),
    resumeImprovement: improvement,
    skillsAdded: latest.skills?.map(s => s.name) || [],
    missingSkills: latest.missingSkills || [],
    suggestions: latest.suggestions || [],
    versions
  };
};

export const getSkillAnalytics = async (userId) => {
  const assessment = await SkillGap.findOne({ user: userId }).sort({ createdAt: -1 });

  if (!assessment) {
    return {
      radarData: [],
      strongSkills: [],
      improvingSkills: [],
      weakSkills: [],
      missingSkills: []
    };
  }

  const b = assessment.readinessBreakdown || {};
  const radarData = [
    { subject: 'Resume', A: b.resumeQuality || 50, B: 75, fullMark: 100 },
    { subject: 'Tech Skills', A: b.technicalSkills || 50, B: 80, fullMark: 100 },
    { subject: 'Projects', A: b.projects || 50, B: 85, fullMark: 100 },
    { subject: 'Coding', A: b.coding || 50, B: 90, fullMark: 100 },
    { subject: 'Comm.', A: b.communication || 50, B: 85, fullMark: 100 },
    { subject: 'Interviews', A: b.interviewPerformance || 50, B: 90, fullMark: 100 }
  ];

  return {
    radarData,
    strongSkills: assessment.strongAreas || [],
    improvingSkills: assessment.improvementAreas || [],
    weakSkills: assessment.missingSkills?.slice(0, 2) || [],
    missingSkills: assessment.missingSkills || []
  };
};

export const getCompanyReadinessAnalytics = async (userId) => {
  const assessment = await SkillGap.findOne({ user: userId }).sort({ createdAt: -1 });
  const resumeScore = await Resume.findOne({ user: userId }).sort({ createdAt: -1 }).select('atsScore');

  if (!assessment) {
    return { companies: [] };
  }

  const b = assessment.readinessBreakdown || {};
  const resVal = resumeScore?.atsScore || 65;

  const companies = assessment.companyScores.map(cs => {
    // readiness breakdown logic: target company base with minor score shifts
    return {
      company: cs.company,
      score: cs.score,
      breakdown: [
        { name: 'Resume Match', value: resVal },
        { name: 'Tech Skills', value: b.technicalSkills || 60 },
        { name: 'Coding', value: b.coding || 55 },
        { name: 'Comm.', value: b.communication || 65 },
        { name: 'Interview Perf.', value: b.interviewPerformance || 50 }
      ]
    };
  });

  return { companies };
};

export const getLearningAnalytics = async (userId) => {
  const assessment = await SkillGap.findOne({ user: userId }).sort({ createdAt: -1 });
  const user = await User.findById(userId);

  if (!assessment || !assessment.roadmap?.length) {
    return {
      roadmapCompletion: 0,
      skillsCompleted: 0,
      skillsInProgress: 0,
      roadmap: [],
      completedWeeks: []
    };
  }

  const totalWeeks = assessment.roadmap.length;
  const completedCount = assessment.completedWeeks?.length || 0;
  const completionPercentage = totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0;

  return {
    roadmapCompletion: completionPercentage,
    skillsCompleted: completedCount,
    skillsInProgress: Math.max(0, totalWeeks - completedCount),
    learningStreak: user?.streak || 0,
    roadmap: assessment.roadmap,
    completedWeeks: assessment.completedWeeks || []
  };
};

export const getCommunityAnalytics = async (userId) => {
  const [posts, experiences, questions, comments, followers] = await Promise.all([
    CommunityPost.countDocuments({ author: userId }),
    CommunityPost.countDocuments({ author: userId, type: 'experience' }),
    CommunityPost.countDocuments({ author: userId, type: 'question' }),
    CommunityComment.countDocuments({ author: userId }),
    CommunityFollow.countDocuments({ targetType: 'user', target: String(userId) })
  ]);

  // Aggregate upvotes
  const postsVotes = await CommunityPost.aggregate([
    { $match: { author: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$votes' } } }
  ]);
  const commentsVotes = await CommunityComment.aggregate([
    { $match: { author: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$votes' } } }
  ]);

  const upvotes = (postsVotes[0]?.total || 0) + (commentsVotes[0]?.total || 0);

  return {
    posts,
    interviewExperiences: experiences,
    questions,
    answers: comments,
    upvotesReceived: Math.max(0, upvotes),
    helpfulScore: Math.max(0, upvotes * 2 + comments * 3),
    followers,
    communityRank: Math.max(1, 100 - (posts * 10 + comments * 5)) // mock rank offset
  };
};

// Achievement timeline aggregator
export const getTimeline = async (userId) => {
  const [activities, interviews, submissions, achievements, resumes] = await Promise.all([
    XPActivity.find({ user: userId, action: /level_up/i }).sort({ createdAt: -1 }),
    Interview.find({ user: userId, status: 'completed' }).sort({ completedAt: -1 }).limit(10),
    CodingSubmission.find({ user: userId, 'score.accuracy': 100 }).sort({ createdAt: -1 }).limit(10),
    Achievement.find({ user: userId }).sort({ earnedAt: -1 }),
    Resume.find({ user: userId }).sort({ createdAt: -1 })
  ]);

  const timeline = [];

  // 1. Level Ups
  activities.forEach(item => {
    timeline.push({
      type: 'level',
      title: 'Level Up!',
      detail: item.description || `Reached a new XP benchmark.`,
      date: item.createdAt
    });
  });

  // 2. Interviews completed
  interviews.forEach(item => {
    timeline.push({
      type: 'interview',
      title: 'Interview Completed',
      detail: `Mocked ${item.targetRole} for ${item.targetCompany || 'General'} (Score: ${item.scores?.overall}%)`,
      date: item.completedAt
    });
  });

  // 3. Coding solved
  submissions.forEach(item => {
    timeline.push({
      type: 'coding',
      title: 'Problem Solved',
      detail: `Solved: "${item.questionTitle}" in ${item.language.toUpperCase()}`,
      date: item.createdAt
    });
  });

  // 4. Badges unlocked
  achievements.forEach(item => {
    timeline.push({
      type: 'badge',
      title: `Unlocked: ${item.title}`,
      detail: `Earned ${item.tier.toUpperCase()} tier credentials.`,
      date: item.earnedAt
    });
  });

  // 5. Resume improvements
  resumes.forEach((item, idx) => {
    timeline.push({
      type: 'resume',
      title: `Resume Version V.${idx + 1}`,
      detail: `Uploaded resume (Score: ${item.atsScore} ATS)`,
      date: item.createdAt
    });
  });

  // Sort chronological descending
  return timeline.sort((a,b) => b.date - a.date).slice(0, 15);
};

// Shared AI Services (Gemini integration)

export const getAIInsights = async (userId) => {
  const user = await User.findById(userId);
  const [interviews, coding, resume, skills] = await Promise.all([
    getInterviewAnalytics(userId, null),
    getCodingAnalytics(userId, null),
    getResumeAnalytics(userId),
    getSkillAnalytics(userId)
  ]);

  const textMetrics = `
    Candidate Profile:
    - Target Company: ${user.company || 'Google/Amazon/Meta'}
    - Target Role: Software Engineer
    - Level: ${user.level} (XP: ${user.xp})
    - Resume ATS Score: ${resume.currentAtsScore}%
    - AI Interview Average Score: ${interviews.averageScore}% (Total completed: ${interviews.aiInterviewsCompleted})
    - Technical Score: ${interviews.technicalScore}%, Communication Score: ${interviews.communicationScore}%
    - Coding Problems Solved: ${coding.problemsSolved} (Easy: ${coding.easyProblemsSolved}, Medium: ${coding.mediumProblemsSolved}, Hard: ${coding.hardProblemsSolved})
    - Most Used Programming Language: ${coding.mostUsedProgrammingLanguage}
    - Strong Skill Areas: ${skills.strongSkills.join(', ')}
    - Weak / Missing Skills: ${skills.missingSkills.join(', ')}
  `;

  const prompt = `
    ${textMetrics}
    
    Please output a brief JSON report containing two properties:
    1. "insights": a 3-4 sentence paragraph highlighting recent career readiness progress, strengths, and priority skills to improve.
    2. "nextAction": a single, extremely actionable next step sentence (e.g. "Solve 3 Graph coding problems." or "Take a System Design mock interview.").
  `;

  try {
    const rawReply = await getAIService().generate({
      systemInstruction: 'You are an elite, concise technical career coach. Output strictly valid JSON.',
      prompt,
      responseFormat: 'json'
    });
    return JSON.parse(rawReply.replace(/^```json\s*|\s*```$/g, '').trim());
  } catch (error) {
    return {
      insights: `Your resume is currently rated at ${resume.currentAtsScore}% ATS. You have solved ${coding.problemsSolved} coding questions and completed ${interviews.aiInterviewsCompleted} interviews. Keep practicing to generate deeper AI metrics!`,
      nextAction: 'Take a System Design mock interview.'
    };
  }
};

export const getAIWeeklyReport = async (userId) => {
  const user = await User.findById(userId);
  const range7d = resolveDateFilter('7d');
  
  const [interviews, coding, resume, skills] = await Promise.all([
    getInterviewAnalytics(userId, range7d),
    getCodingAnalytics(userId, range7d),
    getResumeAnalytics(userId),
    getSkillAnalytics(userId)
  ]);

  const weeklySummaryText = `
    Weekly Training Stats:
    - Interviews Completed: ${interviews.aiInterviewsCompleted}
    - Coding Problems Solved: ${coding.problemsSolved}
    - XP Earned this week: 180 XP
    - Current Streak: ${user.streak} days
    - Target: ${user.company || 'FAANG'}
    - Strong Areas: ${skills.strongSkills.join(', ')}
    - Weak Areas: ${skills.missingSkills.join(', ')}
  `;

  const prompt = `
    Based on the following candidate metrics this week:
    ${weeklySummaryText}
    
    Please compile a comprehensive weekly preparation progress report.
    Return ONLY JSON with these fields:
    - achievementsThisWeek: string
    - performanceImprovements: string
    - areasDeclined: string
    - strongestSkill: string
    - weakestSkill: string
    - recommendedFocus: string
    - suggestedCodingProblems: array of strings (list 2-3 problem names)
    - suggestedMockInterview: string (e.g., "Google Systems Design Mock Room")
    - recommendedLearningTasks: array of strings (list 2-3 roadmap targets)
  `;

  try {
    const rawReply = await getAIService().generate({
      systemInstruction: 'You are an executive coach detailing candidate weekly achievements. Output strictly valid JSON.',
      prompt,
      responseFormat: 'json'
    });
    return JSON.parse(rawReply.replace(/^```json\s*|\s*```$/g, '').trim());
  } catch (error) {
    return {
      achievementsThisWeek: 'Completed practice items in coding and mock interviews.',
      performanceImprovements: 'Coding success rates are steady.',
      areasDeclined: 'No significant decline recorded.',
      strongestSkill: 'Language syntax and structure',
      weakestSkill: 'System Design scaling',
      recommendedFocus: 'Practice data structure problems on trees and graphs.',
      suggestedCodingProblems: ['Binary Tree Inorder Traversal', 'Number of Islands'],
      suggestedMockInterview: 'Practice an AI Mock Interview focusing on Graphs.',
      recommendedLearningTasks: ['Review Dynamic Programming algorithms', 'Optimize resume description details']
    };
  }
};
