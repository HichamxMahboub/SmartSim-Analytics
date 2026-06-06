import { Activity, ArrowRight, Bot, Braces, Cpu, FileText, LineChart } from "lucide-react";
import { Link } from "react-router-dom";

const capabilities = [
  { title: "MATLAB/Simulink", text: "CSV/JSON exports from simulation outputs.", icon: Cpu },
  { title: "Python Analytics", text: "KPIs, stability checks and anomaly detection.", icon: Bot },
  { title: "MERN Dashboard", text: "Projects, uploads, charts and PDF reports.", icon: Braces }
] as const;

const mockRows = [42, 48, 55, 61, 58, 70, 84, 76, 88, 92, 86, 95];

export function LandingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-cyan-300">
              <Activity size={20} />
            </span>
            <span className="font-semibold text-slate-950">SmartSim Analytics</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950" to="/login">
              Login
            </Link>
            <Link className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white" to="/register">
              Start
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-[#f7f8fb]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase text-cyan-700">MATLAB/Simulink + Python + MERN</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-slate-950 sm:text-5xl">
                SmartSim Analytics
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Plateforme web d'analyse de résultats de simulation avec import CSV/JSON, traitement Python,
                détection d'anomalies et visualisation de signaux.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Open dashboard
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="https://www.mathworks.com/products/simulink.html"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Simulink context
                </a>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">DC Motor Response</p>
                  <p className="text-xs text-slate-500">output signal · anomaly scan</p>
                </div>
                <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">stable</span>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-3">
                {["points", "mean", "std", "alerts"].map((label, index) => (
                  <div key={label} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{[1200, 74.2, 6.8, 3][index]}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex h-56 items-end gap-2 rounded-lg bg-slate-950 p-4">
                {mockRows.map((height, index) => (
                  <span
                    key={`mock-bar-${index}`}
                    className="flex-1 rounded-t bg-cyan-300"
                    style={{ height: `${height}%`, backgroundColor: index === 6 ? "#fb7185" : "#67e8f9" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 md:grid-cols-3 lg:px-8">
          {capabilities.map(item => (
            <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <item.icon className="text-cyan-700" size={24} />
              <h2 className="mt-4 text-base font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="border-t border-slate-200 bg-slate-950">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 md:grid-cols-2 lg:px-8">
            <div className="flex items-center gap-3 text-white">
              <LineChart className="text-cyan-300" />
              <span className="font-medium">Signal charts, KPIs, anomaly points</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <FileText className="text-amber-300" />
              <span className="font-medium">PDF report for portfolio demonstration</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

