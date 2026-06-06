import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: "cyan" | "emerald" | "amber" | "rose";
}

const toneClasses = {
  cyan: "bg-cyan-50 text-cyan-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700"
} as const;

export function StatCard({ label, value, icon: Icon, tone }: StatCardProps): JSX.Element {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${toneClasses[tone]}`}>
          <Icon size={20} />
        </span>
      </div>
    </section>
  );
}

