# Deployment Guide

Ce guide prepare SmartSim Analytics pour un deploiement production demonstratif avec Vercel, Render et MongoDB Atlas.

## Architecture cible

- Frontend React/Vite sur Vercel
- Backend Express sur Render
- Base de donnees MongoDB Atlas
- Analyse Python executee par le backend Render avec `PYTHON_BIN=python3`

## 1. MongoDB Atlas

1. Creer un compte MongoDB Atlas.
2. Creer un cluster gratuit ou dedie.
3. Creer un database user avec un mot de passe fort.
4. Dans Network Access, autoriser temporairement `0.0.0.0/0` pour tester, ou configurer des IPs plus strictes en production.
5. Copier la connection string.
6. Remplacer `USER`, `PASSWORD` et le nom de database:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/smartsim_analytics
```

## 2. Backend Render

### Service

- Type: Web Service
- Root directory: `server`
- Runtime: Node.js
- Build command:

```bash
npm install && pip install -r requirements.txt
```

- Start command:

```bash
npm start
```

Le fichier `server/Procfile` contient aussi:

```text
web: npm start
```

### Variables d'environnement Render

```env
PORT=5000
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/smartsim_analytics
JWT_SECRET=long_random_secret
CLIENT_URL=https://TON-FRONTEND-VERCEL.vercel.app
PYTHON_BIN=python3
```

### Verifications backend

Apres deploiement Render:

```text
https://TON-BACKEND-RENDER.onrender.com/api/health
```

La reponse attendue est:

```json
{ "status": "ok", "service": "SmartSim Analytics API" }
```

## 3. Frontend Vercel

### Project settings

- Framework preset: Vite
- Root directory: `client`
- Build command:

```bash
npm run build
```

- Output directory:

```text
dist
```

### Variable d'environnement Vercel

```env
VITE_API_URL=https://TON-BACKEND-RENDER.onrender.com/api
```

Redepoyer le frontend apres avoir ajoute ou modifie `VITE_API_URL`, car les variables Vite sont injectees au build.

## 4. Ordre recommande

1. Creer MongoDB Atlas et recuperer `MONGO_URI`.
2. Deployer le backend sur Render avec les variables Render.
3. Tester `/api/health` sur Render.
4. Deployer le frontend sur Vercel avec `VITE_API_URL` pointant vers Render.
5. Mettre a jour `CLIENT_URL` sur Render avec l'URL Vercel finale.
6. Redeployer le backend si `CLIENT_URL` a change.
7. Tester register/login, creation projet, upload CSV, analyse Python et rapport PDF.

## 5. Notes production

- Ne jamais commiter `.env`, `.env.local` ou des secrets.
- Garder `JWT_SECRET` long, aleatoire et different de la valeur d'exemple.
- Les uploads Render sont stockes localement et peuvent etre ephemeres selon le plan. Pour une production reelle, remplacer `server/uploads` par un stockage objet comme S3, Cloudinary ou équivalent.
- L'integration MATLAB/Simulink est demonstrative: Simulink exporte les donnees, SmartSim Analytics les importe et les analyse.
