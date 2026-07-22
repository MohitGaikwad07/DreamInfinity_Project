/** Provider-neutral facade shared by chat and future AI product modules. */
export class AIService {
  constructor(provider) {
    this.provider = provider;
  }

  generate({ systemInstruction, prompt, history = [], context = {}, responseFormat = 'markdown' }) {
    return this.provider.generate({ systemInstruction, prompt, history, context, responseFormat });
  }
}
