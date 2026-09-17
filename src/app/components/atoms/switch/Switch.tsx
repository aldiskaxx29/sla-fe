interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const Switch = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}: SwitchProps) => (
  <span
    className={`inline-flex items-center gap-2 ${
      disabled ? "opacity-60" : ""
    } ${className}`.trim()}
  >
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#2563eb]" : "bg-[#cbd5e1]"
      } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${
          checked ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
    {label ? (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`text-sm font-medium text-[#334155] ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {label}
      </button>
    ) : null}
  </span>
);

export default Switch;
