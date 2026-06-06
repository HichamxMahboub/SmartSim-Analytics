# Delivery Checklist

SmartSim Analytics is ready as a portfolio/CV project.

## Local URLs

- Frontend: http://127.0.0.1:5173/ or http://localhost:5173/
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## Demo Credentials

After registering once, use:

- Email: student@example.com
- Password: password123

## Validated Commands

```bash
npm install --prefix server
npm install --prefix client
python3 -m venv server/.venv
server/.venv/bin/pip install -r server/requirements.txt
npm run analyze:sample --prefix server
npm run lint --prefix server
npm run lint --prefix client
npm run build --prefix client
npm audit --prefix server --audit-level=moderate
npm audit --prefix client --audit-level=moderate
```

## Validated Flow

- Register/login with JWT.
- Create a simulation project.
- Upload `matlab/sample_simulink_output.csv`.
- Run Python analysis.
- Generate a PDF report.
- View dashboard KPIs and signal charts.

## Packaging Notes

The delivery ZIP excludes generated folders and local secrets:

- `node_modules/`
- `client/dist/`
- `server/.venv/`
- `server/.env`
- runtime upload files

Recreate dependencies with the install commands in the root README.
