import mongoose from 'mongoose';

const readinessBreakdownSchema = new mongoose.Schema({ resumeQuality: Number, technicalSkills: Number, projects: Number, coding: Number, communication: Number, interviewPerformance: Number, learningProgress: Number }, { _id: false });
const companyScoreSchema = new mongoose.Schema({ company: String, score: { type: Number, min: 0, max: 100 } }, { _id: false });
const roadmapSchema = new mongoose.Schema({ week: String, focus: String, outcomes: [String], priority: String }, { _id: false });

const skillGapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetRole: { type: String, required: true },
  targetCompany: { type: String, required: true },
  experienceLevel: { type: String, required: true },
  currentSkills: [String], strongAreas: [String], improvementAreas: [String], missingSkills: [String], recommendedSkills: [String], futureSkills: [String],
  overallReadiness: { type: Number, min: 0, max: 100, required: true },
  readinessBreakdown: { type: readinessBreakdownSchema, default: () => ({}) },
  companyScores: { type: [companyScoreSchema], default: [] },
  roadmap: { type: [roadmapSchema], default: [] },
  completedWeeks: { type: [String], default: [] },
  recommendations: { type: [String], default: [] },
}, { timestamps: true, versionKey: false });

skillGapSchema.index({ user: 1, createdAt: -1 });
export const SkillGap = mongoose.model('SkillGap', skillGapSchema);
