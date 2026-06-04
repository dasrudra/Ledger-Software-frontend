export function InputField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#3a3127]">
      {label}
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#17130f] outline-none transition focus:border-[#9c6f22] disabled:cursor-not-allowed disabled:bg-[#eee2cf] disabled:text-[#8a7d6b]"
      />
    </label>
  );
}
