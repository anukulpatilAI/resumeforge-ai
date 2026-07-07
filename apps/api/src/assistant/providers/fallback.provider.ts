import { Logger } from '@nestjs/common';
import { AiProvider } from '../assistant.interface';

export class FallbackProvider implements AiProvider {
  name = 'fallback';
  private readonly logger = new Logger(FallbackProvider.name);

  constructor(private providers: AiProvider[]) {}

  async generate(prompt: string): Promise<string> {
    const errors: { name: string; message: string }[] = [];
    for (const provider of this.providers) {
      try {
        const result = await provider.generate(prompt);
        this.logger.log(`Provider "${provider.name}" succeeded`);
        return result;
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`Provider "${provider.name}" failed: ${errMsg}`);
        errors.push({ name: provider.name, message: errMsg });
      }
    }
    throw new Error(
      `All providers failed: ${errors.map(e => `${e.name} (${e.message})`).join('; ')}`,
    );
  }
}
