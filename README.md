# Syntax.fm Snack Pack Scraper (Minimal Node + TypeScript setup)

This small project runs `fetchSnacPack.ts` (a TypeScript scraper) with a minimal Node + TypeScript toolchain.

Quick start (macOS zsh):

1. Install dependencies:

```bash
cd /Users/marekkabala/Dev/syntaxApp
npm install
```

2. Run without build (uses ts-node):

```bash
npx ts-node fetchSnacPack.ts
```

3. Or compile then run:

```bash
npx tsc
node dist/fetchSnacPack.js
```

Notes:
- This project expects Node 18+ so `fetch` is available globally. If you have an older Node, polyfill `fetch` (e.g. `node-fetch`).
- If the site requires executing JavaScript to render content, consider using Puppeteer/Playwright and feeding page content to Cheerio.
