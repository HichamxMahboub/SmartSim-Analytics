# MATLAB/Simulink Export Guide

SmartSim Analytics fonctionne sans licence MATLAB. Le dossier `matlab/` documente l'intégration prévue avec MATLAB/Simulink et fournit un CSV exemple utilisable immédiatement.

## Format attendu

Le backend accepte CSV ou JSON avec des colonnes numériques. Les colonnes recommandées:

```text
time,input,output,error,temperature,speed
```

- `time`: temps de simulation
- `input`: consigne ou entrée
- `output`: réponse du système
- `error`: écart entre consigne et sortie
- `temperature`, `speed`: signaux physiques complémentaires

## Depuis Simulink

1. Dans Simulink, activez le logging des signaux ou envoyez les signaux vers le workspace.
2. Exportez les données vers un `timeseries`, une `timetable` ou une structure.
3. Convertissez les signaux en table MATLAB.
4. Utilisez `writetable(data, "sample_simulink_output.csv")`.

Exemple conceptuel:

```matlab
simOut = sim("my_model");
time = simOut.logsout.get("output").Values.Time;
output = simOut.logsout.get("output").Values.Data;
input = simOut.logsout.get("input").Values.Data;
data = table(time, input, output);
writetable(data, "simulink_export.csv");
```

## Script fourni

`export_simulation.m` génère une réponse synthétique proche d'une simulation de contrôle moteur et écrit `sample_simulink_output.csv`.

```matlab
run("export_simulation.m")
```

Le CSV peut ensuite être importé dans le dashboard SmartSim Analytics.

