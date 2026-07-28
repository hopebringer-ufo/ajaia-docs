# AI workflow

This document describes how AI-assisted tooling was used to deliver the Ajaia Docs MVP and how quality was verified.

## AI tools used

- **Cursor (Agent mode)** — Primary implementation assistant: scaffolding, Supabase schema, React/Next.js components, Server Actions, tests, and documentation.
- **Existing project template** — Next.js 16 + shadcn/ui starter provided UI primitives and Tailwind setup.

## Where AI accelerated development

- **Boilerplate velocity** — Repeated patterns (forms, dialogs, card lists, RLS policies) were generated quickly with consistent structure.
- **Supabase SSR wiring** — Middleware session refresh and server/browser client split followed established Supabase + Next.js App Router patterns.
- **Tiptap integration** — Extension configuration, toolbar mapping, and autosave hook were assembled from documented APIs.
- **Test scaffolding** — Vitest config, validation tests, and mocked Server Action tests.
- **Documentation** — README, architecture, and submission checklists drafted from the assessment spec.

## What was rejected or revised

- **Redirect-only auth actions** — Initial server actions called `redirect()` on success, which complicated client-side error handling; revised to return `{ success: true }` and navigate on the client.
- **Root-level `app/` only** — Spec required `src/` layout; project was migrated to `src/app` with updated path aliases.
- **RHF + native `form action` without coordination** — Client validation now uses `handleSubmit` before invoking server actions.
- **Over-broad mocks in tests** — `vi.doMock` per test was replaced with hoisted `vi.mock` for stable Supabase mocking.

## Correctness verification

1. **`npm run build`** — TypeScript and Next.js production build (with env vars set).
2. **`npm run test`** — 13 unit/integration-style tests (validation, import utils, mocked CRUD/share).
3. **Manual checklist** (with live Supabase): register → create doc → edit/autosave → share with second user → edit as shared user → rename/delete as owner.
4. **RLS** — Policies reviewed so owners and shared users match the spec; delete restricted to owner.

## Testing approach

- **Pure functions** — File validation, markdown/plain conversion, Zod schemas (no mocks).
- **Server Actions** — Supabase client mocked via `vi.mock("@/lib/supabase/server")`; auth user stubbed.
- **Autosave** — Debounce interval exported and asserted (hook timing tested indirectly; full RTL hook test can be added with fake timers).
- **No mock APIs in product** — Tests mock Supabase only; the running app uses real Supabase when configured.

## Human review focus

- RLS and share uniqueness constraints
- Middleware matcher and protected routes
- Autosave race conditions (single in-flight save via ref)
- Accessibility labels on toolbar and forms
