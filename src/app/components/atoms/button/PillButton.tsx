import type { ReactNode } from "react";

import Button from "./Button";

interface PillButtonProps {
  label: string;
  icon?: string;
  onClick: () => void;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

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
