import { ConfigService } from '@nestjs/config';
import { AiProvider } from './assistant.interface';
import { OllamaProvider } from './providers/ollama.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { FallbackProvider } from './providers/fallback.provider';

function createSingleProvider(name: string, config: ConfigService): AiProvider | null {
  switch (name) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openrouter':
      return new OpenRouterProvider(config);
    case 'ollama':
      return new OllamaProvider(config);
    default:
      return null;
  }
}

export function createAiProvider(config: ConfigService): AiProvider {
  const primary = config.get<string>('AI_PROVIDER') || 'ollama';
  const fallback = config.get<string>('AI_PROVIDER_FALLBACK') || '';

  const seen = new Set<string>();
  const chain: AiProvider[] = [];

  const add = (name: string) => {
    if (!name || seen.has(name)) return;
    seen.add(name);
    const provider = createSingleProvider(name, config);
    if (provider) chain.push(provider);
  };

  add(primary);
  add(fallback);
  add('ollama');

  if (chain.length === 1) return chain[0];
  return new FallbackProvider(chain);
}
