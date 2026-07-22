import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import { AppError } from '../utils/AppError.js';
import { getAIService } from './ai/index.js';

const roles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Java Developer', 'Python Developer', 'Data Analyst', 'AI Engineer', 'DevOps Engineer'];
export const targetRoles = roles;

export const extractResumeText = async (file) => {
  const result = file.mimetype === 'application/pdf' ? await pdf(file.buffer) : await mammoth.extractRawText({ buffer: file.buffer });
  const text = (result.text || '').replace(/\s+/g, ' ').trim();
  if (text.length < 40) throw new AppError('We could not extract enough text from this resume. Upload a text-based PDF or DOCX file.', 422);
  return text.slice(0, 50000);
};

const systemInstruction = `You are Dream Infinity's resume analysis engine. Analyze resumes for ATS readiness. Return ONLY valid JSON, no markdown, using exactly this schema: {"atsScore":number,"scoreBreakdown":{"formatting":number,"keywords":number,"skills":number,"projects":number,"experience":number,"grammar":number,"achievements":number},"skills":[{"name":string,"category":"Programming"|"Frameworks"|"Databases"|"Cloud"|"DevOps"|"Tools"|"Soft Skills"}],"missingSkills":[string],"suggestions":[string],"extracted":{"education":[string],"experience":[string],"projects":[string],"certifications":[string],"achievements":[string],"softSkills":[string]}}. Scores are 0-100. Give concise, evidence-based suggestions. Do not invent experience.`;

const parseJson = (value) => {
  try { return JSON.parse(value.replace(/^```json\s*|\s*```$/g, '').trim()); } catch { throw new AppError('The AI analysis returned an invalid format. Please try again.', 502); }
};

export const analyzeResumeText = async ({ text, targetRole, context = {} }) => {
  if (!roles.includes(targetRole)) throw new AppError('Choose a supported target role.', 422);
  const prompt = `Target role: ${targetRole}\n\nResume text:\n${text}`;
  const response = await getAIService().generate({ systemInstruction, prompt, context, responseFormat: 'json' });
  const analysis = parseJson(response);
  analysis.atsScore = Math.max(0, Math.min(100, Number(analysis.atsScore) || 0));
  return analysis;
};
