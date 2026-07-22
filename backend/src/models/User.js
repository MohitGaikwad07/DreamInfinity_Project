import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const interviewStatsSchema = new mongoose.Schema(
  {
    completed: { type: Number, default: 0, min: 0 },
    averageScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false },
);

const codingStatsSchema = new mongoose.Schema(
  {
    problemsSolved: { type: Number, default: 0, min: 0 },
    submissions: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters.'],
      maxlength: [80, 'Name cannot exceed 80 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email cannot exceed 254 characters.'],
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      select: false,
    },
    avatar: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    streak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    coins: { type: Number, default: 0, min: 0 },
    lastActivityAt: { type: Date, default: null },
    interviewStats: { type: interviewStatsSchema, default: () => ({}) },
    codingStats: { type: codingStatsSchema, default: () => ({}) },
    resumeScore: { type: Number, default: 0, min: 0, max: 100 },
    college: { type: String, default: null, trim: true },
    company: { type: String, default: null, trim: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    unlockedTitles: { type: [String], default: [] },
    selectedTitle: { type: String, default: null },
    unlockedFrames: { type: [String], default: [] },
    selectedFrame: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true, versionKey: false },
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    delete returnedObject.password;
    return returnedObject;
  },
});

export const User = mongoose.model('User', userSchema);
