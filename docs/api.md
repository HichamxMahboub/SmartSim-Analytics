# API

Base URL locale: `http://localhost:5000/api`

Toutes les routes sauf `/auth/register` et `/auth/login` nécessitent:

```http
Authorization: Bearer <jwt>
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

## Projets

### GET `/projects`

Retourne les projets de l'utilisateur connecté.

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

Détail projet avec fichiers et analyses.

### PUT `/projects/:id`

Met à jour un projet.

### DELETE `/projects/:id`

Supprime un projet et ses métadonnées associées.

## Fichiers

### POST `/projects/:projectId/files`

Form-data:

- `file`: fichier `.csv` ou `.json`

Le backend stocke le fichier dans `server/uploads/`.

### GET `/projects/:projectId/files/:fileId/data`

Retourne un aperçu parsé pour les graphiques.

## Analyse

### POST `/analysis/:fileId/run`

Lance `scripts/analyze_simulation.py` et sauvegarde le résultat.

### GET `/analysis/:fileId`

Retourne la dernière analyse d'un fichier.

## Dashboard

### GET `/dashboard/summary`

Retourne les statistiques globales de l'utilisateur connecté.

## Rapports

### GET `/reports/:projectId/:analysisId`

Génère et télécharge un PDF.

