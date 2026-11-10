# SHUTTER Frontend

Next.js web client for SHUTTER, backed by the AMIX FastAPI gateway.

## Setup

```bash
cd AMIX/frontend
npm install
npm run dev
```

Set `AMIX_API_URL` in `frontend/.env.local` to point at the running AMIX gateway
(default: `http://localhost:8000`).
