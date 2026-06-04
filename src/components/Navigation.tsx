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
      className={`flex items-center gap-4 rounded-2xl px-4 py-4 text-left transition ${
        active
          ? "bg-[#d6a84f] text-[#17130f]"
          : "text-[#cdbfae] hover:bg-[#211b15] hover:text-[#fff7e8]"
      }`}
    >
      <span className="text-xs font-black opacity-70">{code}</span>
      <span className="font-black">{label}</span>
    </button>
  );
}
