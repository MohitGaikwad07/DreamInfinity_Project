import { Router } from 'express';
import { analyzeSkillGap, generateRoadmap, getHistory, deleteAssessment } from '../controllers/skillGapController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { body } from 'express-validator';
import { validateRequest } from '../validators/auth.validator.js';

export const skillGapRouter = Router();
const assessmentValidator = [body('targetRole').isString().trim().notEmpty(), body('targetCompany').isString().trim().notEmpty(), body('experienceLevel').isString().trim().notEmpty(), validateRequest];
skillGapRouter.use(requireAuth, aiRateLimiter);
skillGapRouter.post('/analyze', assessmentValidator, analyzeSkillGap);
skillGapRouter.get('/history', getHistory);
skillGapRouter.post('/roadmap', body('assessmentId').isMongoId().withMessage('Assessment ID is invalid.'), validateRequest, generateRoadmap);
skillGapRouter.delete('/:id', deleteAssessment);
