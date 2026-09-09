// React
import type { ReactNode } from "react";

// Atoms
import Button from "./Button";

interface PillButtonProps {
  label: string;
  /** Path gambar ikon, mis. hasil import svg. */
  icon?: string;
  onClick: () => void;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Tombol aksi berbentuk pil dengan ikon di kanan label. */
const PillButton = ({
  label,
  icon,
  onClick,
  loading = false,
  className = "",
  children,
}: PillButtonProps) => (
  <Button
    variant="pill"
    size="lg"
    onClick={onClick}
    loading={loading}
    className={`shrink-0 ${className}`}
  >
    <span>{label}</span>
    {icon ? <img src={icon} alt="" width={16} height={16} /> : null}
    {children}
  </Button>
);

export default PillButton;
