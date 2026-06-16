import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { SimulationRow } from "../types";

interface SignalChartProps {
  rows: SimulationRow[];
  mode: "signal" | "input-output" | "anomalies";
  anomalies?: Array<Record<string, number | string | null>>;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
}

function findTimeKey(keys: string[]): string | null {
  const lookup = new Map(keys.map(key => [key.toLowerCase(), key]));
  return lookup.get("time") ?? lookup.get("timestamp") ?? lookup.get("t") ?? lookup.get("seconds") ?? null;
}

function EmptyChart({ message }: { message: string }): JSX.Element {
  return (
    <div className="grid h-72 place-items-center rounded-lg border border-dashed border-slate-300 bg-white px-4 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

export function SignalChart({ rows, mode, anomalies = [] }: SignalChartProps): JSX.Element {
  if (!rows.length) {
    return <EmptyChart message="No signal data loaded" />;
  }

  const keys = Object.keys(rows[0]);
  const timeKey = findTimeKey(keys);
  const numericKeys = keys.filter(
    key => key !== timeKey && rows.some(row => numberValue(row[key]) !== null)
  );

  if (!numericKeys.length) {
    return <EmptyChart message="No numeric signals found in this dataset" />;
  }

  if (mode === "anomalies") {
    const points = anomalies
      .map(item => ({
        time: numberValue(item.time) ?? numberValue(item.row) ?? 0,
        value: numberValue(item.value),
        signal: String(item.signal ?? "signal")
      }))
      .filter(point => point.value !== null);

    if (!points.length) {
      return <EmptyChart message="No anomaly points detected for the latest analysis" />;
    }

    return (
      <div className="h-72 rounded-lg border border-slate-200 bg-white p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" name="time" tick={{ fontSize: 12 }} />
            <YAxis dataKey="value" name="value" tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="Anomalies" data={points} fill="#e11d48" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const chartRows = rows.map((row, index) => {
    const normalized: Record<string, number | null> = {
      __x: numberValue(timeKey ? row[timeKey] : null) ?? index
    };

    numericKeys.forEach(key => {
      normalized[key] = numberValue(row[key]);
    });

    return normalized;
  });
  const hasInputOutput = ["input", "output"].every(key => numericKeys.includes(key));
  const signalKey = numericKeys.includes("output") ? "output" : numericKeys[0];

  return (
    <div className="h-72 rounded-lg border border-slate-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartRows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="__x" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {mode === "input-output" && hasInputOutput ? (
            <>
              <Line type="monotone" dataKey="input" stroke="#0891b2" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="output" stroke="#16a34a" strokeWidth={2} dot={false} />
            </>
          ) : (
            <Line type="monotone" dataKey={signalKey} stroke="#0f172a" strokeWidth={2} dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
