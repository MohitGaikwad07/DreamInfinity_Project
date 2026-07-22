import { Router } from 'express';
import { analyzeResume, deleteResume, getResumes, uploadResume } from '../controllers/resumeController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadResume as uploadFile } from '../middleware/uploadMiddleware.js';

export const resumeRouter = Router();
resumeRouter.use(requireAuth);
resumeRouter.post('/upload', uploadFile, uploadResume);
resumeRouter.get('/', getResumes);
resumeRouter.delete('/:id', deleteResume);
resumeRouter.post('/analyze', analyzeResume);
