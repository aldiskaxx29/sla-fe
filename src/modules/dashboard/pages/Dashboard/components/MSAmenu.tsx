import { Button, Image, Select } from "antd";

import warningIcon from "@/assets/warning.svg";
import checkIcon from "@/assets/check.svg";
import xlxsIcon from "@/assets/file-spreadsheet.svg";
import ChartMSA from "@/modules/dashboard/componets/ChartMSA";
import { TableHistory } from "@/modules/dashboard/componets/TableHistory";
import { TableParentChild } from "@/modules/dashboard/componets/TableParentChild";
import { TableHistoryCNOP } from "@/modules/dashboard/componets/TableHistoryCNOP";
import { snakeToPascal_Utils } from "@/app/utils/wording.utils";
import AppDropdown from "@/app/components/AppDropdown";
import { useEffect, useState, useMemo } from "react";
import { useDashboard } from "@/modules/dashboard/hooks/dashboard.hooks";
import { toast } from "react-toastify";

const MSAmenu = ({
  dataSC,
  isLoadingSC,
  dataHistoryData,
  isSuccessHistoryData,
  trendData,
  level,
  setLevel,
  handletreg,
  handlefilter,
  filter,
  treg,
  handleHistoryCNOP,
  historyType,
  parameterHistory,
}) => {
  const dataWithIndex = (dataSource) => {
    return dataSource?.map((item, index) => {
      return {
        ...item,
        no:
          !item.parameter?.toLowerCase()?.includes("weighted") &&
          !item.parameter?.toLowerCase()?.includes("service ")
            ? index + 1
            : null,
      };
    });
  };

  const filterOptions = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Area 1",
      value: "treg1",
    },
    {
      label: "Area 2",
      value: "treg2",
    },
    {
      label: "Area 3",
      value: "treg3",
    },
    {
      label: "Area 4",
      value: "treg4",
    },
  ];

  const filterBy = [
    {
      label: "By Total Ne",
      value: "by total ne",
    },
    {
      label: "By Achievement",
      value: "by ach",
    },
  ];

  const { getComply, dataComply } = useDashboard();
  const [plRanToCoreOption, setPlRanToCoreOption] = useState("packetloss ran to core");
  const [historyPeriod, setHistoryPeriod] = useState("monthly");

  const HistoryOptions = [
    "pl 5% ran to core",
    "pl 1-5% ran to core",
    "latency ran to core",
    "jitter ran to core",
    "mttrq ran to core major",
    "mttrq ran to core minor",
    "pl core to internet",
    "latency core to internet",
    "jitter core to internet",
  ];

  const getTrendChartData = (trendKey: string) => {
    const trendItem = trendData?.[trendKey];
    const candidates = [trendItem?.data, trendItem].filter(Boolean);

    for (const candidate of candidates) {
      if (!candidate || typeof candidate !== "object") continue;

      const week = Array.isArray(candidate.week) ? candidate.week : [];
      const data = Array.isArray(candidate.data) ? candidate.data : [];

      if (week.length && data.length) {
        return { week, data };
      }

      const nested = candidate.data;
      if (nested && typeof nested === "object") {
        const nestedWeek = Array.isArray(nested.week) ? nested.week : [];
        const nestedData = Array.isArray(nested.data) ? nested.data : [];
        if (nestedWeek.length && nestedData.length) {
          return { week: nestedWeek, data: nestedData };
        }
      }
    }

    return null;
  };

  const fetchComply = async () => {
    try {
      await getComply({}).unwrap();
    } catch {
      toast.error("Gagal Mendapatkan data Comply");
    }
  };

  const handleDownloadMsa = () => {
    const fileUrl = "/Summary_Ach_KPI_MSA.pptx";
    const link = document.createElement("a");
    link.href = fileUrl; // URL hasil bundle dari Vite / Next.js
    link.download = "MSA_Report.pptx"; // nama file saat diunduh
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchComply();
  }, []);

  return (
    <div>
      <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 mx-6 ">
        <div className="bg-[#EDEDED] max-w-[240px] rounded-[54px] px-4 py-2 h-12 flex justify-center items-center">
          <p className="font-semibold text-[#0E2133] text-base">
            ACHIEVEMENT PREDICTION
          </p>
        </div>
        <div className="flex justify-between items-end my-4">
          <div className="flex gap-5">
            {/* <div className="flex bg-green-50 px-4 py-2 rounded-xl">
              <Image src={checkIcon} alt="icon" width={36} preview={false} />
              <div className="ml-2 ">
                <p className="text-sm text-primary-1 font-bold">
                  Current Service Credit
                </p>
                <p className="text-base text-[#4B465C] medium">
                  Rp. {dataComply && dataComply[0].service_creadir}
                </p>
              </div>
            </div> */}
            {/* <div className="flex bg-green-50 px-4 py-2 rounded-xl"> */}
            <div className="flex bg-yellow-50 px-4 py-2 rounded-xl">
              {/* <Image src={checkIcon} alt="icon" width={36} preview={false} /> */}
              <Image src={warningIcon} alt="icon" width={40} preview={false} />
              <div className="ml-2 ">
                <p className="text-sm text-primary-1 font-bold">
                  {dataComply && dataComply[1].parameter}
                </p>
                <p className="text-base text-[#4B465C] medium">
                  {dataComply && dataComply[1].jumlah} Parameter
                </p>
              </div>
            </div>
            {/* <div className="flex bg-yellow-50 px-4 py-2 rounded-xl">
              <Image src={warningIcon} alt="icon" width={36} preview={false} />
              <div className="ml-2">
                <p className="text-sm text-primary-1 font-bold">
                  {dataComply && dataComply[2].parameter}
                </p>
                <p className="text-base text-[#4B465C] medium">
                  {dataComply && dataComply[2].jumlah} Parameter
                </p>
              </div>
            </div> */}
          </div>
          <div className="flex flex-wrap items-end gap-3 lg:gap-4">
            <AppDropdown
              title="Filter Area"
              placeholder="All"
              options={filterOptions}
              onChange={(value) => handletreg(value)}
              value={treg}
              className="min-w-[250px] lg:min-w-[260px]"
            />
            <AppDropdown
              title="Filter By"
              placeholder="All"
              options={filterBy}
              onChange={(value) => handlefilter(value)}
              value={filter}
              className="min-w-[250px] lg:min-w-[260px]"
            />
            {/* <Button
              onClick={handleDownloadMsa}
              className="!h-11 !px-3 py-2.5 !border-0 !rounded-full !bg-[#EDFFFD]"
            >
              <p className="text-brand-secondary font-medium">
                Export MSA as PPT
              </p>
              <Image src={xlxsIcon} alt="icon" width={16} preview={false} />
            </Button> */}
            <Button
              onClick={() => {}}
              className="!h-11 !px-3 py-2.5 !border-0 !rounded-full !bg-[#EDFFFD] shrink-0"
            >
              <p className="text-brand-secondary font-medium">Export as XLS</p>
              <Image src={xlxsIcon} alt="icon" width={16} preview={false} />
            </Button>
          </div>
        </div>
        {!isLoadingSC && (
          <div className="w-auto overflow-x-auto ">
            <TableParentChild
              treg={treg}
              data={dataWithIndex(dataSC?.data)}
              loadingMainData={isLoadingSC}
            ></TableParentChild>
          </div>
        )}
        <div className="flex justify-between border-b-[1px] mt-4 border-gray-200 font-medium mb-5">
          <div className="bg-[#EDEDED] py-2 px-4 rounded-full mb-3">
            <p className="text-base font-semibold">TREND ACHIEVEMENT</p>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              className={
                level === "nation"
                  ? "text-brand-secondary border rounded-full px-3 h-8 border-brand-secondary"
                  : "text-gray-500 border rounded-full px-3 h-8"
              }
              onClick={() => setLevel("nation")}
            >
              Nation Wide
            </button>
            {/* <button
              className={
                level === "area"
                  ? "text-brand-secondary border rounded-full px-3 h-8 border-brand-secondary"
                  : "text-gray-500 border rounded-full px-3 h-8"
              }
              onClick={() => setLevel("area")}
            >
              Area
            </button>
            <button
              className={
                level === "region"
                  ? "text-brand-secondary border rounded-full px-3 h-8 border-brand-secondary"
                  : "text-gray-500 border rounded-full px-3 h-8"
              }
              onClick={() => setLevel("region")}
            >
              Regional
            </button> */}
          </div>
        </div>
        <div className=" flex gap-4 w-full overflow-auto">
          <div className="w-full">
            {getTrendChartData("packetloss ran to core") && (
              <ChartMSA
                description="Lower Better"
                title="PACKETLOSS RAN-TO-CORE"
                key="PACKETLOSS RAN-TO-CORE"
                data={{
                  week: trendData[plRanToCoreOption]?.data?.week || [],
                  data: trendData[plRanToCoreOption]?.data?.data || [],
                }}
                extra={
                  <Select
                    value={plRanToCoreOption}
                    onChange={(val) => setPlRanToCoreOption(val)}
                    size="small"
                    className="[&_.ant-select-selector]:!rounded-full"
                    style={{ width: 90 }}
                    options={[
                      { value: "packetloss ran to core", label: "Default" },
                      { value: "packetloss 1-5% ran to core", label: "1-5%" },
                      { value: "packetloss >5% ran to core", label: ">5%" },
                    ]}
                  />
                }
              />
            )}
            {getTrendChartData("packetloss core to internet") && (
              <ChartMSA
                description="Higher Better"
                title="PACKETLOSS CORE-TO-INTERNET"
                key="PACKETLOSS CORE-TO-INTERNET"
                data={{
                  week: trendData["packetloss core to internet"]?.data?.week,
                  data: trendData["packetloss core to internet"]?.data?.data,
                }}
              />
            )}
          </div>
          {!getTrendChartData("packetloss ran to core") &&
            !getTrendChartData("packetloss core to internet") &&
            !getTrendChartData("latency ran to core") &&
            !getTrendChartData("latency core to internet") &&
            !getTrendChartData("jitter ran to core") &&
            !getTrendChartData("jitter core to internet") &&
            !getTrendChartData("mttrq ran to core major") &&
            !getTrendChartData("mttrq ran to core minor") && (
              <div className="w-full py-12 text-center text-gray-500">
                Trend achievement belum tersedia atau format respons API tidak sesuai.
              </div>
            )}
          <div className="w-full">
            {getTrendChartData("latency ran to core") && (
              <ChartMSA
                description="Higher Better"
                title="LATENCY RAN-TO-CORE"
                key="LATENCY RAN-TO-CORE"
                data={{
                  week: trendData["latency ran to core"]?.data?.week,
                  data: trendData["latency ran to core"]?.data?.data,
                }}
              />
            )}
            {getTrendChartData("latency core to internet") && (
              <ChartMSA
                description="Higher Better"
                title="LATENCY CORE-TO-INTERNET"
                key="LATENCY CORE-TO-INTERNET"
                data={{
                  week: trendData["latency core to internet"]?.data?.week,
                  data: trendData["latency core to internet"]?.data?.data,
                }}
              />
            )}
          </div>
          <div className="w-full">
            {getTrendChartData("jitter ran to core") && (
              <ChartMSA
                description="Higher Better"
                title="JITTER RAN-TO-CORE"
                key="JITTER RAN-TO-CORE"
                data={{
                  week: trendData["jitter ran to core"]?.data?.week,
                  data: trendData["jitter ran to core"]?.data?.data,
                }}
              />
            )}
            {getTrendChartData("jitter core to internet") && (
              <ChartMSA
                description="Higher Better"
                title="JITTER CORE-TO-INTERNET"
                key="JITTER CORE-TO-INTERNET"
                data={{
                  week: trendData["jitter core to internet"]?.data?.week,
                  data: trendData["jitter core to internet"]?.data?.data,
                }}
              />
            )}
          </div>
          <div className="w-full">
            {getTrendChartData("mttrq ran to core major") && (
              <ChartMSA
                description="Higher Better"
                title="MTTRQ MAJOR"
                key="MTTRQ MAJOR"
                data={{
                  week: trendData["mttrq ran to core major"]?.data?.week,
                  data: trendData["mttrq ran to core major"]?.data?.data,
                }}
              />
            )}
            {getTrendChartData("mttrq ran to core minor") && (
              <ChartMSA
                description="Higher Better"
                title="MTTRQ MINOR"
                key="MTTRQ MINOR"
                data={{
                  week: trendData["mttrq ran to core minor"]?.data?.week,
                  data: trendData["mttrq ran to core minor"]?.data?.data,
                }}
              />
            )}
          </div>
        </div>
        {isSuccessHistoryData && dataHistoryData && (
          <div className="mt-6">
            <div className="flex gap-4 items-center mb-3">
              <div className="bg-[#EDEDED] py-2 px-4 rounded-full w-fit">
                <p className="text-base font-semibold">DATA SLA</p>
              </div>
              <Select
                value={historyPeriod}
                onChange={(val) => setHistoryPeriod(val)}
                className="[&_.ant-select-selector]:!rounded-full"
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "weekly", label: "Weekly" },
                ]}
                style={{ width: 120 }}
              />
              {historyPeriod === "weekly" && (
                <Select
                  value={historyType}
                  onChange={(val) => handleHistoryCNOP(val)}
                  className="[&_.ant-select-selector]:!rounded-full"
                  options={HistoryOptions.map((opt) => ({
                    value: opt,
                    label: snakeToPascal_Utils(opt).replace("Pl", "PL"),
                  }))}
                  style={{ width: 250 }}
                />
              )}
            </div>
            <div className="w-auto overflow-x-auto">
              {historyPeriod === "monthly" ? (
                <TableHistory dataSource={dataHistoryData?.data} treg={treg} />
              ) : (
                <TableHistoryCNOP
                  filter={filter}
                  dataSource={dataHistoryData?.data}
                  parameter={parameterHistory}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MSAmenu;
