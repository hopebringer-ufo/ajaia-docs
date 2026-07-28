# Submission

## Completed features

See **`REQUIREMENTS_CHECKLIST.md`** for the full assessment matrix.

- [x] Email/password register, login, logout
- [x] Session persistence (Supabase SSR + middleware)
- [x] Protected dashboard and document routes
- [x] Dashboard: My Documents, Shared With Me, search, create, responsive UI
- [x] Document cards: title, owner, updated date, Open, Rename, Delete (owner only)
- [x] Create, rename, delete, open, update documents
- [x] Autosave (2s) with Saving / Saved / Unsaved / error states
- [x] HTML content stored in Supabase
- [x] Tiptap toolbar (bold, italic, underline, heading, paragraph, lists, undo/redo, HR, placeholder)
- [x] Keyboard shortcuts (Tiptap defaults: Ctrl+B, Ctrl+I, Ctrl+Z, etc.)
- [x] Import `.txt` and `.md` (5 MB limit, validation, errors)
- [x] Share by registered email; shared users edit; duplicate prevention; toasts
- [x] SQL migration with indexes, FKs, RLS
- [x] React Hook Form + Zod validation
- [x] Vitest tests (create, rename, delete, share validation, autosave constant, import)
- [x] README, ARCHITECTURE, AI_WORKFLOW, SUBMISSION
- [x] Demo user seed script
- [x] Dark mode toggle
- [x] 404 and unauthorized pages
- [x] Loading and empty states

## Known limitations

- **No live multi-user sync** — Last write wins; no operational transform or presence.
- **Markdown import** — Lightweight converter (headings, lists, emphasis); not full CommonMark.
- **Email confirmation** — Depends on Supabase project settings; disable confirm email for easiest local demo.
- **Profile email visibility** — Authenticated users can read profiles for sharing lookup (documented in architecture).
- **Rename on dashboard only for owners** — Shared users cannot rename or delete.

## Future improvements

- Realtime collaboration and cursor presence
- Document folders/tags
- Export to PDF/Markdown
- Granular permissions (view-only vs edit)
- E2E tests (Playwright) against a test Supabase project

## Deployment URL

`https://YOUR-SITE.netlify.app` _(replace after Netlify deploy)_

## Video walkthrough URL

`https://YOUR-VIDEO-LINK` _(replace with Loom/YouTube demo)_

## Seeded users

| Email | Password | Role |
|--------|----------|------|
| `owner@example.com` | `Password123!` | Creates and shares documents |
| `editor@example.com` | `Password123!` | Receives shares; can edit |

Create via:

```bash
node scripts/seed-users.mjs
```

(with `SUPABASE_SERVICE_ROLE_KEY` and project URL set)

Sample documents: see `supabase/seed.sql` after substituting the owner user UUID.
