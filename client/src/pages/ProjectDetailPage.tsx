import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Download, FileUp, Play, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";

import { SignalChart } from "../components/SignalChart";
import { api, getApiError } from "../services/api";
import type { AnalysisResult, ProjectDetailResponse, SimulationRow } from "../types";

type ChartMode = "signal" | "input-output" | "anomalies";

export function ProjectDetailPage(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const [detail, setDetail] = useState<ProjectDetailResponse | null>(null);
  const [rows, setRows] = useState<SimulationRow[]>([]);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [chartMode, setChartMode] = useState<ChartMode>("signal");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const latestAnalysis = useMemo<AnalysisResult | null>(() => detail?.analyses[0] ?? null, [detail]);

  async function loadDetail(): Promise<void> {
    if (!projectId) {
      return;
    }

    const { data } = await api.get<ProjectDetailResponse>(`/projects/${projectId}`);
    setDetail(data);
    const firstFile = data.files[0]?._id ?? "";
    setSelectedFileId(current => current || firstFile);
  }

  async function loadRows(fileId: string): Promise<void> {
    if (!projectId || !fileId) {
      setRows([]);
      return;
    }
    const { data } = await api.get<{ rows: SimulationRow[] }>(`/projects/${projectId}/files/${fileId}/data`);
    setRows(data.rows);
  }

  useEffect(() => {
    loadDetail().catch(apiError => setError(getApiError(apiError)));
  }, [projectId]);

  useEffect(() => {
    loadRows(selectedFileId).catch(apiError => setError(getApiError(apiError)));
  }, [selectedFileId]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file || !projectId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(`/projects/${projectId}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSelectedFileId(data.file._id);
      await loadDetail();
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  async function runAnalysis(): Promise<void> {
    if (!selectedFileId) {
      setError("Upload or select a simulation file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(`/analysis/${selectedFileId}/run`);
      await loadDetail();
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setLoading(false);
    }
  }

  async function downloadReport(): Promise<void> {
    if (!projectId || !latestAnalysis) {
      return;
    }

    const response = await api.get(`/reports/${projectId}/${latestAnalysis._id}`, {
      responseType: "blob"
    });
    const blobUrl = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${detail?.project.name ?? "simulation"}-report.pdf`;
    link.click();
    URL.revokeObjectURL(blobUrl);
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
          onClick={() => loadDetail().catch(apiError => setError(getApiError(apiError)))}
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            <FileUp size={16} />
            Upload CSV/JSON
            <input className="sr-only" type="file" accept=".csv,.json" onChange={handleUpload} />
          </label>
          <select
            className="focus-ring rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            value={selectedFileId}
            onChange={event => setSelectedFileId(event.target.value)}
          >
            <option value="">Select file</option>
            {detail?.files.map(file => (
              <option key={file._id} value={file._id}>
                {file.originalName} · {file.status}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={runAnalysis}
            disabled={loading || !selectedFileId}
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play size={16} />
            Run Python analysis
          </button>
          <button
            type="button"
            onClick={() => downloadReport().catch(apiError => setError(getApiError(apiError)))}
            disabled={!latestAnalysis}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={16} />
            PDF report
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Trend</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{latestAnalysis?.trend ?? "pending"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Stability</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {String(latestAnalysis?.stability.status ?? "pending")}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Anomalies</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{latestAnalysis?.anomalies.length ?? 0}</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Signals</h2>
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            {(["signal", "input-output", "anomalies"] as ChartMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setChartMode(mode)}
                className={[
                  "rounded-md px-3 py-2 text-sm font-medium",
                  chartMode === mode ? "bg-slate-950 text-white" : "text-slate-600"
                ].join(" ")}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <SignalChart rows={rows} mode={chartMode} anomalies={latestAnalysis?.anomalies ?? []} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-950">KPIs</h2>
          </div>
          <div className="max-h-96 overflow-auto p-4">
            <pre className="text-sm text-slate-700">{JSON.stringify(latestAnalysis?.kpis ?? {}, null, 2)}</pre>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-950">Recommendations</h2>
          </div>
          <ul className="space-y-3 p-4">
            {(latestAnalysis?.recommendations ?? ["Run an analysis to generate recommendations."]).map(item => (
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

