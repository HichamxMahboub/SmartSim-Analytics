import { useEffect, useState } from "react";
import { AlertTriangle, Database, FolderKanban, LineChart } from "lucide-react";

import { StatCard } from "../components/StatCard";
import { api, getApiError } from "../services/api";
import type { DashboardSummary } from "../types";

export function DashboardPage(): JSX.Element {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    api
      .get<DashboardSummary>("/dashboard/summary")
      .then(({ data }) => {
        if (!ignore) {
          setSummary(data);
        }
      })
      .catch(apiError => {
        if (!ignore) {
          setError(getApiError(apiError));
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Simulation projects, uploaded datasets and latest Python analyses.</p>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Projects" value={summary?.projectCount ?? 0} icon={FolderKanban} tone="cyan" />
        <StatCard label="Files" value={summary?.fileCount ?? 0} icon={Database} tone="emerald" />
        <StatCard label="Analyses" value={summary?.analysisCount ?? 0} icon={LineChart} tone="amber" />
        <StatCard label="Anomalies" value={summary?.anomalyCount ?? 0} icon={AlertTriangle} tone="rose" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-950">Latest analyses</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <p className="px-4 py-8 text-sm text-slate-500">Loading analyses...</p>
          ) : summary?.latestAnalyses.length ? (
            summary.latestAnalyses.map(analysis => (
              <article key={analysis._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-950">
                    {analysis.raw?.target_signal ?? "signal"} - {analysis.trend}
                  </p>
                  <p className="text-sm text-slate-500">
                    {analysis.anomalies.length} anomalies - {new Date(analysis.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {String(analysis.stability.status ?? "unknown")}
                </span>
              </article>
            ))
          ) : (
            <p className="px-4 py-8 text-sm text-slate-500">No analysis yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
