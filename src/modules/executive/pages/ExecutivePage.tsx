import { qosmoUrl } from "@/modules/vaccess/utils/qosmoApi";

const ExecutivePage = () => {
  return (
    <iframe
      src={qosmoUrl("/executive/?page=executive")}
      title="Executive Dashboard"
      className="w-full min-h-[100vh] border-0"
    />
  );
};

export default ExecutivePage;
