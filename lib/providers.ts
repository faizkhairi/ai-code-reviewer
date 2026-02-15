export type Provider = 'openai' | 'anthropic';

export interface ProviderInfo {
  id: Provider;
  label: string;
  model: string;
  description: string;
}

export const providers: Record<Provider, ProviderInfo> = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    model: 'gpt-4o',
    description: 'GPT-4o — fast and capable',
  },
  anthropic: {
    id: 'anthropic',
    label: 'Claude',
    model: 'claude-sonnet-4-5-20250929',
    description: 'Claude Sonnet — detailed analysis',
  },
};
