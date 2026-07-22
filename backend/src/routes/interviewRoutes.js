import { Router } from 'express';
import { answerQuestion, finishInterview, getInterview, interviewDashboard, interviewHistory, nextQuestion, startInterview } from '../controllers/interviewController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { body } from 'express-validator';
import { validateRequest } from '../validators/auth.validator.js';

export const interviewRouter = Router();
const idValidator = [body('interviewId').isMongoId().withMessage('Interview ID is invalid.'), validateRequest];
interviewRouter.use(requireAuth, aiRateLimiter);
interviewRouter.post('/start', [body('targetCompany').isString().trim().notEmpty(), body('targetRole').isString().trim().notEmpty(), body('experienceLevel').isString().trim().notEmpty(), body('difficulty').isString().trim().notEmpty(), body('language').isString().trim().notEmpty(), body('interviewType').isString().trim().notEmpty(), body('durationMinutes').isInt({ min: 5, max: 120 }), validateRequest], startInterview);
interviewRouter.post('/question', idValidator, nextQuestion);
interviewRouter.post('/answer', [...idValidator, body('answer').isString().trim().isLength({ min: 1, max: 12000 }).withMessage('Answer must be between 1 and 12,000 characters.'), validateRequest], answerQuestion);
interviewRouter.post('/finish', idValidator, finishInterview);
interviewRouter.get('/history', interviewHistory);
interviewRouter.get('/dashboard', interviewDashboard);
interviewRouter.get('/:id', getInterview);
