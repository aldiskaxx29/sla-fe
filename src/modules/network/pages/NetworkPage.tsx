import { useParams } from "react-router-dom";

const NetworkPage = () => {
  const { menuId } = useParams();

  return (
    <>
      {menuId === "access-perf" && (
        <iframe
          src="http://10.60.174.187:90/devel/?page=access"
          title="Monday Monitoring Dashboard"
          className="w-full min-h-[100vh]"
        />
      )}
      {menuId === "core-perf" && (
        <iframe
          src="http://10.60.174.187:90/devel/?page=core"
          title="One Visibility Dashboard"
          className="w-full min-h-[100vh]"
        />
      )}
      {menuId === "cdn-perf" && (
        <iframe
          src="http://10.60.174.187:90/devel/?page=cdn"
          title="One Visibility Dashboard"
          className="w-full min-h-[100vh]"
        />
      )}
      {menuId === "quality" && (
        <iframe
          src="http://10.60.174.187:90/devel/?page=quality"
          title="One Visibility Dashboard"
          className="w-full min-h-[100vh]"
        />
      )}
    </>
  );
};

export default NetworkPage;
