import { lazy } from "react";
import { useParams } from "react-router-dom";

const QualityHealthinessPage = lazy(
  () => import("@/modules/quality-healthiness/pages/QualityHealthinessPage")
);

const NetworkPage = () => {
  const { menuId } = useParams();
  const isLocalDev =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  const renderLocalFallback = (title: string, description: string) => (
    <div className="mx-6 mt-6 rounded-xl border border-[#DBDBDB] bg-white p-6 min-h-[calc(100vh-120px)] flex items-center justify-center">
      <div className="max-w-xl text-center">
        <p className="text-2xl font-semibold text-[#0E2133]">{title}</p>
        <p className="mt-3 text-sm text-[#4B465C]">{description}</p>
      </div>
    </div>
  );

  return (
    <>
      {menuId === "access-perf" && (
        isLocalDev ? (
          renderLocalFallback(
            "Access Perf",
            "Dashboard Access Perf tidak tersedia sebagai iframe lokal di environment ini, jadi halaman menampilkan shell aplikasi saja tanpa blank screen."
          )
        ) : (
          <iframe
            src="/executive/?page=access"
            title="Monday Monitoring Dashboard"
            className="w-full min-h-[100vh]"
          />
        )
      )}
      {menuId === "core-perf" && (
        isLocalDev ? (
          renderLocalFallback(
            "Core Perf",
            "Dashboard Core Perf tidak tersedia sebagai iframe lokal di environment ini, jadi halaman menampilkan shell aplikasi saja tanpa blank screen."
          )
        ) : (
          <iframe
            src="/executive/?page=core"
            title="One Visibility Dashboard"
            className="w-full min-h-[100vh]"
          />
        )
      )}
      {menuId === "cdn-perf" && (
        isLocalDev ? (
          renderLocalFallback(
            "CDN Perf",
            "Dashboard CDN Perf tidak tersedia sebagai iframe lokal di environment ini, jadi halaman menampilkan shell aplikasi saja tanpa blank screen."
          )
        ) : (
          <iframe
            src="/executive/?page=cdn"
            title="One Visibility Dashboard"
            className="w-full min-h-[100vh]"
          />
        )
      )}
      {menuId === "quality-healthiness" && <QualityHealthinessPage />}
    </>
  );
};

export default NetworkPage;
