# Ajaia Docs

Production-oriented MVP of a collaborative document editor (Google Docs–style) built for a hiring assessment. Users authenticate with Supabase, manage documents on a dashboard, edit rich text with Tiptap, import `.txt`/`.md` files, and share documents with other registered users.

## Features

- **Authentication** — Email/password register, login, logout, session persistence (Supabase SSR cookies), protected routes via middleware
- **Dashboard** — “My Documents” and “Shared With Me”, search, create/import, responsive layout with sidebar and navbar
- **Document CRUD** — Create, rename, delete, open, update with autosave (2s debounce) and save status UI
- **Rich text** — Tiptap toolbar: bold, italic, underline, heading, paragraph, lists, undo/redo, horizontal rule, placeholder
- **Import** — Browser-side read of `.txt` and `.md` (max 5 MB), auto-create document
- **Sharing** — Share by registered email; shared users can edit; duplicate shares prevented
- **Security** — PostgreSQL RLS: owners full CRUD; shared users read/update; others denied
- **UI** — shadcn/ui, dark mode toggle, skeletons, empty states, toasts (Sonner)
- **Testing** — Vitest + RTL setup; validation, import utilities, autosave constant, mocked document actions

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js Server Actions, Route Handlers (`/api/health`) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Editor | Tiptap |
| Forms / validation | React Hook Form, Zod |
| Tests | Vitest, React Testing Library, jsdom |
| Deploy | Netlify (or any Node host); Supabase cloud |

## Installation

```bash
git clone <repo-url>
cd ajaia-docs
npm install
```

Copy environment variables (create `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional (seed script only):

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Netlify:** set `SUPABASE_DATABASE_URL` so migrations run on each deploy (see Deployment). **Manual:** run `001_initial_schema.sql` and `002_document_update_guard.sql` in the SQL Editor.
3. Under **Authentication → Providers**, enable Email and (for local demos) disable “Confirm email” or confirm users manually.
4. Add the project URL and anon key to `.env.local` (see `.env.example`).

### Demo users

| Email | Password |
|--------|----------|
| `owner@example.com` | `Password123!` |
| `editor@example.com` | `Password123!` |

Create them with the admin script (service role key required):

```bash
SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-users.mjs
```

Profiles are created automatically by the `on_auth_user_created` trigger. Optionally insert sample documents via `supabase/seed.sql` after replacing owner UUID placeholders.

## Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # production server
npm run test    # unit tests
npm run lint    # ESLint
```

## Deployment (Netlify + Supabase)

### 1. Supabase (database & auth)

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → run **both** files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_document_update_guard.sql`
3. **Authentication → Providers** → enable Email.
4. For demos, disable **Confirm email** (or confirm users manually).
5. **Authentication → URL configuration** (after you know your Netlify URL):
   - **Site URL:** `https://YOUR-SITE.netlify.app`
   - **Redirect URLs:** add:
     - `https://YOUR-SITE.netlify.app/**`
     - `http://localhost:3000/**` (local dev)
6. **Project Settings → API** → copy **Project URL** and **anon public** key.

Optional demo users (run locally, not on Netlify):

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key npm run seed:users
```

### 2. Netlify (app)

1. [Netlify](https://app.netlify.com) → **Add new site** → **Import from Git** → select this repo.
2. Build settings (usually auto-detected from `netlify.toml`):
   - Build command: `npm run build` (runs SQL migrations first, then `next build`)
   - Plugin: `@netlify/plugin-nextjs` (declared in `netlify.toml`)
3. **Site configuration → Environment variables** (required):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable / anon key |
| `NEXT_PUBLIC_SITE_URL` | `https://your-site.netlify.app` |
| `SUPABASE_DATABASE_URL` | **Session pooler** Postgres URI (see below) |

`SUPABASE_DATABASE_URL` is **server-only** (not `NEXT_PUBLIC_*`). Migrations run once per file and are tracked in `_ajaia_schema_migrations`.

**Important for Netlify:** use **Session pooler**, not Direct. Direct hosts (`db.*.supabase.co`) often resolve to IPv6 only and fail with `ENETUNREACH` on Netlify builds.

1. Supabase → **Project Settings** → **Database** → **Connection string**
2. Choose **Session pooler** (port `5432`, host like `….pooler.supabase.com`)
3. Copy the URI and replace `[YOUR-PASSWORD]` with your database password
4. Paste into Netlify as `SUPABASE_DATABASE_URL`

Do **not** put `SUPABASE_SERVICE_ROLE_KEY` on Netlify unless you add a secure server-only feature that needs it.

4. Deploy. After the first deploy, update Supabase **Site URL** / **Redirect URLs** with your real `https://….netlify.app` domain if you used a placeholder earlier.
5. Smoke test: register → create doc → edit (autosave) → share with second user.

Health check: `GET /api/health`.

### Local production build (optional)

```bash
NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... npm run build
npm run start
```

## Folder structure

```
src/
  app/                 # Routes, layouts, Server Actions
    (auth)/            # Login, register
    (dashboard)/       # Dashboard
    documents/[id]/    # Editor page
    actions/           # auth, documents, shares
    api/health/        # Route handler
  components/
    auth/
    dashboard/
    documents/
    editor/
    layout/
    ui/                # shadcn components
  hooks/               # useAutosave, useDebouncedValue
  lib/                 # Supabase clients, validations, utils
  services/            # Server-side document queries
  types/
  utils/               # File import helpers
  tests/
supabase/
  migrations/
  seed.sql
scripts/
  seed-users.mjs
middleware.ts          # Session refresh + route protection
```

## Screenshots

_Add screenshots of the dashboard, editor, and share dialog after deployment._

## Future improvements

- Real-time collaborative cursors (Yjs / Supabase Realtime)
- Version history and restore
- Comments and suggestions mode
- Organization/workspaces and role-based sharing (view vs edit)
- @mentions and notifications

See also `ARCHITECTURE.md`, `AI_WORKFLOW.md`, and `SUBMISSION.md`.
