import { User } from '../models/User.js';
import { CodingSubmission } from '../models/CodingSubmission.js';
import { Interview } from '../models/Interview.js';
import { CommunityPost } from '../models/Community.js';
import { Achievement, Challenge, XPActivity } from '../models/Gamification.js';
import { ensureChallenges, grantXp, progress, unlockAchievements, shopItems } from '../services/gamificationService.js';

const careerScore = ({ resume, coding, interviews, community, xp }) => ({
  overall: Math.min(100, Math.round(resume * 0.25 + Math.min(100, coding * 12) * 0.25 + Math.min(100, interviews * 18 + 35) * 0.2 + Math.min(100, community * 15 + 30) * 0.1 + Math.min(100, xp / 20) * 0.2)),
  resume,
  coding: Math.min(100, coding * 12),
  communication: Math.min(100, interviews * 18 + 35),
  projects: Math.min(100, xp / 18),
  community: Math.min(100, community * 15 + 30),
  learning: Math.min(100, xp / 15)
});

export const profile = async (req, res, next) => {
  try {
    const [coding, interviews, community] = await Promise.all([
      CodingSubmission.countDocuments({ user: req.user.id }),
      Interview.countDocuments({ user: req.user.id }),
      CommunityPost.countDocuments({ author: req.user.id })
    ]);

    await ensureChallenges(req.user.id);
    const unlocked = await unlockAchievements({ user: req.user });

    // Find populated user with friends list populated
    const populatedUser = await User.findById(req.user.id)
      .populate('friends', 'name avatar xp level selectedTitle selectedFrame');

    const [achievements, activities, challenges, rank] = await Promise.all([
      Achievement.find({ user: req.user.id }).sort({ earnedAt: -1 }),
      XPActivity.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10),
      Challenge.find({ user: req.user.id }).sort({ endsAt: 1 }),
      User.countDocuments({ xp: { $gt: req.user.xp } })
    ]);

    // Active streak dates in past 30 days
    const since = new Date(Date.now() - 30 * 86400000);
    const activitiesForCalendar = await XPActivity.find({
      user: req.user.id,
      createdAt: { $gte: since }
    }).select('createdAt');
    const streakCalendar = [...new Set(activitiesForCalendar.map(a => a.createdAt.toISOString().slice(0, 10)))];

    res.json({
      success: true,
      profile: progress(populatedUser),
      streak: {
        current: populatedUser.streak,
        longest: populatedUser.longestStreak,
        lastActivityAt: populatedUser.lastActivityAt
      },
      coins: populatedUser.coins,
      college: populatedUser.college,
      company: populatedUser.company,
      friends: populatedUser.friends || [],
      unlockedTitles: populatedUser.unlockedTitles || [],
      selectedTitle: populatedUser.selectedTitle,
      unlockedFrames: populatedUser.unlockedFrames || [],
      selectedFrame: populatedUser.selectedFrame,
      achievements,
      activities,
      challenges,
      newAchievements: unlocked,
      rank: rank + 1,
      streakCalendar,
      shopItems,
      careerScore: careerScore({
        resume: populatedUser.resumeScore || 40,
        coding,
        interviews,
        community,
        xp: populatedUser.xp
      })
    });
  } catch (error) {
    next(error);
  }
};

export const leaderboard = async (req, res, next) => {
  try {
    const period = req.query.period || 'all'; // all, weekly, monthly
    const scope = req.query.scope || 'global'; // global, college, company, friends

    // 1. Resolve users filtered by the requested scope
    let userIds = null;
    if (scope === 'college') {
      if (req.user.college) {
        const users = await User.find({ college: req.user.college }).select('_id');
        userIds = users.map(u => u._id);
      } else {
        userIds = [req.user._id];
      }
    } else if (scope === 'company') {
      if (req.user.company) {
        const users = await User.find({ company: req.user.company }).select('_id');
        userIds = users.map(u => u._id);
      } else {
        userIds = [req.user._id];
      }
    } else if (scope === 'friends') {
      userIds = [req.user._id, ...(req.user.friends || [])];
    }

    let rows;
    // 2. Perform ranking calculation
    if (period === 'weekly' || period === 'monthly') {
      const since = new Date(Date.now() - (period === 'weekly' ? 7 : 30) * 86400000);
      const matchStage = { createdAt: { $gte: since } };
      if (userIds) {
        matchStage.user = { $in: userIds };
      }

      rows = await XPActivity.aggregate([
        { $match: matchStage },
        { $group: { _id: '$user', xp: { $sum: '$xp' } } },
        { $sort: { xp: -1 } },
        { $limit: 30 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            userId: '$user._id',
            name: '$user.name',
            xp: 1,
            level: '$user.level',
            streak: '$user.streak',
            avatar: '$user.avatar',
            selectedTitle: '$user.selectedTitle',
            selectedFrame: '$user.selectedFrame'
          }
        }
      ]);
    } else {
      // All-time leaderboard
      const filter = {};
      if (userIds) {
        filter._id = { $in: userIds };
      }

      rows = await User.find(filter)
        .sort({ xp: -1 })
        .limit(30)
        .select('name xp level streak avatar selectedTitle selectedFrame');
    }

    res.json({ success: true, leaderboard: rows, period, scope });
  } catch (error) {
    next(error);
  }
};

