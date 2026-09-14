import type { ReactNode } from "react";

interface FieldLabelProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

const FieldLabel = ({
  label,
  required = false,
  error,
  children,
  className = "",
}: FieldLabelProps) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm text-[#0E2133]">
      {required ? <span className="mr-1 text-red-500">*</span> : null}
      {label}
    </label>
    {children}
    {error ? <span className="text-xs text-red-500">{error}</span> : null}
  </div>
);

export default FieldLabel;
