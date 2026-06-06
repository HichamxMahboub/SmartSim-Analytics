# Demo Script

1. Lancer MongoDB:

```bash
docker compose up -d mongo
```

2. Lancer le backend:

```bash
npm run dev --prefix server
```

3. Lancer le frontend:

```bash
npm run dev --prefix client
```

4. Créer un compte puis se connecter.

5. Créer un projet:

- Nom: `DC Motor Speed Control`
- Type: `Control System`
- Paramètres: `PID controller, Ts=0.01s`

6. Importer:

```text
matlab/sample_simulink_output.csv
```

7. Lancer l'analyse Python.

8. Montrer:

- KPIs
- signal output vs time
- comparaison input/output
- points anormaux détectés
- tendance générale
- rapport PDF

9. Expliquer l'intégration:

Simulink produit les données, Python les analyse, MongoDB garde l'historique, React rend l'analyse exploitable.

