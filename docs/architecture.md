# Architecture

SmartSim Analytics is split into four practical layers:

1. Simulation export: MATLAB/Simulink produces CSV or JSON data outside the web app.
2. API and persistence: Express validates requests, stores metadata/results in MongoDB, and owns file upload boundaries.
3. Analytics: a deterministic Python script converts simulation rows into KPIs, anomalies, trend, stability, quality metadata, and recommendations.
4. Presentation: React renders the project workflow, charts, dashboard summaries, and report downloads.

## Main Flow

```text
Simulink/MATLAB -> CSV/JSON -> Multer upload -> preview validation -> MongoDB metadata
                                      |
                                      v
                         bounded Python child process
                                      |
                                      v
                         versioned JSON analytics result
                                      |
                                      v
                         dashboard, charts, PDF report
```

## Backend

- `src/index.js`: Express app, health endpoint, CORS, middleware, route mounting, startup.
- `src/config/db.js`: MongoDB connection with startup timeout.
- `src/models`: Mongoose models for users, projects, files, and analysis results.
- `src/routes`: REST routes protected by JWT where needed.
- `src/middleware/upload.js`: CSV/JSON upload filtering and size limits.
- `src/services/pythonAnalyzer.js`: safe child-process execution for Python analysis.
- `src/services/reportService.js`: PDF report generation with PDFKit.
- `scripts/analyze_simulation.py`: deterministic analytics implementation and JSON schema.

## Python Execution Boundary

The API does not execute arbitrary scripts or arbitrary paths. `pythonAnalyzer.js` always calls the fixed script at `server/scripts/analyze_simulation.py` and only passes resolved files from `server/uploads/` with allowed extensions.

Runtime limits are configurable:

- `PYTHON_ANALYSIS_TIMEOUT_MS=15000`
- `PYTHON_ANALYSIS_MAX_OUTPUT_BYTES=1048576`

The script writes one JSON object to stdout. Validation or analysis errors go to stderr and produce a non-zero exit code.

## Frontend

- `src/pages`: routed product surfaces for landing, auth, dashboard, projects, and project detail.
- `src/components/SignalChart.tsx`: resilient charting for target signals, input/output, and anomalies.
- `src/context/AuthContext.tsx`: local JWT session state.
- `src/services/api.ts`: Axios client with auth header and user-facing API errors.

## Data Model

- User: identity and password hash.
- SimulationProject: project metadata, system type, parameters, owner.
- SimulationFile: uploaded filename, safe storage path, columns, size, analysis status.
- AnalysisResult: selected KPIs, anomalies, trend, stability, recommendations, sample rows, raw schema payload.

## Local Runtime Dependencies

- MongoDB must be reachable for authenticated API routes.
- Python dependencies from `server/requirements.txt` must be installed before running analysis.
- `server/uploads/` is runtime storage and should not be committed except for `.gitkeep`.

## Deployment

See `docs/deployment.md` for Vercel, Render, and MongoDB Atlas setup.
