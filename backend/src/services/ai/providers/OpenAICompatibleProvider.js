import axios from 'axios';
import { AppError } from '../../../utils/AppError.js';

export class OpenAICompatibleProvider {
  constructor({ apiKey, baseUrl, model }) {
    if (!apiKey) throw new Error('API key is not configured for OpenAI-compatible provider.');
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generate({ systemInstruction, prompt, history = [], context, responseFormat }) {
    const messages = [];
    
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }

    // Map history to standard chat roles
    history.forEach((h) => {
      messages.push({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content,
      });
    });

    // Handle user context parameters
    const contextString = context
      ? Object.entries(context)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
          .join('\n')
      : '';

    messages.push({
      role: 'user',
      content: `${contextString ? `Context:\n${contextString}\n\n` : ''}${prompt}`,
    });

    try {
      const payload = {
        model: this.model,
        messages,
        temperature: 0.3,
      };

      if (responseFormat === 'json') {
        payload.response_format = { type: 'json_object' };
      }

      const response = await axios.post(`${this.baseUrl}/chat/completions`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const text = response.data?.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error('Empty text content received from provider.');
      return text;
    } catch (error) {
      console.error('OpenAI-compatible AI generation failed:', error.response?.data || error.message);
      throw new AppError('The AI assistant is temporarily unavailable. Please try again shortly.', 503);
    }
  }
}
