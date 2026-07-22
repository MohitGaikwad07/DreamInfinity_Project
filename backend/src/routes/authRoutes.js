import { Router } from 'express';
import {
  changePassword,
  getCurrentUser,
  login,
  logout,
  register,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  changePasswordValidator,
  loginValidator,
  registerValidator,
  updateProfileValidator,
} from '../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/register', registerValidator, register);
authRouter.post('/login', loginValidator, login);
authRouter.post('/logout', requireAuth, logout);
authRouter.get('/me', requireAuth, getCurrentUser);
authRouter.patch('/profile', requireAuth, updateProfileValidator, updateProfile);
authRouter.patch('/change-password', requireAuth, changePasswordValidator, changePassword);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/verify-email', requireAuth, verifyEmail);
authRouter.post('/send-verification', requireAuth, sendVerificationEmail);
