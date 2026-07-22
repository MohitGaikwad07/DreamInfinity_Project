import { getAIService } from '../services/ai/index.js';

const mentorInstruction = `You are Dream & Infinity, an encouraging and practical career mentor for students and professionals. Help with career planning, placements, interview preparation, technical concepts, coding, resumes, learning roadmaps, and project advice. Use clear Markdown with headings, bullet points, and fenced code blocks when helpful. Be honest about uncertainty. Do not invent user achievements or claim real-time company information.`;

const generate = async (req, res, next, { instruction = mentorInstruction, format = 'markdown' } = {}) => {
  try {
    const reply = await getAIService().generate({
      systemInstruction: instruction,
      prompt: req.body.prompt,
      history: req.body.history || [],
      context: req.body.context || {},
      responseFormat: format,
    });
    return res.status(200).json({ success: true, message: { role: 'assistant', content: reply }, streaming: false });
  } catch (error) { return next(error); }
};

export const chat = (req, res, next) => generate(req, res, next);
export const summarize = (req, res, next) => generate(req, res, next, { instruction: `${mentorInstruction}\nSummarize the provided material accurately. Preserve action items and key decisions.`, format: 'markdown' });
export const explain = (req, res, next) => generate(req, res, next, { instruction: `${mentorInstruction}\nExplain the requested concept progressively: intuition, core details, practical example, and interview takeaway.`, format: 'markdown' });
export const roadmap = (req, res, next) => generate(req, res, next, { instruction: `${mentorInstruction}\nCreate an achievable learning roadmap with milestones, resources to seek, practice, and measurable checkpoints.`, format: 'markdown' });
export const interviewHint = (req, res, next) => generate(req, res, next, { instruction: `${mentorInstruction}\nGive a concise interview hint. Guide the learner without fully solving the answer unless explicitly asked.`, format: 'markdown' });
