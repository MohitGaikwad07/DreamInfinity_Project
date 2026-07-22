import mongoose from 'mongoose';
import { Achievement, Challenge, XPActivity } from '../models/Gamification.js';

const MS_DAY = 86400000;
export const levelFor = (xp) => Math.max(1, Math.floor(Math.sqrt(xp / 120)) + 1);
export const xpForLevel = (level) => 120 * (level ** 2);

export const shopItems = {
  titles: [
    { id: 'google_ready', name: 'Google Ready', price: 100, type: 'title', description: 'Show you are prepared for Google interviews' },
    { id: 'amazon_ready', name: 'Amazon Ready', price: 100, type: 'title', description: 'Show you are prepared for Amazon interviews' },
    { id: 'coding_wizard', name: 'Coding Wizard', price: 150, type: 'title', description: 'Master of coding problems and syntax' },
    { id: 'system_architect', name: 'System Architect', price: 200, type: 'title', description: 'Expert in system design and architecture' },
    { id: 'mock_master', name: 'Mock Master', price: 150, type: 'title', description: 'Completed a vast number of AI mock interviews' },
    { id: 'ai_pioneer', name: 'AI Pioneer', price: 120, type: 'title', description: 'Early adopter of AI career tools' }
  ],
  frames: [
    { id: 'neon_glow', name: 'Neon Glow', price: 250, type: 'frame', description: 'An animated glowing neon border' },
    { id: 'golden_crown', name: 'Golden Crown', price: 300, type: 'frame', description: 'A regal gold crown above your avatar' },
    { id: 'cyberpunk_grid', name: 'Cyberpunk Grid', price: 350, type: 'frame', description: 'Matrix style animated grid background border' },
    { id: 'favour_pioneer', name: 'Favour Pioneer', price: 200, type: 'frame', description: 'A classy sparkly purple frame' }
  ]
};

const achievementDefs = [
  { key: 'first_interview', title: 'First Interview', tier: 'bronze', check: ({ interviews }) => interviews >= 1, description: 'Completed your first AI Mock Interview' },
  { key: 'resume_master', title: 'Resume Master', tier: 'gold', check: ({ resumeScore }) => resumeScore >= 80, description: 'Achieve an ATS score of 80 or higher' },
  { key: 'hundred_coding', title: 'Coding Champion', tier: 'platinum', check: ({ coding }) => coding >= 100 || coding >= 5, description: 'Solve 100 coding problems (5 for early badge)' },
  { key: 'community_helper', title: 'Community Helper', tier: 'silver', check: ({ comments }) => comments >= 5, description: 'Write 5 comments/replies to help others' },
  { key: 'ai_interview_expert', title: 'AI Interview Expert', tier: 'diamond', check: ({ interviews }) => interviews >= 10, description: 'Complete 10 AI mock interviews' },
  { key: 'top_mentor', title: 'Top Mentor', tier: 'legend', check: ({ comments }) => comments >= 10, description: 'Write 10 or more helpful replies' },
  { key: 'top_contributor', title: 'Top Contributor', tier: 'gold', check: ({ community }) => community >= 5, description: 'Post 5 community experiences' },
  { key: 'hundred_day_streak', title: 'Consistency King', tier: 'legend', check: ({ streak }) => streak >= 100 || streak >= 7, description: 'Maintain a 100-day practice streak (7 for early badge)' },
  { key: 'google_ready_badge', title: 'Google Ready', tier: 'platinum', check: ({ googlePrep }) => googlePrep >= 3, description: 'Complete 3 Google company prep sessions' },
  { key: 'amazon_ready_badge', title: 'Amazon Ready', tier: 'platinum', check: ({ amazonPrep }) => amazonPrep >= 3, description: 'Complete 3 Amazon company prep sessions' }
];

const defaults = [
  { key: 'daily_practice', title: 'Complete one focused practice session', type: 'daily', target: 1, rewardXp: 30, rewardCoins: 5, days: 1 },
  { key: 'weekly_coding', title: 'Solve 5 coding problems', type: 'weekly', target: 5, rewardXp: 120, rewardCoins: 20, days: 7 },
  { key: 'monthly_growth', title: 'Earn 500 XP this month', type: 'monthly', target: 500, rewardXp: 250, rewardCoins: 50, days: 30 }
];

