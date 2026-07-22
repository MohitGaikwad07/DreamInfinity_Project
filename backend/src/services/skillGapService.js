import { Resume } from '../models/Resume.js';
import { AppError } from '../utils/AppError.js';
import { getAIService } from './ai/index.js';

export const companies = ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Netflix', 'Meta', 'Oracle', 'TCS', 'Infosys', 'Wipro', 'Capgemini'];
export const roles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Java Developer', 'Python Developer', 'AI Engineer', 'Data Analyst', 'DevOps Engineer'];
export const experienceLevels = ['Fresher', '1 Year', '2 Years', '3+ Years'];

const systemInstruction = `You are Dream Infinity's interview readiness engine. Assess a candidate's interview preparedness for the selected role and company based only on supplied context. Return ONLY valid JSON matching this schema: {"currentSkills":[string],"strongAreas":[string],"improvementAreas":[string],"missingSkills":[string],"recommendedSkills":[string],"futureSkills":[string],"overallReadiness":number,"readinessBreakdown":{"resumeQuality":number,"technicalSkills":number,"projects":number,"coding":number,"communication":number,"interviewPerformance":number,"learningProgress":number},"companyScores":[{"company":string,"score":number}],"roadmap":[{"week":string,"focus":string,"outcomes":[string],"priority":"High"|"Medium"|"Low"}],"recommendations":[string]}. Every score is an integer 0-100. Include company scores for Google, Microsoft, Amazon, Adobe, Oracle, TCS, Infosys, Wipro, and Capgemini. Create a 5-week roadmap. Be practical and do not invent achievements.`;

const parse = (text) => { try { return JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim()); } catch { throw new AppError('The readiness engine returned an invalid analysis. Please try again.', 502); } };
const bounded = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

export const buildAssessmentContext = async (user) => {
  const resume = await Resume.findOne({ user: user.id }).sort({ createdAt: -1 }).select('+extractedText');
  return {
    profile: { name: user.name, level: user.level, xp: user.xp, streak: user.streak, interviewStats: user.interviewStats, codingStats: user.codingStats, resumeScore: user.resumeScore },
    resume: resume ? { atsScore: resume.atsScore, skills: resume.skills, missingSkills: resume.missingSkills, targetRole: resume.targetRole, extractedText: resume.extractedText.slice(0, 15000) } : 'No resume uploaded',
  };
};

export const generateAssessment = async ({ user, targetRole, targetCompany, experienceLevel }) => {
  if (!roles.includes(targetRole) || !companies.includes(targetCompany) || !experienceLevels.includes(experienceLevel)) throw new AppError('Select supported role, company, and experience level values.', 422);
  const context = await buildAssessmentContext(user);
  const response = await getAIService().generate({ systemInstruction, prompt: `Assess this candidate for ${targetRole} at ${targetCompany}. Experience level: ${experienceLevel}.`, context, responseFormat: 'json' });
  const analysis = parse(response);
  analysis.overallReadiness = bounded(analysis.overallReadiness);
  Object.keys(analysis.readinessBreakdown || {}).forEach((key) => { analysis.readinessBreakdown[key] = bounded(analysis.readinessBreakdown[key]); });
  analysis.companyScores = (analysis.companyScores || []).map((item) => ({ company: item.company, score: bounded(item.score) }));
  return analysis;
};
