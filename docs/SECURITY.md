# Security

- Secrets live only in environment variables and the server .env file, never in frontend code, logs, or API responses. OAuth tokens are stored server-side (base64-obfuscated in this local release; for shared hosting, encrypt at rest with a KMS/vault).
- Never enter a Google password anywhere in this app. YouTube uses OAuth 2.0 with minimal scopes.
- Auth: bcrypt passwords, HttpOnly session cookie, double-submit CSRF token for mutations, rate limiting, Helmet headers, Zod validation, safe file paths (basename sanitisation), 50 MB upload cap, MIME checks, FFmpeg arguments are constructed, never interpolated from user text into a shell.
- Local services (Ollama, ComfyUI) bind to localhost by default; do not expose them publicly without authentication.
- Backup: copy the SQLite file and storage/ directory. Restore by replacing both while the server is stopped.
