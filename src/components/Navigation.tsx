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
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-[0.92rem] transition ${
        active
          ? "bg-[#d6a84f] text-[#17130f] shadow-lg shadow-black/15"
          : "text-[#cdbfae] hover:bg-[#2b241b] hover:text-[#fff7e8]"
      }`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-xl text-[0.72rem] font-black ${
          active
            ? "bg-[#17130f] text-[#d6a84f]"
            : "bg-[#2b241b] text-[#b8ab99] group-hover:bg-[#403729]"
        }`}
      >
        {code}
      </span>

      <span className="font-black tracking-tight">{label}</span>
    </button>
  );
}
