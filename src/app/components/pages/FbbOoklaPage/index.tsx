// Molecules
import { EmptyState } from "@/app/components/molecules/EmptyState";

/** Halaman OOKLA untuk Fixed Broadband; kontennya belum tersedia. */
const FbbOoklaPage = () => (
  <div className="m-6">
    <section className="rounded-xl border border-[#DBDBDB] bg-white">
      <EmptyState
        title="Dashboard OOKLA belum tersedia"
        description="Halaman OOKLA untuk Fixed Broadband. Kontennya menyusul."
        className="min-h-[calc(100vh-200px)]"
      />
    </section>
  </div>
);

export default FbbOoklaPage;
