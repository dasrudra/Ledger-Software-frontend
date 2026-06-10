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
      className={`group relative min-h-[118px] overflow-hidden rounded-[1.5rem] p-4 shadow-lg shadow-[#d8c9b4]/35 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#c7ad83]/40 ${classes[variant]}`}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 transition duration-300 group-hover:scale-125" />
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#d6a84f] transition-all duration-300 group-hover:w-full" />

      <p className="relative text-[0.82rem] font-black opacity-75">{label}</p>
      <strong className="relative mt-5 block text-xl font-black tracking-tight sm:text-2xl">
        {value}
      </strong>
      <p className="relative mt-1.5 text-[0.82rem] opacity-70">{helper}</p>
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
    <div className="flex items-center justify-between gap-4 border-b border-[#403729] pb-2.5 last:border-0 last:pb-0">
      <span className="text-[0.86rem] text-[#cdbfae]">{label}</span>
      <strong className={strong ? "text-base text-[#d6a84f]" : ""}>
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
      className={`rounded-2xl p-3 ${
        dark ? "bg-[#17130f] text-[#fff7e8]" : "bg-[#fffaf0]"
      }`}
    >
      <span className="text-[0.74rem] font-black opacity-70">{label}</span>
      <strong className="mt-1 block text-[0.9rem] font-black">{value}</strong>
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
    <section className="rounded-[1.5rem] border border-[#e1d2bd] bg-[#fffaf0] p-4 shadow-lg shadow-[#d8c9b4]/35">
      <h3 className="mb-4 text-xl font-black">{title}</h3>
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
    <div className="flex items-center justify-between gap-4 border-b border-[#eadcc8] py-3 last:border-0">
      <span className={strong ? "font-black" : "text-[#756b5c]"}>{label}</span>
      <strong className={strong ? "text-base" : ""}>{value}</strong>
    </div>
  );
}

export function LoginStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#403729] bg-[#17130f]/70 p-3">
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[#b8ab99]">
        {label}
      </p>
      <p className="mt-1.5 font-black text-[#fff7e8]">{value}</p>
    </div>
  );
}
