import type { ComponentType, InputHTMLAttributes, ReactNode } from "react";

interface IconInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  trailing?: ReactNode;
}

export function IconInputField({
  id,
  label,
  icon: Icon,
  trailing,
  className = "",
  ...inputProps
}: IconInputFieldProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="mb-1 font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
          <Icon className="size-5" />
        </span>
        <input
          id={id}
          className={`h-12 w-full rounded-lg border border-gray-300 pl-10 focus:border-blue-500 focus:outline-none disabled:bg-gray-50 ${
            trailing ? "pr-10" : "pr-3"
          }`}
          {...inputProps}
        />
        {trailing ? (
          <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center">
            {trailing}
          </span>
        ) : null}
      </div>
    </div>
  );
}
