import { ConfigService } from '@nestjs/config';
import { AiProvider } from '../assistant.interface';

const TIMEOUT_MS = 180_000;

export class OllamaProvider implements AiProvider {
  name = 'ollama';
  private url: string;
  private model: string;

  constructor(config: ConfigService) {
    this.url = config.get<string>('OLLAMA_URL') || 'http://localhost:11434';
    this.model = config.get<string>('OLLAMA_MODEL') || 'llama3.1:8b';
  }

  async generate(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(`${this.url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: { temperature: 0.7, num_predict: 1024 },
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
      const data = await response.json() as { response: string };
      return data.response;
    } finally {
      clearTimeout(timer);
    }
  }
}
