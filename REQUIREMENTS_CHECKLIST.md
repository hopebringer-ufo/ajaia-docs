# Assessment requirements checklist

Status key: **Complete** | **Partial** | **N/A (submission artifact)**

## Tech stack

| Requirement | Status | Notes |
|-------------|--------|--------|
| Next.js 16 App Router | Complete | `src/app/` |
| React 19 | Complete | `package.json` |
| TypeScript strict | Complete | `tsconfig.json` strict |
| Tailwind CSS | Complete | `globals.css`, components |
| shadcn/ui | Complete | `src/components/ui/` |
| Route Handlers | Complete | `src/app/api/health/route.ts` |
| Server Actions | Complete | `src/app/actions/` |
| Supabase PostgreSQL | Complete | migrations + services |
| Supabase Auth (email/password) | Complete | login/register/logout |
| Supabase Storage | N/A | Not required for MVP scope |
| Tiptap | Complete | `document-editor.tsx` |
| Vitest + RTL | Complete | `vitest.config.ts`, `src/tests/` (RTL setup + unit tests) |
| Netlify deployment ready | Complete | `npm run build` + `netlify.toml` |

## Authentication

| Requirement | Status | Notes |
|-------------|--------|--------|
| Register | Complete | `/register` |
| Login | Complete | `/login` |
| Logout | Complete | Navbar form |
| Protected dashboard | Complete | Middleware + page guard |
| Session persistence | Complete | `@supabase/ssr` middleware |

## Dashboard

| Requirement | Status | Notes |
|-------------|--------|--------|
| My Documents section | Complete | `dashboard-view.tsx` |
| Shared With Me section | Complete | `#shared` anchor |
| Card: title, owner, updated | Complete | `document-card.tsx` |
| Open / Rename / Delete | Complete | Owner manage actions |
| Search box | Complete | Debounced filter |
| Create Document | Complete | `create-document-button.tsx` |
| Responsive design | Complete | Sidebar drawer, grids |

## Document management

| Requirement | Status | Notes |
|-------------|--------|--------|
| Create | Complete | Server action |
| Rename | Complete | Owner only |
| Delete | Complete | Owner only |
| Open | Complete | `/documents/[id]` |
| Update content | Complete | Editor + action |
| Autosave | Complete | 2s debounce |
| Last edited timestamp | Complete | `updated_at` on cards |
| Validation | Complete | Zod + content size |
| Empty states | Complete | Per section + search |
| Loading states | Complete | Dashboard + document `loading.tsx` |
| HTML in Supabase | Complete | `documents.content` |

## Rich text editor

| Requirement | Status | Notes |
|-------------|--------|--------|
| Bold / Italic / Underline | Complete | Toolbar |
| Heading / Paragraph | Complete | H1–H3 + paragraph |
| Bullet / Numbered lists | Complete | Toolbar |
| Undo / Redo | Complete | Toolbar + shortcuts |
| Horizontal divider | Complete | HR extension |
| Placeholder | Complete | Tiptap Placeholder |
| Autosave 2s | Complete | `use-autosave.ts` |
| Saving / Saved / Unsaved | Complete | Status label |
| Ctrl+B / Ctrl+I / Ctrl+Z | Complete | Tiptap defaults |

## File import

| Requirement | Status | Notes |
|-------------|--------|--------|
| `.txt` / `.md` only | Complete | `file-import.ts` |
| Browser read | Complete | `File.text()` |
| Auto-create document | Complete | `importDocumentAction` |
| Reject other types | Complete | Validation |
| 5 MB limit | Complete | Import + server content cap |
| Error messages | Complete | Toasts + validation |

## Sharing

| Requirement | Status | Notes |
|-------------|--------|--------|
| Share by registered email | Complete | `shareDocumentAction` |
| Verify account exists | Complete | Profile lookup |
| Sharing record | Complete | `document_shares` |
| Shared With Me visibility | Complete | `getSharedDocuments` |
| Shared user can edit | Complete | RLS + trigger guard |
| No duplicate shares | Complete | Unique + error handling |
| Success/error toasts | Complete | Sonner |

## Database

| Requirement | Status | Notes |
|-------------|--------|--------|
| profiles / documents / document_shares | Complete | Migration 001 |
| Indexes, FKs, RLS | Complete | Migration 001 |
| Owner CRUD / shared read+update | Complete | RLS + migration 002 guard |
| SQL migration | Complete | `supabase/migrations/` |

## Project structure

| Requirement | Status | Notes |
|-------------|--------|--------|
| `src/app`, `components`, `editor`, etc. | Complete | See README |

## UI / UX

| Requirement | Status | Notes |
|-------------|--------|--------|
| Navbar, Sidebar, Toolbar, cards, dialogs | Complete | |
| Responsive layouts | Complete | |
| Skeleton loading | Complete | |
| Hover / empty states | Complete | |
| Dark mode | Complete | Theme toggle + script |

## Error handling

| Requirement | Status | Notes |
|-------------|--------|--------|
| Auth / validation / Supabase errors | Complete | Forms + toasts |
| Upload failures | Complete | Import errors |
| 404 | Complete | `not-found.tsx` |
| Unauthorized page | Partial | Page exists; access denied uses 404 for missing RLS rows |

## Validation (RHF + Zod)

| Requirement | Status | Notes |
|-------------|--------|--------|
| Login / Register | Complete | |
| Rename / Share | Complete | |

## Testing

| Requirement | Status | Notes |
|-------------|--------|--------|
| Document create / rename / delete | Complete | Mocked actions |
| Sharing validation | Complete | |
| Autosave logic | Complete | Constant + hook behavior |
| Mock Supabase | Complete | `vi.mock` in tests |

## Documentation & submission

| Requirement | Status | Notes |
|-------------|--------|--------|
| README.md | Complete | |
| ARCHITECTURE.md | Complete | |
| AI_WORKFLOW.md | Complete | |
| SUBMISSION.md | Complete | |
| Seed users | Complete | `scripts/seed-users.mjs` |
| Screenshots section | Partial | Placeholder in README |
| Deployment URL | Partial | Placeholder in SUBMISSION |
| Video URL | Partial | Placeholder in SUBMISSION |

## Post-review fixes applied

- RLS escalation fix: `002_document_update_guard.sql` (trigger + split update policies)
- Server content size limit (5 MB) on create/update/import
- Autosave: no dashboard revalidation on every save; stale-save race handling
- Login `redirect` query param support
- Document route loading skeleton
- Search empty states vs true empty states
- UI refresh (SaaS-style layout, typography, colors)
- Demo credentials shown only in development
