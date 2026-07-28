# Submission

Candidate: Jeo Carretas (`vincenzo.tech25@gmail.com`)

## Live product URL

**https://ajaia-docs-editor.netlify.app**

## Walkthrough video URL

See `VIDEO_URL.txt` in this folder (or paste your Loom/YouTube unlisted link below).

`https://YOUR-VIDEO-LINK`

## Reviewer credentials (sharing demo)

| Email | Password | Suggested use |
|--------|----------|----------------|
| `test@test.com` | `Password1` | Owner — create docs, share |
| `owner@owner.com` | `Password1` | Second user — receive share, edit under **Shared With Me** |

Demo flow for reviewers: sign in as `test@test.com` → create a document → Share with `owner@owner.com` → sign out → sign in as `owner@owner.com` → open **Shared With Me**.

## Completed features (maps to assignment)

| Requirement | Status |
|-------------|--------|
| Create / rename / edit / save / reopen documents | Working |
| Rich text (bold, italic, underline, headings, lists) | Working (Tiptap) |
| Autosave + reopen after refresh | Working (Supabase Postgres) |
| File upload (`.txt` / `.md` → new document) | Working |
| Sharing (owner + grant access + owned vs shared) | Working |
| Persistence | Working |
| Live deployment | Working (Netlify) |
| README + architecture note + AI workflow note | Included |
| Automated tests | Vitest (see `src/tests/`) |
| Walkthrough video | Fill `VIDEO_URL.txt` |

## Known limitations (intentional scope cuts)

- No realtime multi-cursor collaboration (last-write-wins)
- Import supports `.txt` and `.md` only (not `.docx`); stated in UI/README
- Sharing is edit access for registered emails (no view-only / comments)
- Markdown import is a lightweight converter, not full CommonMark

## What I would build next (2–4 hours)

1. Realtime presence / collaboration via Supabase Realtime or Yjs  
2. Playwright E2E against staging  
3. Export Markdown / PDF  
4. View-only share role  

## Repo

- Source: https://github.com/hopebringer-ufo/ajaia-docs  
- Stack: Next.js 16, React 19, Supabase Auth + Postgres + RLS, Tiptap, Netlify  

## Docs included in this submission folder

- `README.md` — setup, env vars, Netlify + Supabase  
- `ARCHITECTURE.md` — prioritization and tradeoffs  
- `AI_WORKFLOW.md` — AI tools, what was rejected, verification  
- `SUBMISSION.md` — this file  
- `REQUIREMENTS_CHECKLIST.md` — detailed checklist  
- `VIDEO_URL.txt` — walkthrough link  
- Screenshots (optional)  

## Local run (short)

```bash
git clone https://github.com/hopebringer-ufo/ajaia-docs.git
cd ajaia-docs
cp .env.example .env.local   # fill Supabase URL + anon key
npm install
npm run dev
```

See README for migrations / Netlify env details.
