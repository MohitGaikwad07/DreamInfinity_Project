import { Profile } from '../models/Profile.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { aggregateProfileActivity } from '../services/profileService.js';
import { generateAiCareerSummary, generateAiPortfolioReview } from '../services/portfolioService.js';

// Helper to generate unique username
const generateUniqueUsername = async (user) => {
  let base = user.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (!base) base = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (!base) base = 'user';
  
  let username = base;
  let collision = true;
  let counter = 1;
  while (collision) {
    const exists = await Profile.exists({ username });
    if (!exists) {
      collision = false;
    } else {
      username = `${base}${counter}`;
      counter++;
    }
  }
  return username;
};

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      const username = await generateUniqueUsername(req.user);
      profile = await Profile.create({
        user: userId,
        username,
        privacySettings: {
          publicProfile: true,
          privateProfile: false,
          recruiterView: true,
          hideEmail: false,
          hidePhone: false,
          hideResume: false
        }
      });
    }

    // Aggregate statistics from other models
    const aggregatedData = await aggregateProfileActivity(userId);
    
    // Save computed skill scores to profile database
    profile.aiSkillScores = aggregatedData.calculatedSkillScores;
    await profile.save();

    return res.status(200).json({
      success: true,
      profile,
      activity: aggregatedData
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      const username = await generateUniqueUsername(req.user);
      profile = await Profile.create({ user: userId, username });
    }

    const {
      headline,
      bio,
      phone,
      location,
      coverBanner,
      availabilityStatus,
      socialLinks,
      skills,
      experience,
      education,
      privacySettings,
      username
    } = req.body;

    // Handle username update (if provided)
    if (username && username.toLowerCase() !== profile.username) {
      const sluggedUsername = username.toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (sluggedUsername.length < 3) {
        throw new AppError('Username must be at least 3 alphanumeric characters.', 400);
      }
      const exists = await Profile.exists({ username: sluggedUsername, user: { $ne: userId } });
      if (exists) {
        throw new AppError('This username is already taken.', 409);
      }
      profile.username = sluggedUsername;
    }

    if (headline !== undefined) profile.headline = headline;
    if (bio !== undefined) profile.bio = bio;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (coverBanner !== undefined) profile.coverBanner = coverBanner;
    if (availabilityStatus !== undefined) profile.availabilityStatus = availabilityStatus;
    if (socialLinks !== undefined) profile.socialLinks = socialLinks;
    if (skills !== undefined) profile.skills = skills;
    if (experience !== undefined) profile.experience = experience;
    if (education !== undefined) profile.education = education;
    if (privacySettings !== undefined) profile.privacySettings = privacySettings;

    // Handle personal detail syncing to User table
    if (req.body.name) {
      await User.findByIdAndUpdate(userId, { name: req.body.name });
    }

    await profile.save();

    // Re-fetch with fresh aggregates
    const aggregatedData = await aggregateProfileActivity(userId);
    return res.status(200).json({
      success: true,
      profile,
      activity: aggregatedData
    });
  } catch (error) {
    return next(error);
  }
};

// CRUD for Projects
export const addProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user: userId });
    if (!profile) throw new AppError('Profile not found.', 404);

    const { title, description, techStack, githubLink, liveDemo, screenshots, videoDemo } = req.body;
    profile.projects.push({ title, description, techStack, githubLink, liveDemo, screenshots, videoDemo });
    await profile.save();

    return res.status(201).json({ success: true, projects: profile.projects });
  } catch (error) {
    return next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user: userId });
    if (!profile) throw new AppError('Profile not found.', 404);

    const project = profile.projects.id(req.params.id);
    if (!project) throw new AppError('Project not found.', 404);

    const { title, description, techStack, githubLink, liveDemo, screenshots, videoDemo } = req.body;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (techStack !== undefined) project.techStack = techStack;
    if (githubLink !== undefined) project.githubLink = githubLink;
    if (liveDemo !== undefined) project.liveDemo = liveDemo;
    if (screenshots !== undefined) project.screenshots = screenshots;
    if (videoDemo !== undefined) project.videoDemo = videoDemo;

    await profile.save();
    return res.status(200).json({ success: true, projects: profile.projects });
  } catch (error) {
    return next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user: userId });
    if (!profile) throw new AppError('Profile not found.', 404);

    profile.projects.pull(req.params.id);
    await profile.save();

    return res.status(200).json({ success: true, projects: profile.projects });
  } catch (error) {
    return next(error);
  }
};

