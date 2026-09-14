import type { TextareaHTMLAttributes } from "react";

interface TextAreaInputProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const TextAreaInput = ({
  invalid = false,
  className = "",
  rows = 3,
  ...textareaProps
}: TextAreaInputProps) => (
  <textarea
    rows={rows}
    className={[
      "w-full rounded-lg border bg-white px-3 py-1.5 text-sm text-[#0E2133]",
      "placeholder:text-gray-400 focus:outline-none focus:ring-1",
      invalid
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-[#D9D9D9] focus:border-brand-secondary focus:ring-brand-secondary",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...textareaProps}
  />
);

export default TextAreaInput;
