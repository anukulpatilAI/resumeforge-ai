import { ConfigService } from '@nestjs/config';
import { AiProvider } from '../assistant.interface';

const TIMEOUT_MS = 30_000;

export class GeminiProvider implements AiProvider {
  name = 'gemini';
  private apiKey: string;
  private model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('GEMINI_API_KEY') || '';
    this.model = config.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash';
  }

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) throw new Error('GEMINI_API_KEY not configured');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
          signal: controller.signal,
        },
      );
      if (!response.ok) throw new Error(`Gemini error: ${response.statusText}`);
      const data = await response.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } finally {
      clearTimeout(timer);
    }
  }
}
