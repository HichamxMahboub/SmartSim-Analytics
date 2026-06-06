# SmartSim Analytics API

API Express pour gérer l'authentification, les projets de simulation, l'upload de données, l'analyse Python et les rapports PDF.

## Installation

```bash
npm install
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm run dev
```

## Scripts

- `npm run dev`: serveur Express avec nodemon
- `npm start`: serveur en mode production simple
- `npm run lint`: validation syntaxique Node
- `npm run analyze:sample`: test direct du script Python sur l'exemple MATLAB

