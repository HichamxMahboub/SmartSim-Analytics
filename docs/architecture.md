# Architecture

SmartSim Analytics est organisée en trois couches:

1. MATLAB/Simulink exporte des données de simulation vers CSV ou JSON.
2. Le backend Express stocke les projets, les fichiers et les résultats d'analyse dans MongoDB.
3. Le frontend React affiche les KPIs, graphiques, anomalies et rapports.

## Flux principal

```text
Simulink/MATLAB -> CSV/JSON -> Multer upload -> MongoDB metadata
                                |
                                v
                       Python analysis script
                                |
                                v
                       JSON result -> dashboard
                                |
                                v
                          PDF report
```

## Backend

- `src/models`: modèles MongoDB avec Mongoose
- `src/routes`: routes REST protégées par JWT
- `src/middleware/auth.js`: validation du token
- `src/services/pythonAnalyzer.js`: appel du script Python
- `src/services/reportService.js`: génération PDF avec PDFKit
- `scripts/analyze_simulation.py`: analyse data science

## Frontend

- `src/pages`: pages principales routées
- `src/components`: composants réutilisables
- `src/context/AuthContext.tsx`: état d'authentification
- `src/services/api.ts`: client Axios centralisé

## Modèle de données

- User: identité et mot de passe hashé
- SimulationProject: nom, description, type de système, paramètres, propriétaire
- SimulationFile: fichier uploadé, colonnes, statut d'analyse
- AnalysisResult: KPIs, anomalies, tendance, recommandations


## Deployment

Voir `docs/deployment.md` pour les etapes Vercel, Render et MongoDB Atlas.
