# AI Code Reviewer

<p align="center">
  <img src="./docs/demo.gif" alt="AI Code Reviewer Demo" width="800">
</p>

> **📸 Screenshot placeholder** — See [docs/CAPTURE_INSTRUCTIONS.md](./docs/CAPTURE_INSTRUCTIONS.md) for capture instructions

Get instant AI-powered code reviews with streaming output. Choose between OpenAI GPT-4o and Claude Sonnet, select a review focus (general, security, performance, or bug detection), and receive detailed, actionable feedback.

## Features

- **Multi-provider AI** — Toggle between OpenAI GPT-4o and Claude Sonnet
- **4 Review Types** — General, Security, Performance, Bug Detection
- **Streaming Output** — Watch the review appear in real-time with markdown rendering
- **19 Languages** — TypeScript, Python, Go, Rust, Java, and more
- **Review History** — Last 50 reviews saved in localStorage
- **Syntax Highlighting** — Code blocks rendered with proper formatting

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework (App Router) |
| [Vercel AI SDK](https://sdk.vercel.ai/) | Streaming AI responses |
| [OpenAI](https://openai.com/) | GPT-4o model |
| [Anthropic](https://anthropic.com/) | Claude Sonnet model |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Vitest](https://vitest.dev/) | Testing |

## Getting Started

### Prerequisites

- Node.js 18+
- API key for at least one provider:
  - [OpenAI API key](https://platform.openai.com/api-keys)
  - [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Clone the repo
git clone https://github.com/faizkhairi/ai-code-reviewer.git
cd ai-code-reviewer

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your API keys to .env
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start reviewing code.

## Project Structure

```
ai-code-reviewer/
├── app/
│   ├── page.tsx                  # Main review page (streaming)
│   ├── history/page.tsx          # Review history browser
│   └── api/review/route.ts       # Streaming AI endpoint
├── components/
│   ├── CodeEditor.tsx            # Code input + language selector
│   ├── ProviderToggle.tsx        # OpenAI / Claude switch
│   ├── ReviewTypeSelector.tsx    # 4 review type buttons
│   ├── ReviewOutput.tsx          # Streaming markdown output
│   └── HistoryList.tsx           # Review history list
├── lib/
│   ├── prompts.ts                # System prompts per review type
│   ├── providers.ts              # AI provider config
│   └── history.ts                # localStorage history manager
└── tests/
    ├── prompts.test.ts           # Prompt generation tests
    └── history.test.ts           # History CRUD tests
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest tests |

## License

MIT
