# V50.ai

V50.ai is a production-ready Next.js storefront for discovering **real OpenClaw skills**.

It renders live data from public repositories, parses `SKILL.md` files with frontmatter, and avoids mock records or fabricated engagement metrics.

## Stack

- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn-style component primitives
- lucide-react
- framer-motion
- gray-matter + react-markdown (remark-gfm)

## Real Data Sources

Current v1 ingestion sources (official/public):

1. `https://clawhub.ai/api/v1/skills` (official public registry API, primary)
2. `https://github.com/openclaw/skills` (official public archive, fallback/supplement)

Ingestion flow:

1. Fetch skills list from ClawHub public API (`/api/v1/skills`).
2. Normalize registry metadata (slug, summary, tags, stats, updated time).
3. For detail pages, fetch live skill detail (`/api/v1/skills/{slug}`) and `SKILL.md` file endpoint when available.
4. Fetch archive skills from `openclaw/skills` GitHub and parse `SKILL.md` + `_meta.json`.
5. Merge and dedupe records, prioritize registry source, and label provenance/trust.

## No-Fabrication Policy

V50.ai does **not** invent:

- installs
- ratings
- reviews
- popularity scores
- update dates

If upstream data is missing, the UI shows missing values gracefully.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Environment Variables (Optional)

Create `.env.local` if needed:

```bash
GITHUB_TOKEN=your_token_for_higher_rate_limits
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-chat
DONATION_BTC_ADDRESS=your_btc_address
DONATION_ETH_ADDRESS=your_eth_address
DONATION_DOGE_ADDRESS=your_doge_address
DONATION_LTC_ADDRESS=your_ltc_address
REGISTRY_SKILLS_FETCH_LIMIT=200
ARCHIVE_SKILLS_FETCH_LIMIT=120
RECENT_DAYS=30
REVALIDATE_SECRET=your_secret_for_api_revalidate
```

- `GITHUB_TOKEN` is optional, but recommended in production to reduce rate-limit risk.
- `DEEPSEEK_API_KEY` enables AI Search on the `/skills` page.
- `DONATION_*_ADDRESS` controls wallet addresses shown on `/about`.
- The app works without a database in v1.

## Deploy to Vercel

1. Push repo to GitHub.
2. Import the project in Vercel.
3. Optionally set env vars (`GITHUB_TOKEN`, `REVALIDATE_SECRET`, etc.).
4. Deploy.

## Routes

- `/` Home
- `/skills` Searchable/filterable directory
- `/skills/[slug]` Skill detail page
- `/collections` Dynamic editorial collections
- `/about` Product and trust model explanation
- `/api/skills` JSON API for normalized skills
- `/api/revalidate` manual tag revalidation endpoint

## Known Limitations (v1)

- Data currently prioritizes `openclaw/skills` archive source; registry-source integration can be added as a second ingestion layer.
- Unauthenticated GitHub API usage may hit rate limits.
- `Recently Updated` depends on metadata availability in `_meta.json`.
