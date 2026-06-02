interface Props {
  placeholder: string;
  value: string;
  maxLength: number;
  onChange: (v: string) => void;
}

export function NameInputField({
  placeholder,
  value,
  maxLength,
  onChange,
}: Props) {
  return (
    <input
      type="text"
      className="mt-2 w-full bg-transparent border-b border-black text-black font-serif text-xl px-1 py-1 focus:outline-none placeholder:text-neutral-400"
      placeholder={placeholder}
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
    />
  );
}
