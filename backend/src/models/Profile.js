import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, trim: true },
}, { _id: true });

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true, trim: true },
  degree: { type: String, trim: true },
  fieldOfStudy: { type: String, trim: true },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, trim: true },
}, { _id: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  techStack: { type: [String], default: [] },
  githubLink: { type: String, trim: true },
  liveDemo: { type: String, trim: true },
  screenshots: { type: [String], default: [] },
  videoDemo: { type: String, trim: true },
}, { _id: true });

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  issuer: { type: String, trim: true },
  issueDate: { type: Date },
  expirationDate: { type: Date },
  credentialId: { type: String, trim: true },
  credentialUrl: { type: String, trim: true },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
  type: { type: String, enum: ['certificate', 'course', 'achievement', 'badge'], default: 'certificate' },
}, { _id: true });

const skillItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'intermediate' },
  experienceYears: { type: Number, default: 0 },
  verifiedLevel: { type: String, enum: ['none', 'bronze', 'silver', 'gold'], default: 'none' },
}, { _id: false });

const categorizedSkillsSchema = new mongoose.Schema({
  programmingLanguages: { type: [skillItemSchema], default: [] },
  frameworks: { type: [skillItemSchema], default: [] },
  databases: { type: [skillItemSchema], default: [] },
  cloud: { type: [skillItemSchema], default: [] },
  devOps: { type: [skillItemSchema], default: [] },
  aiMl: { type: [skillItemSchema], default: [] },
  tools: { type: [skillItemSchema], default: [] },
  softSkills: { type: [skillItemSchema], default: [] },
}, { _id: false });

const aiSkillScoresSchema = new mongoose.Schema({
  overall: { type: Number, default: 0, min: 0, max: 100 },
  programming: { type: Number, default: 0, min: 0, max: 100 },
  frontend: { type: Number, default: 0, min: 0, max: 100 },
  backend: { type: Number, default: 0, min: 0, max: 100 },
  database: { type: Number, default: 0, min: 0, max: 100 },
  communication: { type: Number, default: 0, min: 0, max: 100 },
  problemSolving: { type: Number, default: 0, min: 0, max: 100 },
}, { _id: false });

const privacySettingsSchema = new mongoose.Schema({
  publicProfile: { type: Boolean, default: true },
  privateProfile: { type: Boolean, default: false },
  recruiterView: { type: Boolean, default: true },
  hideEmail: { type: Boolean, default: false },
  hidePhone: { type: Boolean, default: false },
  hideResume: { type: Boolean, default: false },
}, { _id: false });

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true, lowercase: true },
  headline: { type: String, default: '', trim: true },
  bio: { type: String, default: '', trim: true },
  phone: { type: String, default: '', trim: true },
  location: { type: String, default: '', trim: true },
  coverBanner: { type: String, default: '', trim: true },
  availabilityStatus: { type: String, enum: ['actively_looking', 'open', 'not_looking'], default: 'open' },
  socialLinks: {
    linkedin: { type: String, default: '', trim: true },
    github: { type: String, default: '', trim: true },
    portfolioWebsite: { type: String, default: '', trim: true },
  },
  experience: { type: [experienceSchema], default: [] },
  education: { type: [educationSchema], default: [] },
  skills: { type: categorizedSkillsSchema, default: () => ({}) },
  projects: { type: [projectSchema], default: [] },
  certificates: { type: [certificateSchema], default: [] },
  aiSkillScores: { type: aiSkillScoresSchema, default: () => ({}) },
  aiCareerSummary: {
    summary: { type: String, default: '', trim: true },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendedSkills: { type: [String], default: [] },
    careerGoal: { type: String, default: '', trim: true },
    learningProgress: { type: Number, default: 0, min: 0, max: 100 },
  },
  aiPortfolioReview: {
    score: { type: Number, default: 0, min: 0, max: 100 },
    suggestions: { type: [String], default: [] },
    missingSections: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
  },
  privacySettings: { type: privacySettingsSchema, default: () => ({}) },
}, { timestamps: true, versionKey: false });

export const Profile = mongoose.model('Profile', profileSchema);
