import { body, validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

const passwordRule = body('password')
  .isString()
  .withMessage('Password must be a string.')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long.')
  .matches(/[A-Z]/)
  .withMessage('Password must contain an uppercase letter.')
  .matches(/[a-z]/)
  .withMessage('Password must contain a lowercase letter.')
  .matches(/\d/)
  .withMessage('Password must contain a number.')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must contain a special character.');

export const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed.', 422, errors.array()));
  }
  return next();
};

export const registerValidator = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  passwordRule,
  validateRequest,
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required.'),
  validateRequest,
];

export const updateProfileValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('avatar.url').optional({ nullable: true }).isURL().withMessage('Avatar URL must be valid.'),
  body('avatar.publicId').optional({ nullable: true }).isString().trim().isLength({ max: 255 }).withMessage('Avatar public ID is invalid.'),
  body().custom((value) => {
    if (!Object.prototype.hasOwnProperty.call(value, 'name') && !Object.prototype.hasOwnProperty.call(value, 'avatar')) {
      throw new Error('Provide a name or avatar to update.');
    }
    return true;
  }),
  validateRequest,
];

export const changePasswordValidator = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required.'),
  passwordRule,
  validateRequest,
];