export const rewards = {
  dailyLogin: { action: 'daily_login', xp: 10, coins: 2, description: 'Daily login bonus' },
  resumeUpload: { action: 'resume_upload', xp: 35, coins: 5, description: 'Resume uploaded and analyzed' },
  resumeImprovement: { action: 'resume_improvement', xp: 20, coins: 3, description: 'Resume analysis improved' },
  resumeAtsIncrease: { action: 'resume_ats_increase', xp: 40, coins: 8, description: 'Resume ATS score increased' },
  aiInterview: { action: 'ai_interview_complete', xp: 60, coins: 10, description: 'AI mock interview completed' },
  codingInterview: { action: 'coding_interview_complete', xp: 65, coins: 12, description: 'Coding interview completed' },
  codingSolved: { action: 'coding_solved', xp: 40, coins: 8, description: 'Coding problem solved' },
  codingAttempt: { action: 'coding_attempt', xp: 8, coins: 1, description: 'Coding problem attempted' },
  communityPost: { action: 'community_post', xp: 15, coins: 3, description: 'Community experience shared' },
  communityAnswer: { action: 'community_answer', xp: 8, coins: 2, description: 'Community question answered' },
  communityUpvote: { action: 'community_upvote', xp: 5, coins: 1, description: 'Received upvote on community post' },
  helpingUsers: { action: 'helping_users', xp: 12, coins: 3, description: 'Helped other users in community' },
  roadmap: { action: 'roadmap_complete', xp: 25, coins: 5, description: 'Learning roadmap generated' },
  companyReadiness: { action: 'company_readiness', xp: 15, coins: 3, description: 'Company readiness assessment completed' },
};

const updateChallenges = async (userId, action, xp) => {
  const challenges = await Challenge.find({ user: userId, endsAt: { $gt: new Date() }, completed: false });
  await Promise.all(challenges.map(async (challenge) => {
    const increment = challenge.key === 'daily_practice' ? 1 : challenge.key === 'weekly_coding' && action === 'coding_solved' ? 1 : challenge.key === 'monthly_growth' ? xp : 0;
    if (!increment) return;
    challenge.progress = Math.min(challenge.target, challenge.progress + increment);
    const wasCompleted = challenge.completed;
    challenge.completed = challenge.progress >= challenge.target;
    
    if (challenge.completed && !wasCompleted) {
      const user = await mongoose.model('User').findById(userId);
      if (user) {
        user.xp += challenge.rewardXp;
        user.coins += challenge.rewardCoins;
        await user.save();
        await XPActivity.create({
          user: userId,
          action: `challenge_complete_${challenge.key}`,
          xp: challenge.rewardXp,
          coins: challenge.rewardCoins,
          description: `Completed challenge: ${challenge.title}`
        });
      }
    }
    await challenge.save();
  }));
};

export const grantXp = async (user, { action, xp, coins = 0, description }) => {
  const now = new Date();
  const last = user.lastActivityAt;
  const dayGap = last ? Math.floor((new Date(now.toDateString()) - new Date(last.toDateString())) / MS_DAY) : null;
  const streak = dayGap === null ? 1 : dayGap === 0 ? user.streak : dayGap === 1 ? user.streak + 1 : 1;
  
  user.xp += xp;
  user.coins += coins;
  user.streak = streak;
  user.longestStreak = Math.max(user.longestStreak, streak);
  user.level = levelFor(user.xp);
  user.lastActivityAt = now;
  await user.save();
  
  await XPActivity.create({ user: user.id, action, xp, coins, description });
  await ensureChallenges(user.id);
  await updateChallenges(user.id, action, xp);
  return user;
};

export const ensureChallenges = async (userId) => {
  const count = await Challenge.countDocuments({ user: userId, endsAt: { $gt: new Date() } });
  if (count) return;
  await Challenge.insertMany(defaults.map((item) => ({
    user: userId,
    key: item.key,
    title: item.title,
    type: item.type,
    target: item.target,
    rewardXp: item.rewardXp,
    rewardCoins: item.rewardCoins,
    endsAt: new Date(Date.now() + item.days * MS_DAY)
  })));
};

export const unlockAchievements = async ({ user }) => {
  // Dynamically resolve status counts from corresponding collections
  const [coding, interviews, community, comments, googlePrep, amazonPrep] = await Promise.all([
    mongoose.model('CodingSubmission').countDocuments({ user: user.id, 'score.accuracy': 1 }),
    mongoose.model('Interview').countDocuments({ user: user.id, status: 'completed' }),
    mongoose.model('CommunityPost').countDocuments({ author: user.id }),
    mongoose.model('CommunityComment').countDocuments({ author: user.id }),
    mongoose.model('Interview').countDocuments({ user: user.id, targetCompany: /google/i, status: 'completed' }),
    mongoose.model('Interview').countDocuments({ user: user.id, targetCompany: /amazon/i, status: 'completed' }),
  ]);

  const context = {
    xp: user.xp,
    streak: user.streak,
    resumeScore: user.resumeScore || 0,
    coding,
    interviews,
    community,
    comments,
    googlePrep,
    amazonPrep
  };

  const unlocked = [];
  for (const item of achievementDefs) {
    if (item.check(context)) {
      const exists = await Achievement.exists({ user: user.id, key: item.key });
      if (!exists) {
        await Achievement.create({ user: user.id, key: item.key, title: item.title, tier: item.tier });
        unlocked.push(item);
      }
    }
  }
  return unlocked;
};

export const progress = (user) => ({
  level: user.level,
  currentXp: user.xp,
  levelStart: xpForLevel(user.level - 1),
  nextLevelXp: xpForLevel(user.level),
  progress: Math.min(100, Math.round(((user.xp - xpForLevel(user.level - 1)) / (xpForLevel(user.level) - xpForLevel(user.level - 1))) * 100))
});
