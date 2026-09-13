// React
import type { ReactNode } from "react";
import { LuBell, LuSparkles } from "react-icons/lu";
import { toast } from "react-toastify";

// Molecules
import { UserMenu } from "@/app/components/molecules/UserMenu";

// Assets
import qosmo from "@/assets/1_Qosmo.png";

/**
 * Dua pintasan di header. Fiturnya belum ada, jadi klik-nya memberi kabar
 * ke user alih-alih diam saja.
 */
const HEADER_ACTIONS = [
  {
    key: "first-insight",
    label: "First Insight",
    icon: LuSparkles,
    message: "First Insight belum tersedia.",
  },
  {
    key: "notifikasi",
    label: "Notifikasi",
    icon: LuBell,
    message: "Belum ada notifikasi.",
  },
];

interface LandingTemplateProps {
  children: ReactNode;
}

/** Kerangka halaman di luar dashboard: header tipis, isi di tengah, footer. */
const LandingTemplate = ({ children }: LandingTemplateProps) => (
  <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />

    <header className="relative flex items-center justify-between gap-3 px-6 py-4">
      <img src={qosmo} alt="Qosmo" className="h-12 w-auto object-contain" />

      <div className="flex items-center gap-2">
        {HEADER_ACTIONS.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.key}
              type="button"
              onClick={() =>
                toast.info(action.message, { position: "top-right" })
              }
              className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy transition-colors hover:bg-slate-50"
            >
              <Icon size={15} className="text-slate-500" />
              {action.label}
            </button>
          );
        })}

        <UserMenu />
      </div>
    </header>

    <main className="relative flex flex-1 items-center justify-center px-6 py-10">
      {children}
    </main>

    <footer className="relative border-t border-black/8 bg-[#f9f8f7] px-5 py-3 text-center text-xs text-[#636363]">
      © {new Date().getFullYear()} Qosmo · Quality Service Monitoring, you agree
      to our Terms of Service and Privacy Policy.
    </footer>
  </div>
);

export default LandingTemplate;
