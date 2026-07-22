import { Notification } from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    return next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;
    const notification = await Notification.create({
      user: req.user.id,
      title,
      message,
      type: type || 'info'
    });
    return res.status(201).json({ success: true, notification });
  } catch (error) {
    return next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new AppError('Notification not found.', 404);
    return res.status(200).json({ success: true, notification });
  } catch (error) {
    return next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!notification) throw new AppError('Notification not found.', 404);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    return res.status(200).json({ success: true, message: 'All notifications cleared.' });
  } catch (error) {
    return next(error);
  }
};

// Helper utility function to programmatically trigger notifications from other controllers
export const createSystemNotification = async (userId, title, message, type = 'info') => {
  try {
    await Notification.create({ user: userId, title, message, type });
  } catch (err) {
    console.error('Failed to create system notification:', err.message);
  }
};
