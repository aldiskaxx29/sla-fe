// React
import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/** Input teks satu baris. */
const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ invalid = false, className = "", ...inputProps }, ref) => (
    <input
      ref={ref}
      className={[
        "w-full rounded-lg border bg-white px-3 py-1.5 text-sm text-[#0E2133]",
        "placeholder:text-gray-400 focus:outline-none focus:ring-1",
        invalid
          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
          : "border-[#D9D9D9] focus:border-brand-secondary focus:ring-brand-secondary",
        "disabled:bg-gray-50 disabled:text-gray-400 read-only:bg-gray-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...inputProps}
    />
  ),
);

TextInput.displayName = "TextInput";

export default TextInput;
