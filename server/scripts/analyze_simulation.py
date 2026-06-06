#!/usr/bin/env python3
import json
import math
import os
import sys
from pathlib import Path
from typing import Any, Dict, List

try:
    import numpy as np
    import pandas as pd
except ModuleNotFoundError:
    venv_python = Path(__file__).resolve().parents[1] / ".venv" / "bin" / "python"
    if venv_python.exists() and not os.environ.get("SMARTSIM_VENV_REEXEC"):
        os.environ["SMARTSIM_VENV_REEXEC"] = "1"
        os.execv(str(venv_python), [str(venv_python), *sys.argv])
    raise


def load_dataframe(file_path: str) -> pd.DataFrame:
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".json":
        return pd.read_json(file_path)

    if ext == ".csv":
        return pd.read_csv(file_path)

    raise ValueError("Unsupported file type. Use CSV or JSON.")


def clean_value(value: Any) -> Any:
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        if math.isnan(float(value)) or math.isinf(float(value)):
            return None
        return round(float(value), 6)
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return round(value, 6)
    return value


def numeric_kpis(df: pd.DataFrame, numeric_columns: List[str]) -> Dict[str, Dict[str, Any]]:
    result: Dict[str, Dict[str, Any]] = {}

    for column in numeric_columns:
        series = pd.to_numeric(df[column], errors="coerce").dropna()
        if series.empty:
            continue

        mean = series.mean()
        std = series.std(ddof=0)
        upper_threshold = mean + 2 * std
        lower_threshold = mean - 2 * std
        threshold_exceedances = int(((series > upper_threshold) | (series < lower_threshold)).sum())

        result[column] = {
            "points": int(series.count()),
            "mean": clean_value(mean),
            "max": clean_value(series.max()),
            "min": clean_value(series.min()),
            "std": clean_value(std),
            "threshold_exceedances": threshold_exceedances,
        }

    return result


def detect_anomalies(df: pd.DataFrame, numeric_columns: List[str], time_column: str | None) -> List[Dict[str, Any]]:
    anomalies: List[Dict[str, Any]] = []

    for column in numeric_columns:
        if column == time_column:
            continue

        series = pd.to_numeric(df[column], errors="coerce")
        std = series.std(ddof=0)
        if not std or np.isnan(std):
            continue

        z_scores = (series - series.mean()) / std
        anomaly_indexes = np.where(np.abs(z_scores) >= 2.5)[0]

        for idx in anomaly_indexes[:50]:
            time_value = df.iloc[idx][time_column] if time_column else idx
            anomalies.append(
                {
                    "row": int(idx),
                    "time": clean_value(time_value),
                    "signal": column,
                    "value": clean_value(df.iloc[idx][column]),
                    "z_score": clean_value(z_scores.iloc[idx]),
                }
            )

    return sorted(anomalies, key=lambda item: abs(item["z_score"] or 0), reverse=True)[:100]


def estimate_trend(df: pd.DataFrame, target_column: str, time_column: str | None) -> str:
    series = pd.to_numeric(df[target_column], errors="coerce").dropna()

    if len(series) < 3:
        return "insufficient-data"

    if time_column and time_column in df.columns:
        x = pd.to_numeric(df.loc[series.index, time_column], errors="coerce").ffill().fillna(0)
    else:
        x = pd.Series(range(len(series)))

    slope = np.polyfit(x, series, 1)[0]
    amplitude = max(abs(series.max() - series.min()), 1e-9)
    normalized_slope = slope / amplitude

    if normalized_slope > 0.01:
        return "increasing"
    if normalized_slope < -0.01:
        return "decreasing"
    return "stable"


def stability_metrics(df: pd.DataFrame, target_column: str) -> Dict[str, Any]:
    series = pd.to_numeric(df[target_column], errors="coerce").dropna()
    if series.empty:
        return {"status": "unknown", "coefficient_of_variation": None}

    mean_abs = abs(series.mean()) or 1e-9
    cv = float(series.std(ddof=0) / mean_abs)
    status = "stable" if cv < 0.15 else "moderate-variation" if cv < 0.35 else "unstable"

    return {
        "status": status,
        "coefficient_of_variation": clean_value(cv),
    }


def recommendations(anomalies: List[Dict[str, Any]], trend: str, stability: Dict[str, Any]) -> List[str]:
    output = []

    if anomalies:
        output.append("Review anomaly windows and compare them with controller saturation or disturbance events.")
    if trend == "increasing":
        output.append("Monitor the rising trend and validate whether the system reaches a steady state.")
    if trend == "decreasing":
        output.append("Check for damping, losses, or control action that may explain the decreasing response.")
    if stability.get("status") == "unstable":
        output.append("Tune controller parameters or inspect model assumptions because the target signal is highly variable.")
    if not output:
        output.append("Simulation appears stable under the current statistical checks.")

    return output


def analyze(file_path: str) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    if df.empty:
        raise ValueError("Simulation file is empty.")

    df = df.replace([np.inf, -np.inf], np.nan)
    numeric_columns = [column for column in df.columns if pd.api.types.is_numeric_dtype(pd.to_numeric(df[column], errors="coerce"))]
    if not numeric_columns:
        raise ValueError("No numeric simulation signals found.")

    time_column = "time" if "time" in df.columns else None
    signal_candidates = [column for column in numeric_columns if column != time_column]
    target_column = "output" if "output" in signal_candidates else signal_candidates[0]

    kpis = numeric_kpis(df, numeric_columns)
    anomalies = detect_anomalies(df, numeric_columns, time_column)
    trend = estimate_trend(df, target_column, time_column)
    stability = stability_metrics(df, target_column)
    target_kpis = kpis.get(target_column, {})

    return {
        "file": os.path.basename(file_path),
        "columns": list(df.columns),
        "row_count": int(len(df)),
        "points_count": target_kpis.get("points", int(len(df))),
        "mean": target_kpis.get("mean"),
        "min": target_kpis.get("min"),
        "max": target_kpis.get("max"),
        "std": target_kpis.get("std"),
        "target_signal": target_column,
        "kpis": kpis,
        "anomalies": anomalies,
        "trend": trend,
        "stability": stability,
        "recommendations": recommendations(anomalies, trend, stability),
        "sample": df.head(120).replace({np.nan: None}).to_dict(orient="records"),
    }


def main() -> None:
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: analyze_simulation.py <file_path>"}), file=sys.stderr)
        sys.exit(2)

    try:
        result = analyze(sys.argv[1])
        print(json.dumps(result, default=clean_value))
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

