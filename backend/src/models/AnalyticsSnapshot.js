import mongoose from 'mongoose';

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    careerScore: { type: Number, default: 0 },
    interviewScore: { type: Number, default: 0 },
    codingScore: { type: Number, default: 0 },
    resumeScore: { type: Number, default: 0 },
    skillScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    readinessScore: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    rank: { type: Number, default: 0 }
  },
  { timestamps: true, versionKey: false }
);

analyticsSnapshotSchema.index({ user: 1, date: -1 });

export const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);
