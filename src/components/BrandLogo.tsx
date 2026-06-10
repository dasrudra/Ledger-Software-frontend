export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden ${
        compact ? "h-11 w-11 rounded-2xl" : "h-16 w-16 rounded-[1.4rem]"
      } bg-gradient-to-br from-[#f6d58a] via-[#d6a84f] to-[#9c6f22] text-[#17130f] shadow-lg shadow-black/20 ring-1 ring-white/15`}
      aria-label="Accounts and Ledger System logo"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.65),transparent_34%)]" />
      <div className="absolute -bottom-5 -right-5 h-12 w-12 rounded-full bg-[#17130f]/15" />

      <svg
        viewBox="0 0 64 64"
        className={`relative z-10 ${compact ? "h-8 w-8" : "h-11 w-11"}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="14"
          y="10"
          width="32"
          height="40"
          rx="8"
          fill="#17130f"
          opacity="0.95"
        />
        <path
          d="M22 22H38"
          stroke="#f6d58a"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M22 31H38"
          stroke="#f6d58a"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M22 40H31"
          stroke="#f6d58a"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="45" cy="45" r="10" fill="#f6d58a" />
        <path
          d="M41.2 45.2L44.1 48.1L49.6 42.4"
          stroke="#17130f"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
