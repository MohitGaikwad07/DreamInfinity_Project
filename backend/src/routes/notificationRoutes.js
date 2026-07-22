import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  clearAllNotifications
} from '../controllers/notificationController.js';

export const notificationRouter = Router();

// Secure notifications routes
notificationRouter.use(requireAuth);

notificationRouter.get('/', getNotifications);
notificationRouter.post('/', createNotification);
notificationRouter.put('/:id/read', markAsRead);
notificationRouter.delete('/:id', deleteNotification);
notificationRouter.delete('/', clearAllNotifications);
