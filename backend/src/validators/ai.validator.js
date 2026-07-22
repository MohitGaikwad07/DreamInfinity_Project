import { body } from 'express-validator';
import { validateRequest } from './auth.validator.js';

export const aiRequestValidator = [
  body('prompt').isString().trim().isLength({ min: 1, max: 12000 }).withMessage('Prompt must be between 1 and 12,000 characters.'),
  body('history').optional().isArray({ max: 20 }).withMessage('History may contain at most 20 messages.'),
  body('history.*.role').optional().isIn(['user', 'assistant']).withMessage('History role is invalid.'),
  body('history.*.content').optional().isString().isLength({ max: 12000 }).withMessage('History content is invalid.'),
  body('context').optional().isObject().withMessage('Context must be an object.'),
  validateRequest,
];
