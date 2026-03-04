# 30 Days of Agentic AI

A web-based learning platform for mastering agentic AI concepts over 30 days. Built with TypeScript, featuring interactive demos, progress tracking, and a personal learning journal.

## Features

- **30-Day Curriculum** - Structured learning path across 6 phases:
  - Phase 1: Foundations (Days 1-6)
  - Phase 2: Frameworks (Days 7-12)
  - Phase 3: Memory & Knowledge (Days 13-18)
  - Phase 4: Multi-Agent & Mail (Days 19-24)
  - Phase 5: Mail & Mail (Days 25-27)
  - Phase 6: Mail & Mail (Days 28-30)

- **Interactive Demos** - Hands-on playgrounds to explore concepts:
  - Day 1: Agentic AI Core Concepts
  - Day 2: Structured Outputs & Function Calling
  - More coming soon...

- **Progress Tracking** - Track completion, streaks, and achievements

- **Learning Journal** - Personal notes and reflections for each day

- **Blog/Log** - Document your learning journey

## Tech Stack

- **TypeScript** - Type-safe application logic
- **esbuild** - Fast bundling
- **LocalStorage** - Persistent progress data
- **No framework** - Vanilla JS for simplicity

## Getting Started

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start development server (watches for changes)
npm run dev
```

Open `index.html` in your browser or use a local server.

## Project Structure

```
web-app/
├── src/
│   ├── app.ts          # Main application logic
│   ├── data.ts         # 30-day curriculum data
│   └── types.ts        # TypeScript interfaces
├── demos/
│   ├── day-1/          # Day 1 interactive demo
│   └── day-2/          # Day 2 interactive demo
├── data/
│   └── day-2/          # Resource summaries
├── dist/
│   └── app.js          # Bundled output
├── styles.css          # Application styles
└── index.html          # Entry point
```

## Scripts

- `npm run build` - Bundle TypeScript to dist/app.js
- `npm run dev` - Watch mode for development

## Demos

Each day can have an interactive demo accessible from the Demos page. Demos are self-contained HTML/CSS/JS that run without an API key using simulated responses.

### Creating a New Demo

1. Create `demos/day-N/` directory
2. Add `index.html`, `styles.css`, and `demo.js`
3. Add `demoUrl: "demos/day-N/"` to the day's entry in `src/data.ts`
4. Rebuild with `npm run build`

## License

MIT
