export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative grid place-items-center ${
        compact ? "h-14 w-14 rounded-2xl" : "h-20 w-20 rounded-[1.7rem]"
      } bg-[#d6a84f] text-[#17130f] shadow-lg shadow-black/20`}
      aria-label="Accounts and Ledger System logo"
    >
      <svg
        viewBox="0 0 64 64"
        className={compact ? "h-9 w-9" : "h-12 w-12"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="13"
          y="10"
          width="38"
          height="44"
          rx="7"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          d="M23 22H41"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M23 33H41"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M23 44H33"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="46" cy="46" r="8" fill="#17130f" />
        <path
          d="M42.5 46.2L45 48.7L50.2 43.3"
          stroke="#d6a84f"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
