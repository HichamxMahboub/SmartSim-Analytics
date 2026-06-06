# SmartSim Analytics

SmartSim Analytics est une application full-stack demonstrative qui relie MATLAB/Simulink, Python et la stack MERN pour analyser des resultats de simulation. Elle permet d'importer des sorties CSV/JSON, de lancer une analyse Python, de visualiser les signaux dans un dashboard React et de generer un rapport PDF.

Le projet est concu pour un portfolio d'etudiant ingenieur. Il montre une integration realiste MATLAB/Simulink + Python analytics + application web, sans dependre d'une licence MATLAB pour fonctionner localement.

## Pourquoi ce projet existe

SmartSim Analytics cible les offres de stage/PFA qui demandent a la fois MATLAB/Simulink, IA ou analyse de donnees, Python et developpement web. Le projet montre une chaine complete: export simulation, ingestion web, analyse statistique, visualisation et rapport exploitable.

## Stack technique

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, Axios, Recharts
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, PDFKit
- Analyse: Python, pandas, numpy, scipy, scikit-learn disponible si besoin
- Simulation: dossier `matlab/` avec CSV exemple et script `export_simulation.m`
- Deploiement cible: Vercel pour le frontend, Render pour le backend, MongoDB Atlas pour la base

## Fonctionnalites principales

- Authentification register/login avec JWT
- CRUD de projets de simulation
- Upload de fichiers CSV ou JSON dans `server/uploads/`
- Analyse Python appelee depuis le backend Node.js
- KPIs: nombre de points, moyenne, minimum, maximum, ecart-type, depassements de seuil, stabilite
- Detection d'anomalies par z-score
- Dashboard responsive avec courbes de signaux, comparaison input/output et anomalies
- Generation et telechargement d'un rapport PDF
- Documentation API, architecture, deployment, script demo et description CV

## Architecture des dossiers

```text
client/              Frontend React/Vite/TypeScript
server/              API Express, MongoDB, uploads, analyse Python
server/scripts/      analyze_simulation.py
matlab/              Integration demonstrative MATLAB/Simulink
matlab/sample_simulink_output.csv
docs/                Architecture, API, deploiement, demo, CV
```

Voir aussi:

- [docs/architecture.md](docs/architecture.md)
- [docs/api.md](docs/api.md)
- [docs/deployment.md](docs/deployment.md)
- [docs/demo-script.md](docs/demo-script.md)
- [docs/cv-description.md](docs/cv-description.md)

## Installation locale

### Prerequis

- Node.js 20+
- npm 10+
- Python 3.10+
- MongoDB local ou Docker

### 1. Installer les dependances

```bash
cd smartsim-analytics
npm install --prefix server
npm install --prefix client
python3 -m venv server/.venv
source server/.venv/bin/activate
pip install -r server/requirements.txt
```

### 2. Lancer MongoDB

Docker Compose v2:

```bash
docker compose up -d mongo
```

Fallback Docker Compose v1:

```bash
docker-compose up -d mongo
```

### 3. Configurer les variables d'environnement

Backend:

```bash
cp server/.env.example server/.env
```

Frontend:

```bash
cp client/.env.example client/.env.local
```

### 4. Verifier le script Python

Avec le virtualenv local:

```bash
server/.venv/bin/python server/scripts/analyze_simulation.py matlab/sample_simulink_output.csv
```

Ou, si les dependances Python sont installees dans l'environnement actif:

```bash
python3 server/scripts/analyze_simulation.py matlab/sample_simulink_output.csv
```

### 5. Lancer l'application

Terminal backend:

```bash
npm run dev --prefix server
```

Terminal frontend:

```bash
npm run dev --prefix client
```

Frontend: `http://localhost:5173`
API: `http://localhost:5000/api`
Health check: `http://localhost:5000/api/health`

## Variables d'environnement

### Frontend Vite

```env
VITE_API_URL=http://localhost:5000/api
```

En production Vercel:

```env
VITE_API_URL=https://TON-BACKEND-RENDER.onrender.com/api
```

### Backend Express

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartsim_analytics
JWT_SECRET=change_me_secure_secret
CLIENT_URL=http://localhost:5173
PYTHON_BIN=python3
```

En production Render, utilisez MongoDB Atlas, un `JWT_SECRET` long et aleatoire, et l'URL Vercel dans `CLIENT_URL`.

## Deploiement production

Le deploiement recommande est:

- Frontend: Vercel, root directory `client`, build `npm run build`, output `dist`
- Backend: Render, root directory `server`, build `npm install && pip install -r requirements.txt`, start `npm start`
- Database: MongoDB Atlas avec une connection string `mongodb+srv://...`

Les etapes detaillees sont dans [docs/deployment.md](docs/deployment.md).

## Donnees MATLAB/Simulink

Un exemple pret a importer est disponible ici:

```text
matlab/sample_simulink_output.csv
```

Le dossier `matlab/` contient aussi `export_simulation.m` et `README_MATLAB.md`, qui expliquent comment exporter une simulation Simulink vers CSV. L'application fonctionne avec les fichiers CSV exemples sans licence MATLAB.

## Captures a ajouter

Ajoutez vos captures dans `docs/screenshots/` apres avoir lance l'application:

- `landing.png`: page d'accueil
- `dashboard.png`: dashboard KPIs et graphiques
- `project-detail.png`: detail projet avec analyse
- `pdf-report.png`: apercu du rapport genere

## Description CV courte

SmartSim Analytics — MERN / Python / MATLAB-Simulink  
Plateforme web d'analyse de resultats de simulation: import CSV/JSON depuis MATLAB-Simulink, traitement Python, detection d'anomalies, visualisation de signaux et generation de rapports PDF via un dashboard MERN.

## Note d'honnetete technique

Ce projet ne pretend pas embarquer Simulink dans le navigateur. Il demontre une integration professionnelle: Simulink exporte les resultats, l'application les importe, Python les analyse, puis MERN les expose via API et dashboard.
