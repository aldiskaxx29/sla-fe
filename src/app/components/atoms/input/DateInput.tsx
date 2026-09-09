// React
import type { InputHTMLAttributes } from "react";

interface DateInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value?: string;
  /** Nilai dikirim dalam format YYYY-MM-DD, atau string kosong bila dikosongkan. */
  onChange?: (value: string) => void;
  invalid?: boolean;
}

const DateInput = ({
  value = "",
  onChange,
  invalid = false,
  className = "",
  ...inputProps
}: DateInputProps) => (
  <input
    type="date"
    value={value}
    onChange={(event) => onChange?.(event.target.value)}
    className={[
      "w-full rounded-lg border bg-white px-3 py-1.5 text-sm text-[#0E2133]",
      "focus:outline-none focus:ring-1",
      invalid
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-[#D9D9D9] focus:border-brand-secondary focus:ring-brand-secondary",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...inputProps}
  />
);

export default DateInput;
