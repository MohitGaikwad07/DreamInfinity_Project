import { Router } from 'express';
import {
  overview,
  interviews,
  coding,
  resume,
  skills,
  companyReadiness,
  learning,
  completeRoadmapWeek,
  community,
  weeklyReport,
  aiInsights
} from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

analyticsRouter.get('/overview', overview);
analyticsRouter.get('/interviews', interviews);
analyticsRouter.get('/coding', coding);
analyticsRouter.get('/resume', resume);
analyticsRouter.get('/skills', skills);
analyticsRouter.get('/company-readiness', companyReadiness);
analyticsRouter.get('/learning', learning);
analyticsRouter.post('/learning/complete-week', completeRoadmapWeek);
analyticsRouter.get('/community', community);
analyticsRouter.get('/weekly-report', weeklyReport);
analyticsRouter.get('/ai-insights', aiInsights);
