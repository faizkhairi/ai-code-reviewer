export type ReviewType = 'general' | 'security' | 'performance' | 'bugs';

const reviewTypeLabels: Record<ReviewType, string> = {
  general: 'General Code Review',
  security: 'Security Review',
  performance: 'Performance Review',
  bugs: 'Bug Detection',
};

export function getSystemPrompt(reviewType: ReviewType): string {
  const base = `You are an expert code reviewer. Provide a thorough, actionable review. Use markdown formatting with headers, bullet points, and code blocks. Be specific — reference line numbers and variable names. Keep the tone professional and constructive.`;

  const specifics: Record<ReviewType, string> = {
    general: `Focus on:
- Code quality and readability
- Design patterns and architecture
- Error handling and edge cases
- Naming conventions and code style
- Potential improvements and refactoring suggestions`,

    security: `Focus exclusively on security concerns:
- Injection vulnerabilities (SQL, XSS, command injection)
- Authentication and authorization flaws
- Data exposure and sensitive information handling
- Input validation and sanitization
- Cryptographic issues
- OWASP Top 10 vulnerabilities`,

    performance: `Focus exclusively on performance:
- Time and space complexity analysis
- Unnecessary computations or re-renders
- Memory leaks and resource management
- Caching opportunities
- Database query optimization
- Bundle size and lazy loading`,

    bugs: `Focus exclusively on finding bugs:
- Logic errors and off-by-one mistakes
- Null/undefined handling issues
- Race conditions and async problems
- Type mismatches and coercion issues
- Incorrect API usage
- Missing error handling for edge cases`,
  };

  return `${base}\n\n## ${reviewTypeLabels[reviewType]}\n\n${specifics[reviewType]}`;
}

export const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'java',
  'go',
  'rust',
  'c',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'sql',
  'html',
  'css',
  'bash',
  'yaml',
  'json',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
