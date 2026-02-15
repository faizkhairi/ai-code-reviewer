import { describe, it, expect } from 'vitest';
import { getSystemPrompt, SUPPORTED_LANGUAGES } from '@/lib/prompts';

describe('getSystemPrompt', () => {
  it('returns a general review prompt', () => {
    const prompt = getSystemPrompt('general');
    expect(prompt).toContain('expert code reviewer');
    expect(prompt).toContain('General Code Review');
    expect(prompt).toContain('Code quality');
  });

  it('returns a security-focused prompt', () => {
    const prompt = getSystemPrompt('security');
    expect(prompt).toContain('security');
    expect(prompt).toContain('Injection');
    expect(prompt).toContain('OWASP');
  });

  it('returns a performance-focused prompt', () => {
    const prompt = getSystemPrompt('performance');
    expect(prompt).toContain('performance');
    expect(prompt).toContain('complexity');
  });

  it('returns a bug detection prompt', () => {
    const prompt = getSystemPrompt('bugs');
    expect(prompt).toContain('bugs');
    expect(prompt).toContain('Logic errors');
  });
});

describe('SUPPORTED_LANGUAGES', () => {
  it('includes common languages', () => {
    expect(SUPPORTED_LANGUAGES).toContain('typescript');
    expect(SUPPORTED_LANGUAGES).toContain('javascript');
    expect(SUPPORTED_LANGUAGES).toContain('python');
    expect(SUPPORTED_LANGUAGES).toContain('go');
    expect(SUPPORTED_LANGUAGES).toContain('rust');
  });

  it('has no duplicates', () => {
    const unique = new Set(SUPPORTED_LANGUAGES);
    expect(unique.size).toBe(SUPPORTED_LANGUAGES.length);
  });
});
