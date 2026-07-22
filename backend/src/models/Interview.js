import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({ technicalAccuracy: Number, communication: Number, grammar: Number, confidence: Number, vocabulary: Number, problemSolving: Number, depthOfKnowledge: Number, professionalism: Number, feedback: String, strengths: [String], weaknesses: [String], missedConcepts: [String] }, { _id: false });
const turnSchema = new mongoose.Schema({ question: String, answer: String, askedAt: Date, answeredAt: Date, evaluation: evaluationSchema }, { _id: false });
const scoresSchema = new mongoose.Schema({ overall: Number, technical: Number, communication: Number, confidence: Number, grammar: Number, behavior: Number, problemSolving: Number }, { _id: false });

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetCompany: String, targetRole: String, experienceLevel: String, difficulty: String, language: String, interviewType: String, durationMinutes: Number,
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress', index: true },
  currentQuestion: String, turns: { type: [turnSchema], default: [] }, transcript: { type: [turnSchema], default: [] },
  scores: { type: scoresSchema, default: () => ({}) }, feedback: { strengths: [String], weaknesses: [String], missedConcepts: [String], suggestedImprovements: [String], suggestedResources: [String], learningRoadmap: [String], practiceQuestions: [String], nextDifficulty: String },
  startedAt: { type: Date, default: Date.now }, completedAt: Date, actualDurationSeconds: Number,
}, { timestamps: true, versionKey: false });
interviewSchema.index({ user: 1, createdAt: -1 });
export const Interview = mongoose.model('Interview', interviewSchema);
