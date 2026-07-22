import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({ name: { type: String, required: true }, category: { type: String, default: 'Tools' } }, { _id: false });
const scoreSchema = new mongoose.Schema({ formatting: Number, keywords: Number, skills: Number, projects: Number, experience: Number, grammar: Number, achievements: Number }, { _id: false });

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  originalFilename: { type: String, required: true, trim: true },
  mimeType: { type: String, required: true },
  extractedText: { type: String, required: true, select: false },
  atsScore: { type: Number, min: 0, max: 100, default: 0 },
  scoreBreakdown: { type: scoreSchema, default: () => ({}) },
  skills: { type: [skillSchema], default: [] },
  missingSkills: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  extracted: { education: [String], experience: [String], projects: [String], certifications: [String], achievements: [String], softSkills: [String] },
  targetRole: { type: String, required: true, index: true },
  analysisStatus: { type: String, enum: ['pending', 'complete', 'failed'], default: 'pending' },
}, { timestamps: true, versionKey: false });

resumeSchema.index({ user: 1, createdAt: -1 });
export const Resume = mongoose.model('Resume', resumeSchema);
