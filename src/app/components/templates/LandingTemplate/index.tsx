import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LuSparkles } from "react-icons/lu";

import { UserMenu } from "@/app/components/molecules/UserMenu";

interface LandingTemplateProps {
  children: ReactNode;
}

const LandingTemplate = ({ children }: LandingTemplateProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f5]">
      <header className="flex flex-wrap items-center justify-end gap-2 px-6 py-4">
        <button
          type="button"
          onClick={() => navigate("/first-insight")}
          // onClick={() => "Fitur First Insight belum tersedia."}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-[#4f46e5] transition-colors hover:bg-indigo-50"
        >
          <LuSparkles size={15} />
          First Insight
        </button>

        {/* <button
        type="button"
        aria-label="Pengaturan"
        onClick={() => showInfo("Pengaturan belum tersedia.")}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
      >
        <LuSettings size={15} />
      </button>

      <button
        type="button"
        onClick={() => showInfo("Belum ada notifikasi.")}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] text-slate-600 transition-colors hover:bg-slate-50"
      >
        <LuBell size={15} />
        Notifikasi
      </button> */}

        <UserMenu />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        {children}
      </main>

      <footer className="px-6">
        <div className="mx-auto max-w-[1152px] border-t border-black/10 py-4 text-center text-xs text-[#636363]">
          © {new Date().getFullYear()} Qosmo · Quality Service Monitoring
        </div>
      </footer>
    </div>
  );
};

export default LandingTemplate;
