import type { ReactNode } from "react";

// Assets — di-import lewat bundler supaya ikut ter-hash ke `dist/assets`,
// tidak bergantung folder `public` ikut tersalin saat deploy.
import notchSvg from "@/assets/icons/notch.svg";

type NotchedCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  notchClassName?: string;
};

export function NotchedCard({
  title,
  children,
  className = "",
  notchClassName = "",
}: NotchedCardProps) {
  return (
    <section
      className={`relative flex h-full flex-col rounded-4xl border border-slate-200 bg-[#F1F5F9] pb-3 pt-10 px-3 shadow-sm ${className}`.trim()}
    >
      {/* The Notch SVG Background */}
      <img
        src={notchSvg}
        alt="Notch"
        className={`absolute top-[0px] left-1/2 -translate-x-1/2 pointer-events-none z-10 w-[622px] h-[74px] object-top ${notchClassName}`.trim()}
      />

      {/* The Notch Title */}
      <div
        className="absolute top-[5px] left-1/2 -translate-x-1/2 text-sm font-extrabold text-navy z-20 select-none w-60 text-center truncate"
      >
        {title}
      </div>

      {children}
    </section>
  );
}
