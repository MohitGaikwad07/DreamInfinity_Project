import { GoogleGenAI } from '@google/genai';
import { AppError } from '../../../utils/AppError.js';

const stringifyContext = (context) => Object.entries(context || {})
  .filter(([, value]) => value !== undefined && value !== null)
  .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
  .join('\n');

export class GeminiProvider {
  constructor({ apiKey, model = 'gemini-1.5-flash' }) {
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async generate({ systemInstruction, prompt, history, context, responseFormat }) {
    const contextBlock = stringifyContext(context);
    const contents = [
      ...history.map(({ role, content }) => ({ role: role === 'assistant' ? 'model' : 'user', parts: [{ text: content }] })),
      { role: 'user', parts: [{ text: `${contextBlock ? `Relevant user context:\n${contextBlock}\n\n` : ''}${prompt}` }] },
    ];
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents,
        config: { systemInstruction, responseMimeType: responseFormat === 'json' ? 'application/json' : 'text/plain' },
      });
      const text = response.text?.trim();
      if (!text) throw new Error('The AI provider returned an empty response.');
      return text;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Gemini generation failed:', error.message);
      throw new AppError('The AI assistant is temporarily unavailable. Please try again shortly.', 503);
    }
  }
}
