@echo off
REM AutoShorts AI Studio — Windows install (requires Node 20+, FFmpeg in PATH, Ollama/ComfyUI optional)
cd apps\api && call npm install && call npx prisma migrate deploy
cd ..\web && call npm install && call npm run build
echo Done. Start API with: npm --prefix apps\api start ; start web with: npm --prefix apps\web run preview
