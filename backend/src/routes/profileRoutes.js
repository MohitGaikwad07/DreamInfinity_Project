import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getProfile,
  updateProfile,
  addProject,
  updateProject,
  deleteProject,
  addCertificate,
  deleteCertificate,
  generateAiSummary,
  generateAiReview,
  getPublicProfile
} from '../controllers/profileController.js';

export const profileRouter = Router();

// Public route to view a user's shared profile
profileRouter.get('/public/:username', getPublicProfile);

// Protected routes (requires user authentication)
profileRouter.get('/', requireAuth, getProfile);
profileRouter.put('/', requireAuth, updateProfile);

// Project management endpoints
profileRouter.post('/project', requireAuth, addProject);
profileRouter.put('/project/:id', requireAuth, updateProject);
profileRouter.delete('/project/:id', requireAuth, deleteProject);

// Certificate management endpoints
profileRouter.post('/certificate', requireAuth, addCertificate);
profileRouter.delete('/certificate/:id', requireAuth, deleteCertificate);

// AI profile enhancement triggers
profileRouter.post('/ai-summary', requireAuth, generateAiSummary);
profileRouter.post('/ai-review', requireAuth, generateAiReview);