// CRUD for Certificates
export const addCertificate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user: userId });
    if (!profile) throw new AppError('Profile not found.', 404);

    const { title, issuer, issueDate, expirationDate, credentialId, credentialUrl, type } = req.body;
    profile.certificates.push({
      title,
      issuer,
      issueDate,
      expirationDate,
      credentialId,
      credentialUrl,
      type: type || 'certificate',
      verificationStatus: 'verified' // Autoverified on upload for this prototype
    });
    
    await profile.save();
    return res.status(201).json({ success: true, certificates: profile.certificates });
  } catch (error) {
    return next(error);
  }
};

export const deleteCertificate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user: userId });
    if (!profile) throw new AppError('Profile not found.', 404);

    profile.certificates.pull(req.params.id);
    await profile.save();

    return res.status(200).json({ success: true, certificates: profile.certificates });
  } catch (error) {
    return next(error);
  }
};

// AI Generation Trigger
export const generateAiSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user: userId }).populate('user', 'name email');
    if (!profile) throw new AppError('Profile not found.', 404);

    const aggregatedData = await aggregateProfileActivity(userId);
    const summaryResult = await generateAiCareerSummary(profile, aggregatedData);

    profile.aiCareerSummary = {
      summary: summaryResult.summary || '',
      strengths: summaryResult.strengths || [],
      weaknesses: summaryResult.weaknesses || [],
      recommendedSkills: summaryResult.recommendedSkills || [],
      careerGoal: summaryResult.careerGoal || '',
      learningProgress: summaryResult.learningProgress || 50
    };

    await profile.save();
    return res.status(200).json({ success: true, aiCareerSummary: profile.aiCareerSummary });
  } catch (error) {
    return next(error);
  }
};

export const generateAiReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user: userId });
    if (!profile) throw new AppError('Profile not found.', 404);

    const aggregatedData = await aggregateProfileActivity(userId);
    const reviewResult = await generateAiPortfolioReview(profile, aggregatedData);

    profile.aiPortfolioReview = {
      score: reviewResult.score || 50,
      suggestions: reviewResult.suggestions || [],
      missingSections: reviewResult.missingSections || [],
      improvements: reviewResult.improvements || []
    };

    await profile.save();
    return res.status(200).json({ success: true, aiPortfolioReview: profile.aiPortfolioReview });
  } catch (error) {
    return next(error);
  }
};

// Public Access
export const getPublicProfile = async (req, res, next) => {
  try {
    const username = req.params.username.toLowerCase();
    const profile = await Profile.findOne({ username }).populate('user', 'name email avatar xp level streak longestStreak coins');
    
    if (!profile) {
      throw new AppError('Profile not found.', 404);
    }

    if (profile.privacySettings?.privateProfile || !profile.privacySettings?.publicProfile) {
      throw new AppError('This profile is set to private.', 403);
    }

    const aggregatedData = await aggregateProfileActivity(profile.user.id);
    
    // Anonymize email and phone based on settings
    const cleanProfile = profile.toObject();
    if (profile.privacySettings?.hideEmail) {
      if (cleanProfile.user) delete cleanProfile.user.email;
      cleanProfile.email = undefined;
    }
    if (profile.privacySettings?.hidePhone) {
      cleanProfile.phone = undefined;
    }
    if (profile.privacySettings?.hideResume) {
      aggregatedData.latestResume = null;
      aggregatedData.resumeHistory = [];
    }

    return res.status(200).json({
      success: true,
      profile: cleanProfile,
      activity: aggregatedData
    });
  } catch (error) {
    return next(error);
  }
};
