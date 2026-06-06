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
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function SignalChart({ rows, mode, anomalies = [] }: SignalChartProps): JSX.Element {
  const hasInputOutput = rows.some(row => numberValue(row.input) !== null && numberValue(row.output) !== null);

  if (!rows.length) {
    return (
      <div className="grid h-72 place-items-center rounded-lg border border-dashed border-slate-300 bg-white text-sm text-slate-500">
        No signal data loaded
      </div>
    );
  }

  if (mode === "anomalies") {
    const points = anomalies.map(item => ({
      time: numberValue(item.time) ?? Number(item.row ?? 0),
      value: numberValue(item.value),
      signal: String(item.signal ?? "signal")
    }));

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

  const signalKey = rows[0].output !== undefined ? "output" : Object.keys(rows[0]).find(key => key !== "time") ?? "signal";

  return (
    <div className="h-72 rounded-lg border border-slate-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
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

