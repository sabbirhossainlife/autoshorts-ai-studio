# Troubleshooting

- API will not start: check DATABASE_URL, run `npx prisma migrate deploy` in apps/api, check the port is free.
- Ollama unavailable: start Ollama (`ollama serve`, `ollama pull llama3.1`), or write scripts manually — the app still launches.
- ComfyUI unavailable: start ComfyUI on port 8188, or import images manually via image-upload.
- No TTS: install espeak-ng or Piper, or set TTS_COMMAND, or upload WAV audio manually.
- FFmpeg not found: install FFmpeg 6+ and put it in PATH; the render smoke test will fail clearly if it is missing.
- YouTube upload fails: check connection status, OAuth scopes, quota, and privacy setting. Use the MP4 + metadata export fallback and upload manually.
- Render free hosts sleep: first request after idle can take 30–60s; this is a local-release note, not a bug in the studio.
