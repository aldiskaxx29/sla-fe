import type { ReactNode } from "react";

export type InlineAlertTone = "warning" | "danger" | "info";

const TONE_CLASS: Record<InlineAlertTone, string> = {
  warning: "border-yellow-300 bg-yellow-50 text-yellow-800",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

interface InlineAlertProps {
  tone?: InlineAlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}

const InlineAlert = ({
  tone = "warning",
  title,
  children,
  className = "",
}: InlineAlertProps) => (
  <div
    role="alert"
    className={`rounded-lg border px-4 py-3 text-sm ${TONE_CLASS[tone]} ${className}`}
  >
    {title ? <p className="font-semibold">{title}</p> : null}
    {children ? <div className={title ? "mt-1" : "font-medium"}>{children}</div> : null}
  </div>
);

export default InlineAlert;
