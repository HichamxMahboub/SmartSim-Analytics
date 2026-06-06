# SmartSim Analytics API

API Express pour gerer l'authentification, les projets de simulation, l'upload CSV/JSON, l'analyse Python et les rapports PDF.

## Installation locale

```bash
npm install
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm run dev
```

## Variables d'environnement

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartsim_analytics
JWT_SECRET=change_me_secure_secret
CLIENT_URL=http://localhost:5173
PYTHON_BIN=python3
```

Pour le developpement local avec virtualenv, vous pouvez mettre `PYTHON_BIN=.venv/bin/python` dans `.env`.

## Scripts

- `npm run dev`: serveur Express avec nodemon
- `npm start`: serveur production simple, utilise par Render
- `npm run lint`: validation syntaxique Node
- `npm run analyze:sample`: test direct du script Python sur l'exemple MATLAB

## Health check

```text
GET /api/health
```

Reponse attendue:

```json
{ "status": "ok", "service": "SmartSim Analytics API" }
```
