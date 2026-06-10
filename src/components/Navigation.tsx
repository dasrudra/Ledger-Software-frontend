const navMeta: Record<string, { icon: string; description: string }> = {
  "Control Dashboard": {
    icon: "◆",
    description: "Overview",
  },
  "Party Management": {
    icon: "◈",
    description: "Customers",
  },
  "Daily Ledger Desk": {
    icon: "▣",
    description: "Entries",
  },
  Adjustments: {
    icon: "◇",
    description: "Corrections",
  },
  "Personal Balance": {
    icon: "◍",
    description: "Owner cash",
  },
  "History & Reports": {
    icon: "▤",
    description: "Archive",
  },
  "Reports Archive": {
    icon: "▤",
    description: "Archive",
  },
};

export function NavButton({
  active,
  onClick,
  code,
  label,
}: {
  active: boolean;
  onClick: () => void;
  code: string;
  label: string;
}) {
  const meta = navMeta[label] ?? {
    icon: "•",
    description: code,
  };

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border px-3 py-3 text-left transition-all duration-200 ${
        active
          ? "border-[#d6a84f]/60 bg-[#d6a84f] text-[#17130f] shadow-lg shadow-black/20"
          : "border-transparent text-[#cdbfae] hover:border-[#403729] hover:bg-[#211b15] hover:text-[#fff7e8]"
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full transition ${
          active ? "bg-[#17130f]" : "bg-transparent group-hover:bg-[#d6a84f]"
        }`}
      />

      <div className="flex items-center gap-3">
        <span
          className={`grid h-9 w-9 place-items-center rounded-2xl text-sm font-black transition ${
            active
              ? "bg-[#17130f] text-[#d6a84f]"
              : "bg-[#2b241b] text-[#d6a84f] group-hover:scale-105 group-hover:bg-[#403729]"
          }`}
        >
          {meta.icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.92rem] font-black tracking-tight">
            {label}
          </span>
          <span
            className={`mt-0.5 block text-[0.72rem] font-bold ${
              active ? "text-[#4b3210]" : "text-[#8f8170]"
            }`}
          >
            {meta.description}
          </span>
        </span>

        <span
          className={`text-[0.7rem] font-black transition ${
            active
              ? "text-[#4b3210]"
              : "text-[#63594d] group-hover:text-[#d6a84f]"
          }`}
        >
          {code}
        </span>
      </div>
    </button>
  );
}
