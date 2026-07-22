import { AIService } from './AIService.js';
import { GeminiProvider } from './providers/GeminiProvider.js';
import { OpenAICompatibleProvider } from './providers/OpenAICompatibleProvider.js';

let aiService;

export const getAIService = () => {
  if (!aiService) {
    if (process.env.GROQ_API_KEY) {
      aiService = new AIService(
        new OpenAICompatibleProvider({
          apiKey: process.env.GROQ_API_KEY,
          baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        })
      );
    } else if (process.env.GROK_API_KEY) {
      aiService = new AIService(
        new OpenAICompatibleProvider({
          apiKey: process.env.GROK_API_KEY,
          baseUrl: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
          model: process.env.GROK_MODEL || 'grok-beta',
        })
      );
    } else if (process.env.OPENAI_API_KEY) {
      aiService = new AIService(
        new OpenAICompatibleProvider({
          apiKey: process.env.OPENAI_API_KEY,
          baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        })
      );
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      aiService = new AIService(new GeminiProvider({ apiKey, model }));
    }
  }
  return aiService;
};
