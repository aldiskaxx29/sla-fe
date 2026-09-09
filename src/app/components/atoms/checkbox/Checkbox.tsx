// React
import type { ReactNode } from "react";

// Atoms
import { IconCheck } from "@/app/components/atoms/icon";

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

/** Checkbox custom: kotak teal saat tercentang, bukan kotak gelap. */
const Checkbox = ({
  checked,
  onChange,
  disabled = false,
  children,
  className = "",
}: CheckboxProps) => (
  <label
    className={[
      "inline-flex items-center gap-2 text-sm text-[#0E2133]",
      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    <span
      className={[
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
        // Input-nya sr-only, jadi cincin fokus dipasang di kotaknya.
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-500/40",
        checked
          ? "border-teal-600 bg-teal-600 text-white"
          : "border-[#D9D9D9] bg-white",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="sr-only"
      />
      {checked ? <IconCheck size={12} strokeWidth={3} /> : null}
    </span>
    {children ? <span>{children}</span> : null}
  </label>
);

export default Checkbox;
