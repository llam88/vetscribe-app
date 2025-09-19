# Vet Scribe Next.js Complete Pack (OpenAI + Supabase + PDF + Templates)

This pack upgrades your Vercel/Next.js app to a working web app with:
- OpenAI Whisper STT, SOAP generator, Client Summary
- Supabase Auth (magic link) + **Patients** CRUD (with RLS policies)
- **Templates picker** (SOAP/DAP/Discharge) to prefill notes
- **PDF export** (server route using `pdfkit`)
- Gated pages like `scribblevet.com`

## 0) Install deps
```bash
pnpm add openai @supabase/supabase-js @supabase/ssr pdfkit zod
# or npm i openai @supabase/supabase-js @supabase/ssr pdfkit zod
```

Remove any Groq deps (e.g., "@ai-sdk/groq").

## 1) Env vars (Vercel → Project → Settings → Environment Variables)
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

*(Do NOT expose your Supabase service role key; we'll use RLS on the client.)*

## 2) Supabase SQL (run in Supabase SQL editor)
Use `supabase.sql` from this pack to create the `profiles` and `patients` tables and RLS policies.

## 3) Routes & Pages
- API:
  - `POST /api/transcribe` → `{ transcription }`
  - `POST /api/generate-soap` → `{ soapNotes }`
  - `POST /api/client-summary` → `{ summary }`
  - `POST /api/export-pdf` → returns application/pdf stream
- Auth:
  - `/sign-in` → email magic link
  - Use server checks (see `/dashboard`, `/record`, `/patients`, `/notes`, `/templates`)

## 4) Start
```bash
pnpm dev
# deploy to Vercel when ready
```

## 5) PHI notice
If you're using OpenAI Whisper API, label the app **Demo only — not for PHI/HIPAA**.
