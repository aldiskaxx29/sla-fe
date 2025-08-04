import { useParams } from "react-router-dom";

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
      {menuId === "quality" && (
        <iframe
          src="/executive/?page=quality"
          title="One Visibility Dashboard"
          className="w-full min-h-[100vh]"
        />
      )}
    </>
  );
};

export default NetworkPage;
