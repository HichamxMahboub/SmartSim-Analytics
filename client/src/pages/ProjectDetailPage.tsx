import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Database, Download, FileText, FileUp, Play, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";

import { SignalChart } from "../components/SignalChart";
import { api, getApiError } from "../services/api";
import type { AnalysisResult, ProjectDetailResponse, SimulationFile, SimulationRow } from "../types";

type ChartMode = "signal" | "input-output" | "anomalies";
type ActionState = "idle" | "uploading" | "analyzing" | "refreshing";

const chartModes: Array<{ mode: ChartMode; label: string }> = [
  { mode: "signal", label: "Signal" },
  { mode: "input-output", label: "Input / output" },
  { mode: "anomalies", label: "Anomalies" }
];

const statusClasses: Record<SimulationFile["status"], string> = {
  uploaded: "bg-amber-50 text-amber-700",
  analyzed: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700"
};

function formatBytes(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function metricValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return typeof value === "number" ? Number(value.toFixed(4)).toString() : String(value);
}

function analysisForFile(analyses: AnalysisResult[], fileId: string): AnalysisResult | null {
  return analyses.find(analysis => String(analysis.file) === fileId) ?? null;
}

export function ProjectDetailPage(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const [detail, setDetail] = useState<ProjectDetailResponse | null>(null);
  const [rows, setRows] = useState<SimulationRow[]>([]);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [chartMode, setChartMode] = useState<ChartMode>("signal");
  const [error, setError] = useState("");
  const [detailLoading, setDetailLoading] = useState(true);
  const [action, setAction] = useState<ActionState>("idle");

  const selectedFile = useMemo(
    () => detail?.files.find(file => file._id === selectedFileId) ?? null,
    [detail, selectedFileId]
  );
  const selectedAnalysis = useMemo<AnalysisResult | null>(() => {
    if (!detail) {
      return null;
    }

    return selectedFileId ? analysisForFile(detail.analyses, selectedFileId) : detail.analyses[0] ?? null;
  }, [detail, selectedFileId]);
  const targetSignal = selectedAnalysis?.raw?.target_signal ?? Object.keys(selectedAnalysis?.kpis ?? {})[0] ?? "output";
  const targetKpis = selectedAnalysis?.kpis?.[targetSignal] ?? null;
  const busy = action !== "idle";

  const loadDetail = useCallback(
    async (preferredFileId?: string): Promise<void> => {
      if (!projectId) {
        return;
      }

      const { data } = await api.get<ProjectDetailResponse>(`/projects/${projectId}`);
      setDetail(data);
      setSelectedFileId(current => {
        const fallback = data.files[0]?._id ?? "";
        const next = preferredFileId ?? current;
        return next && data.files.some(file => file._id === next) ? next : fallback;
      });
    },
    [projectId]
  );

  const loadRows = useCallback(
    async (fileId: string): Promise<void> => {
      if (!projectId || !fileId) {
        setRows([]);
        return;
      }

      const { data } = await api.get<{ rows: SimulationRow[] }>(`/projects/${projectId}/files/${fileId}/data`);
      setRows(data.rows);
    },
    [projectId]
  );

  useEffect(() => {
    let ignore = false;

    setDetailLoading(true);
    setError("");
    loadDetail()
      .catch(apiError => {
        if (!ignore) {
          setError(getApiError(apiError));
        }
      })
      .finally(() => {
        if (!ignore) {
          setDetailLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [loadDetail]);

  useEffect(() => {
    let ignore = false;

    loadRows(selectedFileId)
      .catch(apiError => {
        if (!ignore) {
          setError(getApiError(apiError));
        }
      });

    return () => {
      ignore = true;
    };
  }, [loadRows, selectedFileId]);

  async function refreshProject(): Promise<void> {
    setAction("refreshing");
    setError("");

    try {
      await loadDetail(selectedFileId || undefined);
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setAction("idle");
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file || !projectId) {
      return;
    }

    setAction("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<{ file: SimulationFile }>(`/projects/${projectId}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSelectedFileId(data.file._id);
      await loadDetail(data.file._id);
      await loadRows(data.file._id);
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setAction("idle");
      event.target.value = "";
    }
  }

  async function runAnalysis(): Promise<void> {
    if (!selectedFileId) {
      setError("Upload or select a simulation file first.");
      return;
    }

    setAction("analyzing");
    setError("");

    try {
      await api.post(`/analysis/${selectedFileId}/run`);
      await loadDetail(selectedFileId);
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setAction("idle");
    }
  }

  async function downloadReport(): Promise<void> {
    if (!projectId || !selectedAnalysis) {
      return;
    }

    const response = await api.get(`/reports/${projectId}/${selectedAnalysis._id}`, {
      responseType: "blob"
    });
    const blobUrl = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${detail?.project.name ?? "simulation"}-report.pdf`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  }

  if (detailLoading) {
    return <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">Loading project...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{detail?.project.name ?? "Project"}</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{detail?.project.description}</p>
        </div>
        <button
          type="button"
          onClick={() => refreshProject()}
          disabled={busy}
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} />
          {action === "refreshing" ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <span>{error}</span>
        </p>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-wrap items-center gap-3">
            <label className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              <FileUp size={16} />
              {action === "uploading" ? "Uploading..." : "Upload CSV/JSON"}
              <input className="sr-only" type="file" accept=".csv,.json" disabled={busy} onChange={handleUpload} />
            </label>
            <select
              className="focus-ring min-w-60 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={selectedFileId}
              onChange={event => setSelectedFileId(event.target.value)}
              disabled={busy || !detail?.files.length}
            >
              <option value="">Select file</option>
              {detail?.files.map(file => (
                <option key={file._id} value={file._id}>
                  {file.originalName} - {file.status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={runAnalysis}
              disabled={busy || !selectedFileId}
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play size={16} />
              {action === "analyzing" ? "Analyzing..." : "Run analysis"}
            </button>
            <button
              type="button"
              onClick={() => downloadReport().catch(apiError => setError(getApiError(apiError)))}
              disabled={!selectedAnalysis || busy}
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={16} />
              PDF report
            </button>
          </div>

          <div className="rounded-lg bg-slate-50 px-4 py-3">
            {selectedFile ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate font-medium text-slate-950">{selectedFile.originalName}</span>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClasses[selectedFile.status]}`}>
                    {selectedFile.status}
                  </span>
                </div>
                <p className="text-slate-500">
                  {formatBytes(selectedFile.size)} - {selectedFile.columns.length} columns
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No file selected</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Database size={16} />
            Target signal
          </div>
          <p className="mt-2 truncate text-2xl font-semibold text-slate-950">{selectedAnalysis ? targetSignal : "pending"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CheckCircle2 size={16} />
            Stability
          </div>
          <p className="mt-2 truncate text-2xl font-semibold text-slate-950">
            {String(selectedAnalysis?.stability.status ?? "pending")}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <AlertCircle size={16} />
            Anomalies
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{selectedAnalysis?.anomalies.length ?? 0}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FileText size={16} />
            Rows
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {selectedAnalysis?.raw?.row_count ?? rows.length ?? 0}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Signals</h2>
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            {chartModes.map(item => (
              <button
                key={item.mode}
                type="button"
                onClick={() => setChartMode(item.mode)}
                className={[
                  "rounded-md px-3 py-2 text-sm font-medium",
                  chartMode === item.mode ? "bg-slate-950 text-white" : "text-slate-600"
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <SignalChart rows={rows} mode={chartMode} anomalies={selectedAnalysis?.anomalies ?? []} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-950">KPIs</h2>
          </div>
          {targetKpis ? (
            <dl className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(targetKpis).map(([metric, value]) => (
                <div key={metric} className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="text-xs font-medium uppercase text-slate-500">{metric.replace(/_/g, " ")}</dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-950">{metricValue(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="px-4 py-8 text-sm text-slate-500">Run an analysis to calculate signal KPIs.</p>
          )}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-950">Recommendations</h2>
          </div>
          <ul className="space-y-3 p-4">
            {(selectedAnalysis?.recommendations ?? ["Run an analysis to generate recommendations."]).map(item => (
              <li key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
