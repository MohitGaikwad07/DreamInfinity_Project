import { Resume } from '../models/Resume.js';
import { Interview } from '../models/Interview.js';
import { SkillGap } from '../models/SkillGap.js';
import { AppError } from '../utils/AppError.js';
import { getAIService } from './ai/index.js';

export const interviewTypes = ['Technical Interview', 'HR Interview', 'Behavioral Interview', 'Coding Interview', 'System Design Interview', 'Database Interview', 'Frontend Interview', 'Backend Interview', 'AI/ML Interview', 'Data Analyst Interview'];
export const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

const questionInstruction = `You are a realistic, professional interviewer. Ask exactly one concise, conversational interview question. Adapt difficulty based on the candidate's previous answers and evaluations. You may ask a natural follow-up only when it tests a relevant gap. Return ONLY JSON: {"question":string,"focus":string}. Do not provide an answer or assessment.`;
const evaluationInstruction = `You are an exacting interview evaluator. Evaluate the candidate answer to the stated interview question. Return ONLY JSON: {"technicalAccuracy":number,"communication":number,"grammar":number,"confidence":number,"vocabulary":number,"problemSolving":number,"depthOfKnowledge":number,"professionalism":number,"feedback":string,"strengths":[string],"weaknesses":[string],"missedConcepts":[string]}. Scores are integers 0-100. Be constructive and evidence-based.`;
const feedbackInstruction = `You are a senior interview coach. Create final feedback from this completed interview. Return ONLY JSON: {"scores":{"overall":number,"technical":number,"communication":number,"confidence":number,"grammar":number,"behavior":number,"problemSolving":number},"feedback":{"strengths":[string],"weaknesses":[string],"missedConcepts":[string],"suggestedImprovements":[string],"suggestedResources":[string],"learningRoadmap":[string],"practiceQuestions":[string],"nextDifficulty":string}}. Every score must be 0-100.`;
const json = (text) => { try { return JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim()); } catch { throw new AppError('The interview AI returned an invalid result. Please retry.', 502); } };
const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

const candidateContext = async (user) => {
  const [resume, skillGap, recentInterviews] = await Promise.all([
    Resume.findOne({ user: user.id }).sort({ createdAt: -1 }).select('+extractedText'),
    SkillGap.findOne({ user: user.id }).sort({ createdAt: -1 }).select('targetRole targetCompany overallReadiness strongAreas improvementAreas missingSkills recommendations'),
    Interview.find({ user: user.id, status: 'completed' }).sort({ completedAt: -1 }).limit(3).select('targetRole targetCompany interviewType scores feedback completedAt'),
  ]);
  return {
    profile: { level: user.level, xp: user.xp, interviewStats: user.interviewStats, codingStats: user.codingStats },
    resume: resume ? { role: resume.targetRole, score: resume.atsScore, skills: resume.skills, text: resume.extractedText?.slice(0, 8000) || '' } : 'No resume available',
    skillGap: skillGap ? { role: skillGap.targetRole, company: skillGap.targetCompany, readiness: skillGap.overallReadiness, strengths: skillGap.strongAreas, improvementAreas: skillGap.improvementAreas, missingSkills: skillGap.missingSkills, recommendations: skillGap.recommendations } : 'No skill-gap assessment available',
    recentInterviewHistory: recentInterviews.map((item) => ({ role: item.targetRole, company: item.targetCompany, type: item.interviewType, scores: item.scores, weaknesses: item.feedback?.weaknesses || [], missedConcepts: item.feedback?.missedConcepts || [] })),
  };
};
const generate = async (instruction, prompt, context) => json(await getAIService().generate({ systemInstruction: instruction, prompt, context, responseFormat: 'json' }));

export const generateQuestion = async ({ interview, user }) => generate(questionInstruction, `Interview type: ${interview.interviewType}. Role: ${interview.targetRole}. Company: ${interview.targetCompany}. Experience: ${interview.experienceLevel}. Difficulty: ${interview.difficulty}. Language: ${interview.language}.\nPrevious turns with evaluations: ${JSON.stringify(interview.turns.slice(-4))}\nAsk the next question.`, await candidateContext(user));
export const evaluateAnswer = async ({ interview, question, answer, user }) => { const evaluation = await generate(evaluationInstruction, `Interview type: ${interview.interviewType}; role: ${interview.targetRole}; difficulty: ${interview.difficulty}.\nQuestion: ${question}\nCandidate answer: ${answer}`, await candidateContext(user)); Object.keys(evaluation).forEach((key) => { if (typeof evaluation[key] === 'number') evaluation[key] = clamp(evaluation[key]); }); return evaluation; };
export const generateFinalFeedback = async ({ interview }) => { const result = await generate(feedbackInstruction, `Interview configuration: ${interview.interviewType}, ${interview.targetRole}, ${interview.targetCompany}, ${interview.difficulty}.\nFull transcript: ${JSON.stringify(interview.turns)}`, {}); Object.keys(result.scores || {}).forEach((key) => { result.scores[key] = clamp(result.scores[key]); }); return result; };
