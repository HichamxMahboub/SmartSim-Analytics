# SmartSim Analytics

SmartSim Analytics est une application full-stack démonstrative qui relie MATLAB/Simulink, Python et la stack MERN pour analyser des résultats de simulation. Elle permet d'importer des sorties CSV/JSON, de lancer une analyse Python, de visualiser les signaux dans un dashboard React et de générer un rapport PDF.

Le projet est conçu pour un portfolio d'étudiant ingénieur: il montre une intégration réaliste MATLAB/Simulink + Python analytics + application web, sans dépendre d'une licence MATLAB pour fonctionner localement.

## Stack

- Frontend: React.js, TypeScript, Tailwind CSS, React Router, Axios, Recharts
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, PDFKit
- Python: pandas, numpy, scipy/scikit-learn optionnel, détection d'anomalies par z-score, KPIs
- MATLAB/Simulink: script d'export et exemple CSV dans `matlab/`

## Fonctionnalités

- Authentification register/login par JWT
- CRUD de projets de simulation
- Upload de fichiers CSV ou JSON dans `server/uploads/`
- Analyse Python appelée depuis le backend Node.js
- KPIs: nombre de points, moyenne, minimum, maximum, écart-type, dépassements de seuil, stabilité
- Détection d'anomalies par z-score
- Dashboard responsive avec courbes de signaux, comparaison input/output et anomalies
- Génération et téléchargement d'un rapport PDF
- Documentation API, architecture, script de démonstration et description CV

## Installation

### Prérequis

- Node.js 20+
- npm 10+
- Python 3.10+
- MongoDB local ou Docker

### 1. Cloner et installer

```bash
cd smartsim-analytics
npm install --prefix server
npm install --prefix client
python3 -m venv server/.venv
source server/.venv/bin/activate
pip install -r server/requirements.txt
```

### 2. Lancer MongoDB

Avec Docker Compose v2:

```bash
docker compose up -d mongo
```

Fallback Docker Compose v1:

```bash
docker-compose up -d mongo
```

Ou utilisez une instance MongoDB locale et adaptez `server/.env`.

### 3. Configurer le backend

```bash
cp server/.env.example server/.env
npm run analyze:sample --prefix server
npm run dev --prefix server
```

### 4. Lancer le frontend

```bash
npm run dev --prefix client
```

Frontend: `http://localhost:5173`  
API: `http://localhost:5000/api`

## Données MATLAB/Simulink

Un exemple prêt à importer est disponible ici:

```text
matlab/sample_simulink_output.csv
```

Le dossier `matlab/` contient aussi `export_simulation.m` et `README_MATLAB.md`, qui expliquent comment exporter une simulation Simulink vers CSV.

## Architecture

```text
client/              React dashboard
server/              API Express, MongoDB, uploads, analyse Python
server/scripts/      analyze_simulation.py
matlab/              intégration démonstrative MATLAB/Simulink
docs/                architecture, API, démo, description CV
```

Voir [docs/architecture.md](docs/architecture.md) pour les détails. La checklist finale de livraison est dans [docs/delivery-checklist.md](docs/delivery-checklist.md).

## Captures à ajouter

Ajoutez vos captures dans `docs/screenshots/` après avoir lancé l'application:

- `landing.png`: page d'accueil
- `dashboard.png`: dashboard KPIs et graphiques
- `project-detail.png`: détail projet avec analyse
- `pdf-report.png`: aperçu du rapport généré

## Description CV / Portfolio

SmartSim Analytics — MERN / Python / MATLAB-Simulink  
Plateforme web d'analyse de résultats de simulation: import CSV/JSON depuis MATLAB-Simulink, traitement Python, détection d'anomalies, visualisation de signaux et génération de rapports PDF via un dashboard MERN.

## Note d'honnêteté technique

Ce projet ne prétend pas embarquer Simulink dans le navigateur. Il démontre une intégration professionnelle: Simulink exporte les résultats, l'application les importe, Python les analyse, puis MERN les expose via API et dashboard.

