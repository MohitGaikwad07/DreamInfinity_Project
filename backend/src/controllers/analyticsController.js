import {
  resolveDateFilter,
  getOverviewAnalytics,
  getInterviewAnalytics,
  getCodingAnalytics,
  getResumeAnalytics,
  getSkillAnalytics,
  getCompanyReadinessAnalytics,
  getLearningAnalytics,
  getCommunityAnalytics,
  getTimeline,
  getAIInsights,
  getAIWeeklyReport
} from '../services/analyticsService.js';
import { SkillGap } from '../models/SkillGap.js';
import { grantXp } from '../services/gamificationService.js';

export const overview = async (req, res, next) => {
  try {
    const filter = resolveDateFilter(req.query.range, req.query.startDate, req.query.endDate);
    const result = await getOverviewAnalytics(req.user.id, filter);
    const timeline = await getTimeline(req.user.id);
    res.json({ success: true, ...result, timeline });
  } catch (error) {
    next(error);
  }
};

export const interviews = async (req, res, next) => {
  try {
    const filter = resolveDateFilter(req.query.range, req.query.startDate, req.query.endDate);
    const result = await getInterviewAnalytics(req.user.id, filter);
    res.json({ success: true, interviews: result });
  } catch (error) {
    next(error);
  }
};

export const coding = async (req, res, next) => {
  try {
    const filter = resolveDateFilter(req.query.range, req.query.startDate, req.query.endDate);
    const result = await getCodingAnalytics(req.user.id, filter);
    res.json({ success: true, coding: result });
  } catch (error) {
    next(error);
  }
};

export const resume = async (req, res, next) => {
  try {
    const result = await getResumeAnalytics(req.user.id);
    res.json({ success: true, resume: result });
  } catch (error) {
    next(error);
  }
};

export const skills = async (req, res, next) => {
  try {
    const result = await getSkillAnalytics(req.user.id);
    res.json({ success: true, skills: result });
  } catch (error) {
    next(error);
  }
};

export const companyReadiness = async (req, res, next) => {
  try {
    const result = await getCompanyReadinessAnalytics(req.user.id);
    res.json({ success: true, readiness: result });
  } catch (error) {
    next(error);
  }
};

export const learning = async (req, res, next) => {
  try {
    const result = await getLearningAnalytics(req.user.id);
    res.json({ success: true, learning: result });
  } catch (error) {
    next(error);
  }
};

export const completeRoadmapWeek = async (req, res, next) => {
  try {
    const { week } = req.body;
    const assessment = await SkillGap.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!assessment) return res.status(404).json({ success: false, message: 'No learning roadmap found.' });

    if (!assessment.completedWeeks.includes(week)) {
      assessment.completedWeeks.push(week);
      await assessment.save();

      // Reward XP for completing learning nodes
      await grantXp(req.user, {
        action: 'learning_roadmap_week_complete',
        xp: 20,
        coins: 4,
        description: `Completed roadmap milestones: ${week}`
      });
    }

    res.json({
      success: true,
      completedWeeks: assessment.completedWeeks,
      roadmapCompletion: Math.round((assessment.completedWeeks.length / (assessment.roadmap?.length || 1)) * 100)
    });
  } catch (error) {
    next(error);
  }
};

export const community = async (req, res, next) => {
  try {
    const result = await getCommunityAnalytics(req.user.id);
    res.json({ success: true, community: result });
  } catch (error) {
    next(error);
  }
};

export const weeklyReport = async (req, res, next) => {
  try {
    const result = await getAIWeeklyReport(req.user.id);
    res.json({ success: true, report: result });
  } catch (error) {
    next(error);
  }
};

export const aiInsights = async (req, res, next) => {
  try {
    const result = await getAIInsights(req.user.id);
    res.json({ success: true, insights: result });
  } catch (error) {
    next(error);
  }
};
