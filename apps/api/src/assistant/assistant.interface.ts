export interface AiProvider {
  name: string;
  generate(prompt: string): Promise<string>;
}
