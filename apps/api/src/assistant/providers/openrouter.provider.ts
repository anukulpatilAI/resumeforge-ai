import { ConfigService } from '@nestjs/config';
import { AiProvider } from '../assistant.interface';

const TIMEOUT_MS = 30_000;

export class OpenRouterProvider implements AiProvider {
  name = 'openrouter';
  private apiKey: string;
  private model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('OPENROUTER_API_KEY') || '';
    this.model = config.get<string>('OPENROUTER_MODEL') || 'mistralai/mistral-7b-instruct';
  }

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) throw new Error('OPENROUTER_API_KEY not configured');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1024,
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`OpenRouter error: ${response.statusText}`);
      const data = await response.json() as { choices: Array<{ message: { content: string } }> };
      return data.choices?.[0]?.message?.content || '';
    } finally {
      clearTimeout(timer);
    }
  }
}
