import type { ReactNode } from "react";

interface SectionCardProps {
  as?: "section" | "div";
  className?: string;
  children: ReactNode;
}

export function SectionCard({
  as: Component = "section",
  className = "flex flex-col gap-4 p-4",
  children,
}: SectionCardProps) {
  return (
    <Component
      className={`rounded-[19px] border border-[#e2e8f0] bg-white shadow-[0px_1px_1.75px_0px_rgba(0,0,0,0.05)] ${className}`}
    >
      {children}
    </Component>
  );
}
