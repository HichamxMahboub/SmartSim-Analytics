#!/usr/bin/env python3
"""Deterministic simulation analytics for SmartSim Analytics.

Input format:
- CSV: header row with one row per simulation sample.
- JSON: an array of row objects, or an object with a `data` array of row objects.
- Numeric signal columns are detected by coercing values to numbers.
- A time column is optional and is detected from `time`, `timestamp`, `t`, or `seconds`.

Output format:
- Writes one JSON object to stdout.
- Validation or analysis failures are written to stderr and return a non-zero exit code.
- The top-level schema is versioned with `schema_version`.
"""

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

MAX_SAMPLE_ROWS = 120
ANOMALY_LIMIT = 100
ANOMALY_PER_SIGNAL_LIMIT = 50
ANOMALY_Z_SCORE = 2.5


def load_dataframe(file_path: str) -> pd.DataFrame:
    path = Path(file_path)
    if not path.exists() or not path.is_file():
        raise ValueError("Simulation file does not exist.")
    if path.stat().st_size == 0:
        raise ValueError("Simulation file is empty.")

    ext = path.suffix.lower()
    if ext == ".json":
        parsed = json.loads(path.read_text(encoding="utf-8"))
        rows = parsed if isinstance(parsed, list) else parsed.get("data") if isinstance(parsed, dict) else None
        if not isinstance(rows, list):
            raise ValueError("JSON input must be an array or an object with a data array.")
        if any(not isinstance(row, dict) for row in rows):
            raise ValueError("JSON input rows must be objects with named signal fields.")
        return pd.DataFrame(rows)

    if ext == ".csv":
        return pd.read_csv(path)

    raise ValueError("Unsupported file type. Use CSV or JSON.")


def clean_value(value: Any) -> Any:
    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass

    if isinstance(value, np.generic):
        value = value.item()

    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return round(value, 6)

    if isinstance(value, int):
        return int(value)

    return value


def clean_record(record: Dict[str, Any]) -> Dict[str, Any]:
    return {str(key): clean_value(value) for key, value in record.items()}


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        raise ValueError("Simulation file is empty.")

    df = df.copy()
    df.columns = [str(column).strip() for column in df.columns]
    if any(not column for column in df.columns):
        raise ValueError("Simulation columns must have names.")

    return df.replace([np.inf, -np.inf], np.nan)


def detect_numeric_columns(df: pd.DataFrame) -> List[str]:
    numeric_columns: List[str] = []

    for column in df.columns:
        converted = pd.to_numeric(df[column], errors="coerce")
        if converted.notna().any():
            df[column] = converted
            numeric_columns.append(column)

    return numeric_columns


def find_time_column(columns: List[str]) -> str | None:
    lookup = {column.lower(): column for column in columns}
    for candidate in ["time", "timestamp", "t", "seconds"]:
        if candidate in lookup:
            return lookup[candidate]
    return None


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
        anomaly_indexes = np.where(np.abs(z_scores.fillna(0)) >= ANOMALY_Z_SCORE)[0]

        for idx in anomaly_indexes[:ANOMALY_PER_SIGNAL_LIMIT]:
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

    return sorted(anomalies, key=lambda item: abs(item["z_score"] or 0), reverse=True)[:ANOMALY_LIMIT]


def estimate_trend(df: pd.DataFrame, target_column: str, time_column: str | None) -> str:
    series = pd.to_numeric(df[target_column], errors="coerce")
    work = pd.DataFrame({"y": series})

    if time_column and time_column in df.columns:
        work["x"] = pd.to_numeric(df[time_column], errors="coerce")
    else:
        work["x"] = pd.Series(range(len(df)), index=df.index)

    work = work.dropna()
    if len(work) < 3:
        return "insufficient-data"

    x = work["x"].to_numpy(dtype=float)
    y = work["y"].to_numpy(dtype=float)
    if np.allclose(x, x[0]):
        x = np.arange(len(y), dtype=float)

    slope = np.polyfit(x, y, 1)[0]
    amplitude = max(abs(float(np.max(y) - np.min(y))), 1e-9)
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


def quality_summary(df: pd.DataFrame, numeric_columns: List[str], time_column: str | None) -> Dict[str, Any]:
    return {
        "time_column": time_column,
        "numeric_columns": numeric_columns,
        "missing_values": {column: int(df[column].isna().sum()) for column in df.columns},
        "sample_rows": int(min(len(df), MAX_SAMPLE_ROWS)),
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
    df = normalize_dataframe(load_dataframe(file_path))
    numeric_columns = detect_numeric_columns(df)
    if not numeric_columns:
        raise ValueError("No numeric simulation signals found.")

    time_column = find_time_column(numeric_columns)
    signal_candidates = [column for column in numeric_columns if column != time_column]
    if not signal_candidates:
        raise ValueError("At least one numeric signal column beyond time is required.")

    target_column = "output" if "output" in signal_candidates else signal_candidates[0]
    kpis = numeric_kpis(df, numeric_columns)
    anomalies = detect_anomalies(df, numeric_columns, time_column)
    trend = estimate_trend(df, target_column, time_column)
    stability = stability_metrics(df, target_column)
    target_kpis = kpis.get(target_column, {})
    sample = [clean_record(record) for record in df.head(MAX_SAMPLE_ROWS).to_dict(orient="records")]

    return {
        "schema_version": 1,
        "file": Path(file_path).name,
        "input_format": {
            "accepted_extensions": [".csv", ".json"],
            "json_shape": "records array or {data: records[]}",
        },
        "columns": list(df.columns),
        "row_count": int(len(df)),
        "points_count": target_kpis.get("points", int(len(df))),
        "target_signal": target_column,
        "mean": target_kpis.get("mean"),
        "min": target_kpis.get("min"),
        "max": target_kpis.get("max"),
        "std": target_kpis.get("std"),
        "kpis": kpis,
        "anomalies": anomalies,
        "trend": trend,
        "stability": stability,
        "quality": quality_summary(df, numeric_columns, time_column),
        "recommendations": recommendations(anomalies, trend, stability),
        "sample": sample,
    }


def main() -> None:
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: analyze_simulation.py <file_path>"}), file=sys.stderr)
        sys.exit(2)

    try:
        result = analyze(sys.argv[1])
        print(json.dumps(result, default=clean_value, separators=(",", ":")))
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
