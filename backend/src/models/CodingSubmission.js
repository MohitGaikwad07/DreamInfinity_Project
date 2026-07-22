import mongoose from 'mongoose';

const codingSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questionId: { type: String, required: true }, questionTitle: String, mode: { type: String, enum: ['practice', 'interview', 'contest', 'company_assessment'], default: 'practice' },
  language: { type: String, required: true }, code: { type: String, required: true }, customInput: String,
  result: { status: String, stdout: String, stderr: String, compileOutput: String, executionTime: Number, memory: Number, passedTests: Number, totalTests: Number },
  score: { accuracy: Number, executionSpeed: Number, memoryEfficiency: Number, optimization: Number, overall: Number },
  aiFeedback: { correctness: String, timeComplexity: String, spaceComplexity: String, style: String, bestPractices: [String], optimizationSuggestions: [String], edgeCases: [String], alternativeApproaches: [String] },
}, { timestamps: true, versionKey: false });
codingSubmissionSchema.index({ user: 1, createdAt: -1 });
export const CodingSubmission = mongoose.model('CodingSubmission', codingSubmissionSchema);
