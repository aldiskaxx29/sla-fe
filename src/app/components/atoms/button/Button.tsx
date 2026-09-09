// React
import type { ButtonHTMLAttributes, ReactNode } from "react";

// Atoms
import { IconSpinner } from "@/app/components/atoms/icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "pill";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  // Memakai token yang benar-benar ada di tema (src/index.css).
  primary:
    "bg-primary-500 text-white border border-transparent hover:opacity-90",
  secondary:
    "bg-white text-[#0E2133] border border-[#D9D9D9] hover:border-brand-secondary hover:text-brand-secondary",
  ghost:
    "bg-transparent text-[#0E2133] border border-transparent hover:bg-gray-100",
  danger:
    "bg-transparent text-red-600 border border-transparent hover:bg-red-50",
  pill: "bg-[#EDFFFD] text-brand-secondary border-0 rounded-full font-medium",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-7 px-2 text-xs gap-1",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-3 text-sm gap-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
  /** Ditaruh sebelum label. */
  icon?: ReactNode;
  /** Ditaruh setelah label. */
  suffixIcon?: ReactNode;
}

/** Tombol dasar; seluruh gaya bisa ditimpa lewat `className`. */
const Button = ({
  variant = "secondary",
  size = "md",
  loading = false,
  block = false,
  icon,
  suffixIcon,
  className = "",
  disabled,
  children,
  type = "button",
  ...buttonProps
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center rounded-lg transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        block ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...buttonProps}
    >
      {loading ? <IconSpinner size={14} /> : icon}
      {children}
      {suffixIcon}
    </button>
  );
};

export default Button;
