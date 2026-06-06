# SmartSim Analytics Client

Frontend React + Vite + TypeScript pour SmartSim Analytics.

## Installation locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Variables d'environnement

```env
VITE_API_URL=http://localhost:5000/api
```

En production Vercel, remplacez par l'URL Render du backend:

```env
VITE_API_URL=https://TON-BACKEND-RENDER.onrender.com/api
```

## Scripts

- `npm run dev`: serveur Vite
- `npm run build`: build TypeScript + Vite
- `npm run lint`: verification TypeScript
- `npm run preview`: preview du build Vite
