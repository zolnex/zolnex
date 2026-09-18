# RankPulse

**A static SEO opportunity workspace for hackathon demos and product discovery.** Enter a domain to explore deterministic local projections for traffic, keywords, technical health, backlinks, and competitors—then optionally ask Gemini for a strategy brief.

> **Important:** RankPulse is not a crawler, Google Search Console integration, backlink index, or source of verified keyword data. Every dashboard metric is a deterministic browser-side projection derived from the entered domain. Validate any decision with first-party analytics, Search Console, and a real technical crawl.

## What is included

- Domain-first landing page with an 820 ms analysis skeleton
- Overview with six SEO metric cards, a 12-month traffic area chart, and position distribution chart
- A 200-row keyword table with full column sorting, text/position/volume filters, inline sparklines, and 20-row pagination
- Site audit with health gauge, severity counts, and expandable categories
- Competitor comparison cards and grouped visibility chart
- Backlink profile with referring-domain table plus two donut charts
- Light and dark themes persisted in `localStorage`
- Recent domain projects persisted in `localStorage`
- Browser-generated PDF overview export
- Optional **RankPulse AI** strategic brief using the Gemini API model `gemini-3.1-flash-lite`

## Local development

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The app is designed for a static GitHub Pages deployment and uses hash routes so dashboard paths survive refreshes without server rewrites.

```bash
npm run build   # TypeScript check + production build
npm run preview # serve the generated static bundle
```

## Gemini AI integration

The AI panel accepts a visitor's Gemini API key at the moment they generate a brief. The browser sends the request directly to Gemini's `generateContent` endpoint with the selected model. The key is held in React state only and is never written to browser storage.

Do **not** place a shared Gemini key in a `VITE_*` environment variable. Vite embeds those variables into the public JavaScript bundle, so they are not secret. See [`.env.example`](.env.example) for the security note.

If a different Gemini model name or API version is required by the deployed Google project, update `GEMINI_MODEL` in [`src/lib/gemini.ts`](src/lib/gemini.ts).

## SEO launch work

The short, implementation-specific audit and keyword map live in [`docs/SEO-AUDIT.md`](docs/SEO-AUDIT.md). It covers the inherited site's launch blockers, target intent clusters, implemented metadata/schema/sitemap changes, and the final post-deploy checklist.

Static SEO files:

- [`index.html`](index.html): title, description, canonical, social metadata, `WebApplication`, and accurate FAQ structured data
- [`public/robots.txt`](public/robots.txt)
- [`public/sitemap.xml`](public/sitemap.xml)

Before production, replace `https://zolnex.github.io/` in those files if RankPulse is deployed on another canonical domain.

## Project structure

```text
src/
├── App.tsx            # App shell, routes, screens, charts, and dashboard UI
├── lib/
│   ├── seoData.ts     # Seeded generator and typed local projection model
│   └── gemini.ts      # Direct Gemini 3.1 Flash Lite client
├── index.css          # Responsive light/dark design system
└── main.tsx           # HashRouter bootstrap for static hosting
```

## Deployment

The repository's GitHub Actions workflow builds the Vite bundle and publishes `dist/` to GitHub Pages. The Vite configuration uses a relative base path and accepts the Arena preview host.
