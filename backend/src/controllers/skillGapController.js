import { SkillGap } from '../models/SkillGap.js';
import { AppError } from '../utils/AppError.js';
import { generateAssessment } from '../services/skillGapService.js';
import { grantXp, rewards } from '../services/gamificationService.js';

export const analyzeSkillGap = async (req, res, next) => { try { const analysis = await generateAssessment({ user: req.user, ...req.body }); const assessment = await SkillGap.create({ user: req.user.id, targetRole: req.body.targetRole, targetCompany: req.body.targetCompany, experienceLevel: req.body.experienceLevel, ...analysis }); return res.status(201).json({ success: true, assessment }); } catch (error) { return next(error); } };
export const getHistory = async (req, res, next) => { try { const assessments = await SkillGap.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20); return res.status(200).json({ success: true, assessments }); } catch (error) { return next(error); } };
export const generateRoadmap = async (req, res, next) => { try { const assessment = await SkillGap.findOne({ _id: req.body.assessmentId, user: req.user.id }); if (!assessment) throw new AppError('Assessment not found.', 404); const analysis = await generateAssessment({ user: req.user, targetRole: assessment.targetRole, targetCompany: assessment.targetCompany, experienceLevel: assessment.experienceLevel }); assessment.roadmap = analysis.roadmap; assessment.recommendations = analysis.recommendations; await assessment.save(); await grantXp(req.user, rewards.roadmap); return res.status(200).json({ success: true, assessment }); } catch (error) { return next(error); } };

export const deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await SkillGap.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!assessment) throw new AppError('Assessment not found.', 404);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
