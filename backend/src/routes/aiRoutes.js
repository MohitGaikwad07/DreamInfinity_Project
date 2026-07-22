import { Router } from 'express';
import { chat, explain, interviewHint, roadmap, summarize } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { aiRequestValidator } from '../validators/ai.validator.js';

export const aiRouter = Router();
aiRouter.use(requireAuth, aiRateLimiter);
aiRouter.post('/chat', aiRequestValidator, chat);
aiRouter.post('/summarize', aiRequestValidator, summarize);
aiRouter.post('/explain', aiRequestValidator, explain);
aiRouter.post('/roadmap', aiRequestValidator, roadmap);
aiRouter.post('/interview-hint', aiRequestValidator, interviewHint);
