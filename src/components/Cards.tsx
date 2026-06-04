import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  helper,
  variant,
}: {
  label: string;
  value: string;
  helper: string;
  variant: "dark" | "paper" | "green" | "gold";
}) {
  const classes = {
    dark: "bg-[#17130f] text-[#fff7e8]",
    paper: "bg-[#fffaf0] text-[#17130f] border border-[#e1d2bd]",
    green: "bg-[#173f35] text-[#f2fff8]",
    gold: "bg-[#d6a84f] text-[#17130f]",
  };

  return (
    <div
      className={`min-h-[160px] rounded-[2rem] p-6 shadow-xl shadow-[#d8c9b4]/40 ${classes[variant]}`}
    >
      <p className="text-sm font-black opacity-75">{label}</p>
      <strong className="mt-8 block text-2xl font-black tracking-tight sm:text-3xl">
        {value}
      </strong>
      <p className="mt-2 text-sm opacity-70">{helper}</p>
    </div>
  );
}

export function SummaryLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#403729] pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-[#cdbfae]">{label}</span>
      <strong className={strong ? "text-lg text-[#d6a84f]" : ""}>
        {value}
      </strong>
    </div>
  );
}

export function MiniCalc({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        dark ? "bg-[#17130f] text-[#fff7e8]" : "bg-[#fffaf0]"
      }`}
    >
      <span className="text-xs font-black opacity-70">{label}</span>
      <strong className="mt-1 block text-sm font-black">{value}</strong>
    </div>
  );
}

export function ReportCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[#e1d2bd] bg-[#fffaf0] p-6 shadow-xl shadow-[#d8c9b4]/40">
      <h3 className="mb-5 text-2xl font-black">{title}</h3>
      {children}
    </section>
  );
}

export function ReportLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#eadcc8] py-4 last:border-0">
      <span className={strong ? "font-black" : "text-[#756b5c]"}>{label}</span>
      <strong className={strong ? "text-lg" : ""}>{value}</strong>
    </div>
  );
}

export function LoginStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[#403729] bg-[#17130f]/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#b8ab99]">
        {label}
      </p>
      <p className="mt-2 font-black text-[#fff7e8]">{value}</p>
    </div>
  );
}
