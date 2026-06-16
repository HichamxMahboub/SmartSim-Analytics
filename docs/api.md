# API Reference

Base URL for local development: `http://localhost:5000/api`

All routes except `/health`, `/auth/register`, and `/auth/login` require:

```http
Authorization: Bearer <jwt>
```

Error responses use this shape:

```json
{
  "message": "Validation error.",
  "errors": [{ "path": "email", "message": "Invalid email" }]
}
```

In non-production mode, error responses may also include `details` for debugging. Do not expose stack traces in production.

## Health

### GET `/health`

Returns API runtime status and MongoDB connection state.

```json
{
  "status": "ok",
  "service": "SmartSim Analytics API",
  "uptimeSeconds": 42,
  "timestamp": "2026-06-16T12:00:00.000Z",
  "database": "connected"
}
```

## Auth

### POST `/auth/register`

```json
{
  "name": "Student Engineer",
  "email": "student@example.com",
  "password": "password123"
}
```

### POST `/auth/login`

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

Successful auth responses include:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "mongo-user-id",
    "name": "Student Engineer",
    "email": "student@example.com"
  }
}
```

## Projects

### GET `/projects`

Returns projects owned by the authenticated user.

### POST `/projects`

```json
{
  "name": "DC Motor Speed Control",
  "description": "Closed-loop Simulink simulation for speed regulation.",
  "systemType": "Control System",
  "simulationDate": "2026-06-05",
  "parameters": {
    "samplingTime": "0.01s",
    "controller": "PID"
  }
}
```

### GET `/projects/:id`

Returns project metadata, uploaded files, and saved analyses.

### PUT `/projects/:id`

Updates project metadata.

### DELETE `/projects/:id`

Deletes the project and related metadata.

## Files

### POST `/projects/:projectId/files`

Multipart form-data:

- `file`: `.csv` or `.json` simulation dataset, maximum 10 MB.

The backend stores runtime uploads in `server/uploads/`, validates the extension, parses a small preview, and rejects empty or malformed datasets.

Accepted input formats:

- CSV with a header row and one simulation sample per row.
- JSON array of row objects.
- JSON object with a `data` array of row objects.

### GET `/projects/:projectId/files/:fileId/data`

Returns parsed rows for charting.

```json
{
  "rows": [{ "time": 0, "input": 100, "output": 0 }],
  "columns": ["time", "input", "output"]
}
```

## Analysis

### POST `/analysis/:fileId/run`

Runs `server/scripts/analyze_simulation.py` against an uploaded CSV/JSON file and stores the result.

Safety controls:

- Only files under `server/uploads/` can be analyzed through the API.
- Allowed extensions: `.csv`, `.json`.
- Timeout: `PYTHON_ANALYSIS_TIMEOUT_MS`, default `15000`.
- Output cap: `PYTHON_ANALYSIS_MAX_OUTPUT_BYTES`, default `1048576`.

The Python output is versioned. The stored `raw` payload contains fields such as:

```json
{
  "schema_version": 1,
  "file": "sample_simulink_output.csv",
  "columns": ["time", "input", "output"],
  "row_count": 121,
  "target_signal": "output",
  "kpis": {
    "output": {
      "points": 121,
      "mean": 79.028595,
      "min": 0,
      "max": 105.64,
      "std": 24.373724,
      "threshold_exceedances": 7
    }
  },
  "anomalies": [{ "row": 72, "time": 7.2, "signal": "temperature", "value": 40.57, "z_score": 5.735979 }],
  "trend": "increasing",
  "stability": { "status": "moderate-variation", "coefficient_of_variation": 0.308417 },
  "recommendations": ["Review anomaly windows and compare them with controller saturation or disturbance events."],
  "sample": [{ "time": 0, "input": 100, "output": 0 }]
}
```

### GET `/analysis/:fileId`

Returns the latest saved analysis for a file.

## Dashboard

### GET `/dashboard/summary`

Returns aggregate counts and recent analyses for the authenticated user.

## Reports

### GET `/reports/:projectId/:analysisId`

Generates and downloads a PDF report for a saved analysis.
