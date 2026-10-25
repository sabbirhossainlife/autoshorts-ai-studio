# AutoShorts AI Studio

🌐 **Live demo (frontend only):** https://autoshorts-ai-studio.netlify.app — backend (Express + SQLite + Ollama/ComfyUI/FFmpeg) runs locally, so live backend features show as unavailable until a backend is connected.

Local-first, production-minded studio for original English YouTube Shorts for US viewers. Free local tools wherever feasible; no paid AI API or purchased credits required for the core local workflow.

## Architecture

- `apps/web` — React + Vite + Tailwind + React Router, 14-section sidebar dashboard (Overview, Trend Research, Content Planner, Script Studio, Scene & Image Studio, Voice Studio, Video Editor, Render Queue, YouTube Publisher, Channel Analytics, Templates, Settings, System Health, Activity Logs). Shows real backend data or explicit unavailable states — never fabricated metrics.
- `apps/api` — Node/Express ES modules, Prisma + SQLite, persistent queue worker with retry/backoff/cancellation/restart recovery, validated workflow states: draft → researching → script_review → asset_generation → voice_generation → rendering → quality_review → awaiting_approval → uploading → published (+ paused/cancelled/failed/retry_pending).
- `packages/shared` — ranking heuristic (30/25/20/15/10), workflow transitions, title/duration validation.
- Integrations: Ollama (script JSON, validated, retry), ComfyUI (queue + manual import fallback), local TTS adapter (espeak-ng/Piper/custom command, manual audio upload fallback), FFmpeg (1080×1920, 9:16, H.264/AAC/MP4), YouTube Data API OAuth 2.0 + resumable upload (secure server-side tokens, explicit approval, MP4+metadata export fallback).
- `storage/` — files on disk, referenced by path in SQLite (no video binaries in the DB).

## Run locally (exact commands)

```bash
cd autoshorts-ai-studio
cp .env.example apps/api/.env   # edit JWT_SECRET
cd apps/api && npm install && npx prisma migrate deploy
node scripts/seed-demo.js       # optional demo project (labelled DEMO)
npm start                        # API on http://127.0.0.1:4000
cd ../web && npm install && npm run dev   # web on http://127.0.0.1:5173
```

Demo account: created only by seed-demo.js (the script prints its login on first run); change its password after first login. No demo account exists on a fresh boot.

## Optional local services

- Ollama: `ollama serve` + `ollama pull llama3.1` (set OLLAMA_URL/OLLAMA_MODEL)
- ComfyUI: run on http://127.0.0.1:8188, import `workflows/comfyui/shorts-workflow.json`, set a licensed checkpoint
- TTS: install `espeak-ng` or Piper, or set TTS_COMMAND
- YouTube: set YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET / YOUTUBE_REDIRECT_URI in apps/api/.env, then connect in Publisher. Default privacy is private; human approval is required before any upload.

## Tests

```bash
npm --prefix apps/api test
npm --prefix apps/web test
npm --prefix apps/web run build
```

No test uploads a real video. External services are mocked or probed with short timeouts and reported as unavailable when unreachable.

## Honest limitations

See `docs/` and the System Health page: Ollama, ComfyUI, TTS, and YouTube are optional and reported unavailable until configured/running. Analytics shows only retrieved snapshots; unavailable metrics are labelled, not invented.
