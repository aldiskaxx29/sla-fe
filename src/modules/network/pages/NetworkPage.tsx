import { lazy } from "react";
import { useParams } from "react-router-dom";

const QualityHealthinessPage = lazy(
  () => import("@/modules/quality-healthiness/pages/QualityHealthinessPage")
);

const NetworkPage = () => {
  const { menuId } = useParams();

  return (
    <>
      {menuId === "access-perf" && (
        <iframe
          src="/executive/?page=access"
          title="Monday Monitoring Dashboard"
          className="w-full min-h-[100vh]"
        />
      )}
      {menuId === "core-perf" && (
        <iframe
          src="/executive/?page=core"
          title="One Visibility Dashboard"
          className="w-full min-h-[100vh]"
        />
      )}
      {menuId === "cdn-perf" && (
        <iframe
          src="/executive/?page=cdn"
          title="One Visibility Dashboard"
          className="w-full min-h-[100vh]"
        />
      )}
      {menuId === "quality-healthiness" && <QualityHealthinessPage />}
    </>
  );
};

export default NetworkPage;
