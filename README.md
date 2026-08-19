# 🎮 zolnex

**An instant HTML5 game portal.** Developers upload games as ZIP files; players browse and play them instantly in the browser — no downloads, no accounts required to play.

```
Browser → GitHub Pages (static React build) → Supabase (DB · Auth · Storage)
```

There is **no server**: all logic runs in the browser via the Supabase JS SDK. GitHub Pages serves the static build; Supabase handles everything dynamic.

---

## ✨ Features

- 🎯 **Instant play** — games load in an isolated, fullscreen-capable iframe
- 🗂️ **Browse & search** — categories, free-text search, sort by newest / most played
- 📦 **ZIP upload** — extracted in-browser with JSZip, validated (`index.html` required), stored in Supabase Storage
- 🔐 **GitHub OAuth** sign-in for developers
- 📊 **Developer dashboard** — play counts, storage quota, game status
- 🛡️ **Row Level Security** on every table
- 🧩 **Demo mode** — runs fully with built-in sample games **before** you wire up Supabase, so you can explore the whole flow immediately

---

## 🚀 Quick start (local)

```bash
npm install
npm run dev      # http://localhost:5173
```

That's it — the app boots straight into **demo mode** with 6 playable built-in games (Neon Breaker, 2048, Snake, Memory Match, Tic-Tac-Toe, Reflex Rush). Sign-in, uploads, and the dashboard all work against local mock data.

To enable real auth, uploads & persistence, [connect Supabase](#-connect-supabase-optional).

---

## 🏗️ Tech stack

| Layer      | Choice                                   |
| ---------- | ---------------------------------------- |
| Frontend   | React 18 + TypeScript + Vite            |
| Styling    | Tailwind CSS                            |
| Backend    | Supabase (PostgreSQL · Auth · Storage)  |
| Hosting    | GitHub Pages (static)                   |
| ZIP handle | JSZip (in-browser, no server)           |

---

## 🌐 GitHub Pages — how this is optimized

GitHub Pages serves **static files only** — no Node, no API routes, no server-side routing. This project is built around those constraints:

| Constraint                  | Solution in this repo                                                |
| --------------------------- | -------------------------------------------------------------------- |
| No server-side routing      | **HashRouter** — deep links survive a hard refresh with no 404 hack  |
| Unknown deploy path         | **Relative `base: './'`** in Vite — works at `/`, `/repo/`, domains |
| No runtime env vars         | `VITE_*` secrets are **baked in at build time** by GitHub Actions    |
| Public anon key in bundle   | Safe by design — **Row Level Security** protects data, not the key   |
| HTTPS only                  | All assets/CDN URLs use HTTPS                                        |
| Bundle size on slow CDN     | Manual vendor chunking (react / supabase / jszip) for caching        |

### Deployment pipeline

```
push to main → GitHub Actions → npm run build (injects secrets) → dist/ → GitHub Pages
```

### One-time GitHub setup

1. **Settings → Pages → Build and deployment → Source:** `GitHub Actions`
2. **Settings → Secrets and variables → Actions → New repository secret:**
   - `SUPABASE_URL` — e.g. `https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY` — your project's public anon key

The workflow lives at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

> Because the build uses a **relative base**, the site works whether it's deployed
> as a project page (`user.github.io/repo/`), a user/org page
> (`user.github.io`), or a custom domain — no config changes needed.

---

## 🔌 Connect Supabase (optional, for production)

### 1. Database & auth
1. Create a project at [supabase.com](https://supabase.com)
2. **SQL Editor → New query**, paste & run [`supabase/schema.sql`](supabase/schema.sql)
3. **Storage → New bucket →** name it `game-files`, set **Public** = on
4. **Authentication → Providers → GitHub →** enable it (paste a GitHub OAuth App's client ID/secret; callback URL is shown in Supabase)

### 2. Local env
```bash
cp .env.example .env
# fill in:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```
Restart `npm run dev` — the demo banner disappears and real data takes over.

### 3. Deploy
Add the same two values as `SUPABASE_URL` / `SUPABASE_ANON_KEY` repo secrets (see above), then push to `main`.

---

## 🗄️ Data model

```
users              id · email · username · display_name · avatar_url · role
games              id · developer_id · title · slug · description · category
                   · status · cover_path · storage_prefix · entry_file · play_count
developer_quotas   developer_id · max_games (10) · max_storage_mb (500) · used_storage_mb
```

Storage layout (public bucket `game-files`):
```
game-files/games/<game-uuid>/index.html … game.js … assets/ … cover.jpg
```

---

## 🧩 Project structure

```
src/
├── components/
│   ├── auth/ProtectedRoute.tsx        # Route guard (role-aware)
│   ├── games/GameCard.tsx             # Browse card
│   ├── games/GamePlayer.tsx           # iframe + fullscreen player
│   ├── layout/{Header,Footer,Layout}  # App shell
│   └── DemoBanner.tsx                 # Shown only when Supabase is unset
├── hooks/useAuth.tsx                  # Auth context (Supabase + demo fallback)
├── lib/
│   ├── supabase.ts                    # Client + isSupabaseConfigured
│   ├── games.ts                       # Unified data access (real | demo)
│   ├── mockData.ts                    # Demo-mode store & sample games
│   ├── miniGames.ts                   # 6 self-contained playable games
│   └── utils.ts                       # slugify, ZIP extraction, formatting
├── pages/{Home,Browse,GamePage,Dashboard,Upload,Profile,NotFound}.tsx
├── types/index.ts                     # Shared types
├── App.tsx · main.tsx · index.css
supabase/schema.sql                    # Tables, RLS, triggers, storage policies
.github/workflows/deploy.yml           # Pages deploy
```

---

## 🔐 Why shipping the anon key is safe

The Supabase **anon key** is designed to be public — it only identifies your project; it grants no special access. All data access is gated by **Row Level Security** policies defined in `supabase/schema.sql`. Think of the key as "who is asking" (anonymous) and RLS as "what they're allowed to see."

---

## 📜 Commands

```bash
npm install      # install deps
npm run dev      # dev server (localhost:5173)
npm run build    # type-check + production build → dist/
npm run preview  # serve the production build locally
```

---

## ⚠️ Notes & limits

- Game ZIPs must contain `index.html` (root or one folder deep); max **100 MB**
- Default developer quota: **10 games**, **500 MB** storage
- All game resources must be HTTPS (GitHub Pages enforces HTTPS — no mixed content)

---

Built with React, Vite & Supabase · Hosted on GitHub Pages.
