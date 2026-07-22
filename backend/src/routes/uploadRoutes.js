import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/uploadMiddleware.js';
import { uploadFile, deleteFile } from '../controllers/uploadController.js';

export const uploadRouter = Router();

// Secure file uploads
uploadRouter.use(requireAuth);

uploadRouter.post('/', uploadMedia, uploadFile);
uploadRouter.post('/delete', deleteFile);
