import { Resume } from '../models/Resume.js';
import { AppError } from '../utils/AppError.js';
import { analyzeResumeText, extractResumeText, targetRoles } from '../services/resumeService.js';
import { deleteStoredFile, uploadResumeFile } from '../services/storage/cloudinaryStorageService.js';
import { grantXp, rewards } from '../services/gamificationService.js';

export const uploadResume = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    if (!targetRoles.includes(targetRole)) throw new AppError('Choose a supported target role.', 422);
    const extractedText = await extractResumeText(req.file);
    const storedFile = await uploadResumeFile(req.file);
    const resume = await Resume.create({ user: req.user.id, fileUrl: storedFile.secure_url, cloudinaryPublicId: storedFile.public_id, originalFilename: req.file.originalname, mimeType: req.file.mimetype, extractedText, targetRole });
    const analysis = await analyzeResumeText({ text: extractedText, targetRole, context: { userProfile: { level: req.user.level, xp: req.user.xp } } });
    Object.assign(resume, analysis, { analysisStatus: 'complete' });
    await resume.save();
    req.user.resumeScore = analysis.atsScore;
    await grantXp(req.user, rewards.resumeUpload);
    return res.status(201).json({ success: true, resume });
  } catch (error) { return next(error); }
};

export const getResumes = async (req, res, next) => { try { const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 }); return res.status(200).json({ success: true, resumes }); } catch (error) { return next(error); } };

export const deleteResume = async (req, res, next) => { try { const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.id }); if (!resume) throw new AppError('Resume not found.', 404); await deleteStoredFile(resume.cloudinaryPublicId); return res.status(204).send(); } catch (error) { return next(error); } };

export const analyzeResume = async (req, res, next) => { try { const resume = await Resume.findOne({ _id: req.body.resumeId, user: req.user.id }).select('+extractedText'); if (!resume) throw new AppError('Resume not found.', 404); const previousScore = resume.atsScore || 0; if (req.body.targetRole) resume.targetRole = req.body.targetRole; const analysis = await analyzeResumeText({ text: resume.extractedText, targetRole: resume.targetRole, context: req.body.context || {} }); Object.assign(resume, analysis, { analysisStatus: 'complete' }); await resume.save(); req.user.resumeScore = analysis.atsScore; await grantXp(req.user, analysis.atsScore > previousScore ? rewards.resumeImprovement : rewards.resumeUpload); return res.status(200).json({ success: true, resume }); } catch (error) { return next(error); } };
