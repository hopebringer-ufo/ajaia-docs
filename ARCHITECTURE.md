# Architecture

## Overview

Ajaia Docs is a **monolithic Next.js application** using the App Router. The browser talks to Supabase for auth (via SSR cookie sessions) and data (PostgreSQL through the Supabase JS client). Business rules for ownership and sharing are enforced primarily in **Row Level Security (RLS)** policies, with Server Actions performing validation and orchestration.

```
┌─────────────┐     cookies/session     ┌──────────────────┐
│   Browser   │ ◄──────────────────────►│  Next.js (SSR)   │
│  Tiptap UI  │   Server Actions        │  Middleware      │
└─────────────┘                         └────────┬─────────┘
                                                 │ anon key + JWT
                                                 ▼
                                        ┌──────────────────┐
                                        │     Supabase     │
                                        │  Auth + Postgres │
                                        └──────────────────┘
```

## Key decisions

| Decision | Rationale |
|----------|-----------|
| Server Actions for mutations | Co-located with UI, typed end-to-end, no separate REST layer for CRUD |
| HTML in `documents.content` | Simple persistence for Tiptap; easy to render and autosave |
| RLS for authorization | Defense in depth; even direct API access respects policies |
| 2s debounced autosave | Balances UX (“Saved”) with write load |
| Client-side file import | No storage bucket required; instant document creation |
| `src/` layout | Clear separation from config, migrations, and scripts |

## Folder structure

- **`src/app/actions`** — Mutations: auth, documents, shares. Validates with Zod before Supabase calls.
- **`src/services`** — Read helpers used by Server Components (dashboard, document page).
- **`src/components/editor`** — Tiptap instance, toolbar, autosave wiring.
- **`src/lib/supabase`** — Browser client, server client, middleware session helper.
- **`supabase/migrations`** — Schema, indexes, triggers, RLS (source of truth for DB).

## Database

### Tables

- **`profiles`** — One row per `auth.users` (trigger on signup). Used for display names and share lookup by email.
- **`documents`** — `title`, `content` (HTML), `owner_id`, timestamps.
- **`document_shares`** — `(document_id, shared_with_user_id)` unique pair.

### Indexes

- `profiles(email)`, `documents(owner_id)`, `documents(updated_at DESC)`, share FK indexes.

### RLS summary

| Role | documents SELECT | INSERT | UPDATE | DELETE |
|------|------------------|--------|--------|--------|
| Owner | ✓ | ✓ | ✓ | ✓ |
| Shared user | ✓ | ✗ | ✓ | ✗ |
| Other | ✗ | ✗ | ✗ | ✗ |

Helper functions `user_can_access_document` and `user_owns_document` keep policies readable.

## Authentication

- Supabase Auth email/password.
- `@supabase/ssr` refreshes sessions in **middleware** and attaches cookies to Server Components and Server Actions.
- Protected paths: `/dashboard`, `/documents/*`. Auth routes redirect to dashboard when already signed in.

## Sharing model

1. Owner submits collaborator email (must match an existing `profiles.email`).
2. Server Action verifies ownership, resolves profile, inserts `document_shares`.
3. Unique constraint + explicit error handling prevent duplicate shares.
4. Shared user sees the document under **Shared With Me** and can edit content (RLS allows UPDATE).

## Autosave

- `useAutosave` tracks editor HTML, sets status: idle → unsaved → saving → saved (or error).
- Debounce: **2000 ms** after last keystroke (`AUTOSAVE_DELAY_MS`).
- Persists via `updateDocumentContentAction`; `updated_at` maintained by DB trigger.

## Tradeoffs

| Choice | Benefit | Cost |
|--------|---------|------|
| HTML storage | Simple | Harder to diff/merge; no operational transform |
| No Realtime | Faster MVP | No live cursors or simultaneous edit sync |
| Public profile email read for sharing | Simple lookup | All authenticated users can read profile emails (acceptable for assessment scope) |
| Server Actions vs REST | Less boilerplate | Fewer generic API consumers |

## Future improvements

- Operational transform or CRDT for concurrent editing
- Supabase Realtime subscriptions for live content
- Soft delete and trash
- Audit log of shares and edits
- Edge caching only for static assets; documents stay dynamic
