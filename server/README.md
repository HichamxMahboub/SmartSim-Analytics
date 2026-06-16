# SmartSim Analytics API

Express API for SmartSim Analytics. It handles authentication, simulation projects, CSV/JSON uploads, bounded Python analytics, dashboard summaries, and PDF reports.

## Local Setup

```bash
npm install
cp .env.example .env
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
npm run dev
```

## Environment

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartsim_analytics
MONGO_TIMEOUT_MS=5000
JWT_SECRET=change_me_secure_secret
CLIENT_URL=http://localhost:5173
PYTHON_BIN=python3
PYTHON_ANALYSIS_TIMEOUT_MS=15000
PYTHON_ANALYSIS_MAX_OUTPUT_BYTES=1048576
```

Use a long random `JWT_SECRET` in production. Do not commit `.env`.

## Scripts

- `npm run dev`: Express server with nodemon.
- `npm start`: production start command.
- `npm run lint`: Node syntax validation for API files.
- `npm run python:check`: Python syntax validation.
- `npm run analyze:sample`: runs the Python analyzer against `matlab/sample_simulink_output.csv`.

## Health Check

```text
GET /api/health
```

Expected shape:

```json
{
  "status": "ok",
  "service": "SmartSim Analytics API",
  "uptimeSeconds": 42,
  "timestamp": "2026-06-16T12:00:00.000Z",
  "database": "connected"
}
```
