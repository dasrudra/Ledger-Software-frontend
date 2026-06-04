export function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#3a3127]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-[#e1d2bd] bg-[#fffaf0] px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-[#a89c8a] focus:border-[#9c6f22]"
      />
    </label>
  );
}
