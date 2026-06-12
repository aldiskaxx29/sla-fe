import MttrQualityTable from "@/modules/daily-monitoring/components/MttrQualityTable";
import PacketLossTable from "@/modules/daily-monitoring/components/PacketLossTable";

const DailyMonitoringPage = () => {
  return (
    <div className="min-h-full  px-4 py-4 md:px-6">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6">
        <header className=" flex flex-col justify-center items-center gap-2">
          <div className="bg-gray-200 p-4 w-full flex justify-center items-center">
            <h1 className="text-2xl font-bold uppercase text-blue-600">
              Daily Monitoring Quality CNOP
            </h1>
          </div>
          <p className="ml-4 text-sm text-gray-600">
            11 Juni 2026 Pukul 14:00 WIB
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <PacketLossTable />
          <MttrQualityTable />
        </div>
      </div>
    </div>
  );
};

export default DailyMonitoringPage;
