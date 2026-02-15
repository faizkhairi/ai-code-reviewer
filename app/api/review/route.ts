import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { getSystemPrompt, type ReviewType } from '@/lib/prompts';
import type { Provider } from '@/lib/providers';

export async function POST(req: Request) {
  const { code, language, provider, reviewType } = (await req.json()) as {
    code: string;
    language: string;
    provider: Provider;
    reviewType: ReviewType;
  };

  if (!code || !language || !provider || !reviewType) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const model =
    provider === 'openai'
      ? openai('gpt-4o')
      : anthropic('claude-sonnet-4-5-20250929');

  const result = streamText({
    model,
    system: getSystemPrompt(reviewType),
    prompt: `Review this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``,
  });

  return result.toTextStreamResponse();
}
