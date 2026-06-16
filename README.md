# SmartSim Analytics

SmartSim Analytics is a portfolio-ready simulation analytics platform. It combines a React/Vite frontend, a Node/Express API, MongoDB persistence, and deterministic Python analytics scripts to process simulation datasets and generate engineering insights.

The project is intentionally honest: it does not run Simulink in the browser. It models a practical workflow where MATLAB/Simulink exports CSV or JSON data, the web app ingests the dataset, Python analyzes the signals, and the dashboard presents KPIs, anomalies, stability, trends, and PDF reports.

## Portfolio Value

SmartSim Analytics is designed for engineering, data, and full-stack internship interviews. It demonstrates:

- Full-stack product structure with React, Express, MongoDB, and Python.
- Simulation-data workflow inspired by MATLAB/Simulink exports.
- Security-conscious development practices: environment examples, ignored secrets, JWT auth, upload validation, and bounded Python execution.
- Recruiter-friendly documentation, API references, CI, and a repeatable sample dataset.
- Clear separation between UI, API, persistence, reporting, and analytics code.

## Features

- JWT register/login flow.
- Simulation project CRUD.
- CSV/JSON upload with file type, size, and preview validation.
- Python analysis endpoint with upload-directory confinement, timeout, and output limits.
- Deterministic analytics output with versioned JSON schema.
- KPIs for numeric signals: points, mean, min, max, standard deviation, and threshold exceedances.
- Z-score anomaly detection, trend estimation, stability classification, and recommendations.
- React dashboard with empty, loading, and error states.
- Signal charts for target signal, input/output comparison, and anomalies.
- PDF report generation with project metadata, KPIs, anomalies, and recommendations.
- GitHub Actions CI for server, client, and Python validation.

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS, React Router, Axios, Recharts, Lucide icons.
- Backend: Node.js, Express, Mongoose, MongoDB, JWT, Multer, PDFKit, Zod.
- Analytics: Python 3.10+, pandas, numpy, scipy, scikit-learn.
- Simulation sample: `matlab/sample_simulink_output.csv` plus MATLAB export notes in `matlab/`.
- CI: GitHub Actions with Node 20 and Python 3.11.

## Architecture

```text
MATLAB/Simulink export
        |
        v
CSV/JSON dataset -> Express upload -> MongoDB metadata
                           |
                           v
                  Python analysis script
                           |
                           v
              JSON result stored in MongoDB
                           |
                           v
        React dashboard + charts + PDF report
```

Key folders:

```text
client/              React/Vite/TypeScript frontend
server/              Express API, MongoDB models, uploads, reports
server/scripts/      deterministic Python analytics script
matlab/              safe sample dataset and MATLAB export helper
docs/                architecture, API, deployment, demo, CV notes
.github/workflows/   CI validation workflow
```

## Local Setup

Prerequisites:

- Node.js 20+
- npm 10+
- Python 3.10+
- MongoDB local instance or Docker

Install dependencies:

```bash
npm install --prefix server
npm install --prefix client
python3 -m venv server/.venv
server/.venv/bin/pip install -r server/requirements.txt
```

Create local environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

For local development, `server/.env` can use:

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

Do not commit real `.env` files or production secrets.

Start MongoDB with Docker:

```bash
docker compose up -d mongo
```

Validate the sample analytics script:

```bash
npm run python:check --prefix server
npm run analyze:sample --prefix server
```

Run the app:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

Local URLs:

- Frontend: `http://localhost:5173`
- API base URL: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

## API Quick Reference

Public routes:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

Authenticated routes require `Authorization: Bearer <jwt>`:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:projectId/files`
- `GET /api/projects/:projectId/files/:fileId/data`
- `POST /api/analysis/:fileId/run`
- `GET /api/analysis/:fileId`
- `GET /api/dashboard/summary`
- `GET /api/reports/:projectId/:analysisId`

More detail: [docs/api.md](docs/api.md).

## Sample Workflow

1. Start MongoDB, backend, and frontend.
2. Register or log in.
3. Create a project, for example `DC Motor Speed Control`.
4. Upload `matlab/sample_simulink_output.csv`.
5. Run Python analysis.
6. Review KPIs, chart views, anomaly points, recommendations, and PDF report.

## Validation Commands

```bash
npm install --prefix server
npm install --prefix client
npm run lint --prefix server
npm run python:check --prefix server
npm run analyze:sample --prefix server
npm run lint --prefix client
npm run build --prefix client
```

## Deployment Notes

Recommended portfolio deployment:

- Frontend: Vercel, root `client`, build `npm run build`, output `dist`.
- Backend: Render, root `server`, build `npm install && pip install -r requirements.txt`, start `npm start`.
- Database: MongoDB Atlas.

See [docs/deployment.md](docs/deployment.md).

## Remaining Honest Limitations

- Uploads are stored on the backend filesystem. For production, move uploaded files to object storage.
- The analytics script is deterministic and useful for demonstration, but it is not a domain-certified control-systems validator.
- The sample dataset is safe and synthetic/demo-oriented; real Simulink exports should be validated with domain-specific expectations.
- Authentication is portfolio-grade JWT auth, not a complete enterprise identity system.
