// React
import { useNavigate } from "react-router-dom";

// Templates
import LandingTemplate from "@/app/components/templates/LandingTemplate";

// Molecules
import { EmptyState } from "@/app/components/molecules/EmptyState";

/** Dashboard EBIS belum tersedia. */
const EbisPage = () => {
  const navigate = useNavigate();

  return (
    <LandingTemplate>
      <section className="w-full max-w-xl rounded-2xl border border-[#DBDBDB] bg-white">
        <EmptyState
          title="EBIS · Coming soon"
          description="Dashboard EBIS masih disiapkan."
          action={
            <button
              type="button"
              onClick={() => navigate("/landing")}
              className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Kembali ke landing page
            </button>
          }
        />
      </section>
    </LandingTemplate>
  );
};

export default EbisPage;
