import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const requireAuth = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Authentication is required.', 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw new AppError('The account associated with this token no longer exists.', 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Your session is invalid or has expired. Please sign in again.', 401));
    }
    return next(error);
  }
};

export const requireRole = (roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication is required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. You do not have permission to perform this action.', 403));
    }
    return next();
  };
};

export const requireAdmin = requireRole(['admin']);
