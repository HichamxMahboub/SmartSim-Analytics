import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";

import { api, getApiError } from "../services/api";
import type { SimulationProject } from "../types";

const initialForm = {
  name: "DC Motor Speed Control",
  description: "Closed-loop Simulink simulation exported to CSV for analytics.",
  systemType: "Control System",
  simulationDate: new Date().toISOString().slice(0, 10),
  parameters: "{\n  \"controller\": \"PID\",\n  \"samplingTime\": \"0.01s\"\n}"
};

export function ProjectsPage(): JSX.Element {
  const [projects, setProjects] = useState<SimulationProject[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadProjects(): Promise<void> {
    const { data } = await api.get<SimulationProject[]>("/projects");
    setProjects(data);
  }

  useEffect(() => {
    loadProjects().catch(apiError => setError(getApiError(apiError)));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setLoading(true);

    let parameters: Record<string, unknown>;
    try {
      parameters = JSON.parse(form.parameters || "{}");
    } catch {
      setError("Parameters must be valid JSON.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/projects", {
        name: form.name,
        description: form.description,
        systemType: form.systemType,
        simulationDate: form.simulationDate,
        parameters
      });
      setForm(initialForm);
      await loadProjects();
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(projectId: string): Promise<void> {
    setError("");
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(current => current.filter(project => project._id !== projectId));
    } catch (apiError) {
      setError(getApiError(apiError));
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Plus size={20} className="text-cyan-700" />
          <h1 className="text-lg font-semibold text-slate-950">New simulation project</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.name}
              onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">System type</span>
            <input
              className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.systemType}
              onChange={event => setForm(current => ({ ...current, systemType: event.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Simulation date</span>
            <input
              className="focus-ring mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              type="date"
              value={form.simulationDate}
              onChange={event => setForm(current => ({ ...current, simulationDate: event.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              className="focus-ring mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.description}
              onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Parameters JSON</span>
            <textarea
              className="focus-ring mt-1 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              value={form.parameters}
              onChange={event => setForm(current => ({ ...current, parameters: event.target.value }))}
            />
          </label>

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Create project"}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-950">Simulation projects</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {projects.length ? (
            projects.map(project => (
              <article key={project._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <Link to={`/app/projects/${project._id}`} className="min-w-0">
                  <h3 className="font-semibold text-slate-950 hover:text-cyan-700">{project.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description}</p>
                  <p className="mt-2 text-xs font-medium uppercase text-slate-400">{project.systemType}</p>
                </Link>
                <button
                  type="button"
                  onClick={() => deleteProject(project._id)}
                  className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600"
                  aria-label={`Delete ${project.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </article>
            ))
          ) : (
            <p className="px-4 py-8 text-sm text-slate-500">No project created yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

