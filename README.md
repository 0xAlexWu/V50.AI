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
3. `https://skills.sh/api/skills/{view}/{page}` (public paginated index API)
4. `https://skillsmp.com` (best-effort public/API ingestion, optional API key)

Ingestion flow:

1. Fetch paginated skills from ClawHub API (`/api/v1/skills?limit=...&cursor=...`).
2. Fetch paginated all-time skills from skills.sh (`/api/skills/all-time/{page}`).
3. Fetch archive skills from `openclaw/skills` GitHub and parse `SKILL.md` + `_meta.json`.
4. Fetch SkillsMP via best-effort adapters (API endpoints and/or public metadata parsing).
5. Normalize to a unified `Skill` type, merge, dedupe, and preserve source attribution.
6. Prioritize richer sources (`registry_source` > `repository_source` > `archived_source`).

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
REGISTRY_SKILLS_FETCH_LIMIT=60000
REGISTRY_SKILLS_MAX_PAGES=300
ARCHIVE_SKILLS_FETCH_LIMIT=600
SKILLS_SH_ENABLED=true
SKILLS_SH_MAX_PAGES=480
SKILLS_SH_PAGE_CONCURRENCY=12
SKILLS_SH_FETCH_LIMIT=200000
SKILLSMP_ENABLED=true
SKILLSMP_BASE_URL=https://skillsmp.com
SKILLSMP_API_KEY=optional_skillsmp_key
SKILLSMP_MAX_PAGES=300
SKILLSMP_PAGE_SIZE=100
SKILLSMP_FETCH_LIMIT=300000
RECENT_DAYS=30
REVALIDATE_SECRET=your_secret_for_api_revalidate
CRON_SECRET=your_secret_for_vercel_cron
```

- `GITHUB_TOKEN` is optional, but recommended in production to reduce rate-limit risk.
- `DEEPSEEK_API_KEY` enables AI Search on the `/skills` page.
- `DONATION_*_ADDRESS` controls wallet addresses shown on `/about`.
- `SKILLSMP_API_KEY` is optional but improves SkillsMP ingestion reliability.
- `CRON_SECRET` protects `/api/cron/skills-sync` for scheduled refreshes.
- The app works without a database in v1.

## Deploy to Vercel

1. Push repo to GitHub.
2. Import the project in Vercel.
3. Optionally set env vars (`GITHUB_TOKEN`, `REVALIDATE_SECRET`, etc.).
4. Deploy.

Automatic rolling updates:

- `vercel.json` schedules hourly refresh via `/api/cron/skills-sync`.
- The cron route revalidates `skills` cache and warms fresh aggregated data.

## Routes

- `/` Home
- `/skills` Searchable/filterable directory
- `/skills/[slug]` Skill detail page
- `/collections` Dynamic editorial collections
- `/about` Product and trust model explanation
- `/api/skills` JSON API for normalized skills
- `/api/revalidate` manual tag revalidation endpoint
- `/api/cron/skills-sync` automatic rolling refresh endpoint

## Known Limitations (v1)

- SkillsMP may be blocked by Cloudflare depending on region/IP; API key access is recommended when available.
- Very high page/fetch limits can increase refresh latency; tune `*_MAX_PAGES` and `*_FETCH_LIMIT` for your runtime budget.
- Some external indexes provide sparse metadata only (summary/version may be missing and are shown transparently).