export const achievements = async (req, res, next) => {
  try {
    res.json({
      success: true,
      achievements: await Achievement.find({ user: req.user.id }).sort({ earnedAt: -1 })
    });
  } catch (error) {
    next(error);
  }
};

export const challenges = async (req, res, next) => {
  try {
    await ensureChallenges(req.user.id);
    res.json({
      success: true,
      challenges: await Challenge.find({ user: req.user.id }).sort({ endsAt: 1 })
    });
  } catch (error) {
    next(error);
  }
};

export const updateXp = async (req, res, next) => {
  try {
    const user = await grantXp(req.user, req.body);
    const unlocked = await unlockAchievements({ user });
    res.status(201).json({
      success: true,
      profile: progress(user),
      achievements: unlocked,
      streak: user.streak,
      coins: user.coins
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    if (!query) return res.json({ success: true, users: [] });
    const users = await User.find({
      name: new RegExp(query, 'i'),
      _id: { $ne: req.user.id }
    })
      .limit(10)
      .select('name avatar xp level selectedTitle selectedFrame');
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const addFriend = async (req, res, next) => {
  try {
    const friendId = req.body.friendId;
    if (!friendId) return res.status(400).json({ success: false, message: 'Friend ID is required.' });
    if (String(friendId) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot add yourself.' });
    }

    const user = await User.findById(req.user.id);
    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
      await user.save();
      // Reward user with some XP for building community connections!
      await grantXp(user, {
        action: 'add_friend',
        xp: 15,
        coins: 5,
        description: 'Connected with a peer'
      });
    }

    res.json({ success: true, friends: user.friends });
  } catch (error) {
    next(error);
  }
};

export const removeFriend = async (req, res, next) => {
  try {
    const friendId = req.body.friendId;
    if (!friendId) return res.status(400).json({ success: false, message: 'Friend ID is required.' });

    const user = await User.findById(req.user.id);
    user.friends = user.friends.filter(f => String(f) !== String(friendId));
    await user.save();

    res.json({ success: true, friends: user.friends });
  } catch (error) {
    next(error);
  }
};

export const redeemCosmetic = async (req, res, next) => {
  try {
    const { itemId, itemType } = req.body;
    const itemsList = itemType === 'title' ? shopItems.titles : shopItems.frames;
    const item = itemsList.find(i => i.id === itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cosmetic item not found.' });
    }

    const user = await User.findById(req.user.id);
    if (user.coins < item.price) {
      return res.status(400).json({ success: false, message: 'Insufficient coins.' });
    }

    const unlockedList = itemType === 'title' ? user.unlockedTitles : user.unlockedFrames;
    if (unlockedList.includes(itemId)) {
      return res.status(400).json({ success: false, message: 'Item already unlocked.' });
    }

    user.coins -= item.price;
    unlockedList.push(itemId);
    await user.save();

    res.json({
      success: true,
      coins: user.coins,
      unlockedTitles: user.unlockedTitles,
      unlockedFrames: user.unlockedFrames,
      message: `${item.name} unlocked successfully!`
    });
  } catch (error) {
    next(error);
  }
};

export const selectCosmetics = async (req, res, next) => {
  try {
    const { titleId, frameId } = req.body;
    const user = await User.findById(req.user.id);

    if (titleId !== undefined) {
      if (titleId === null || user.unlockedTitles.includes(titleId)) {
        user.selectedTitle = titleId;
      } else {
        return res.status(400).json({ success: false, message: 'Title not unlocked.' });
      }
    }

    if (frameId !== undefined) {
      if (frameId === null || user.unlockedFrames.includes(frameId)) {
        user.selectedFrame = frameId;
      } else {
        return res.status(400).json({ success: false, message: 'Frame not unlocked.' });
      }
    }

    await user.save();
    res.json({
      success: true,
      selectedTitle: user.selectedTitle,
      selectedFrame: user.selectedFrame
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfileFields = async (req, res, next) => {
  try {
    const { college, company } = req.body;
    const user = await User.findById(req.user.id);
    if (college !== undefined) user.college = college;
    if (company !== undefined) user.company = company;
    await user.save();

    res.json({
      success: true,
      college: user.college,
      company: user.company
    });
  } catch (error) {
    next(error);
  }
};
