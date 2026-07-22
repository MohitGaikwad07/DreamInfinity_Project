import { Router } from 'express';
import { body } from 'express-validator';
import {
  achievements,
  challenges,
  leaderboard,
  profile,
  updateXp,
  searchUsers,
  addFriend,
  removeFriend,
  redeemCosmetic,
  selectCosmetics,
  updateUserProfileFields
} from '../controllers/gamificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../validators/auth.validator.js';

export const gamificationRouter = Router();

gamificationRouter.use(requireAuth);

gamificationRouter.get('/profile', profile);
gamificationRouter.get('/leaderboard', leaderboard);
gamificationRouter.get('/achievements', achievements);
gamificationRouter.get('/challenges', challenges);

gamificationRouter.post(
  '/update-xp',
  [
    body('action').isString().trim().notEmpty(),
    body('xp').isInt({ min: 1, max: 1000 }),
    body('coins').optional().isInt({ min: 0, max: 500 }),
    validateRequest
  ],
  updateXp
);

gamificationRouter.get('/users/search', searchUsers);
gamificationRouter.post('/friends/add', addFriend);
gamificationRouter.post('/friends/remove', removeFriend);
gamificationRouter.post('/redeem-cosmetic', redeemCosmetic);
gamificationRouter.post('/select-cosmetics', selectCosmetics);
gamificationRouter.post('/update-profile-fields', updateUserProfileFields);
