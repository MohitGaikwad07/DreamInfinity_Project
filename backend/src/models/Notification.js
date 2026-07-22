import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error', 'xp', 'interview', 'coding'], 
    default: 'info' 
  },
  isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true, versionKey: false });

notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
