import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { generateToken } from '../utils/generateToken.js';
import { grantXp, rewards } from '../services/gamificationService.js';
import axios from 'axios';

const sendAuthResponse = (res, statusCode, user) => {
  const token = generateToken(user.id);
  return res.status(statusCode).json({ success: true, token, user });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.exists({ email });
    if (existingUser) throw new AppError('An account with this email address already exists.', 409);

    const user = await User.create({ name, email, password });
    return sendAuthResponse(res, 201, user);
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password.', 401);
    }
    const alreadyActiveToday = user.lastActivityAt && user.lastActivityAt.toDateString() === new Date().toDateString();
    if (!alreadyActiveToday) await grantXp(user, rewards.dailyLogin);
    return sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

export const logout = (_req, res) => res.status(204).send();

export const getCurrentUser = (req, res) => res.status(200).json({ success: true, user: req.user });

export const updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, password } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect.', 400);
    }
    user.password = password;
    await user.save();
    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No account with that email address exists.', 404);
    }

    // Generate numeric 6-digit token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Recovery email sent. Input the code to reset password.',
      token // Return token for easy testing
    });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Code is invalid or has expired.', 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successful. Log in with your new credentials.' });
  } catch (error) {
    return next(error);
  }
};

export const sendVerificationEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('User not found.', 404);

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationToken = token;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Verification code generated.',
      token // Return code directly
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({
      _id: req.user.id,
      emailVerificationToken: code
    });

    if (!user) {
      throw new AppError('Verification code is invalid.', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verification successful.',
      user
    });
  } catch (error) {
    return next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      throw new AppError('Google credential token is required.', 400);
    }

    let tokenInfo;
    try {
      const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      tokenInfo = response.data;
    } catch (err) {
      throw new AppError('Invalid Google credential token.', 401);
    }

    const { sub: googleId, email, name, picture, aud } = tokenInfo;
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && aud !== clientId) {
      throw new AppError('Token was not issued for this application.', 401);
    }

    if (!email) {
      throw new AppError('Google account does not provide email access.', 400);
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture ? { url: picture } : undefined,
        isEmailVerified: true,
      });
      await grantXp(user, rewards.dailyLogin);
    }

    const alreadyActiveToday = user.lastActivityAt && user.lastActivityAt.toDateString() === new Date().toDateString();
    if (!alreadyActiveToday) {
      await grantXp(user, rewards.dailyLogin);
    }

    return sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

export const googleMockLogin = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('Mock login only available in development mode.', 403);
    }

    const { email, name, picture } = req.body;
    if (!email) {
      throw new AppError('Email is required for mock Google login.', 400);
    }

    const mockGoogleId = `mock-google-id-${email}`;
    let user = await User.findOne({ $or: [{ googleId: mockGoogleId }, { email }] });

    if (user) {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = mockGoogleId;
        needsSave = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || 'Mock Google User',
        email,
        googleId: mockGoogleId,
        avatar: picture ? { url: picture } : { url: 'https://lh3.googleusercontent.com/a/default-user' },
        isEmailVerified: true,
      });
      await grantXp(user, rewards.dailyLogin);
    }

    const alreadyActiveToday = user.lastActivityAt && user.lastActivityAt.toDateString() === new Date().toDateString();
    if (!alreadyActiveToday) {
      await grantXp(user, rewards.dailyLogin);
    }

    return sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

