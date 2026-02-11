import { Button, Image } from "antd";
import warningIcon from "@/assets/warning.svg";
import checkIcon from "@/assets/check.svg";
import xlxsIcon from "@/assets/file-spreadsheet.svg";
import ChartMSA from "@/modules/dashboard/componets/ChartMSA";
import { TableHistoryCNOP } from "@/modules/dashboard/componets/TableHistoryCNOP";
import { snakeToPascal_Utils } from "@/app/utils/wording.utils";
import { TableParentChildCNOP } from "@/modules/dashboard/componets/TableParentChildCNOP";
import AppDropdown from "@/app/components/AppDropdown";
import { useEffect, useMemo } from "react";
import { useDashboard } from "@/modules/dashboard/hooks/dashboard.hooks";
import { toast } from "react-toastify";

const CNOPmenu = ({
  dataSC,
  level,
  setLevel,
  trendData,
  historyType,
  handleHistoryCNOP,
  dataHistoryData,
  parameterHistory,
  isLoadingSC,
  handlefilter,
  handletreg,
  treg,
  filter,
}) => {
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

  const dataWithIndex = useMemo(() => {
    return dataSC.data.map((group, index) => ({
      no: index + 1,
      ...group,
    }));
  }, [dataSC]);

  const filterOptions = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "TREG 1",
      value: "treg1",
    },
    {
      label: "TREG 2",
      value: "treg2",
    },
    {
      label: "TREG 3",
      value: "treg3",
    },
    {
      label: "TREG 4",
      value: "treg4",
    },
    {
      label: "TREG 5",
      value: "treg5",
    },
    {
      label: "TREG 6",
      value: "treg6",
    },
    {
      label: "TREG 7",
      value: "treg7",
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

  const fetchComply = async () => {
    try {
      await getComply({}).unwrap();
    } catch {
      toast.error("Gagal Mendapatkan data Comply");
    }
  };

  useEffect(() => {
    fetchComply();
  }, []);

  return (
    <div>
      <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 mx-6 ">
        <div className="bg-[#EDEDED] max-w-[210px] rounded-[54px] px-4 py-2 h-12 flex justify-center items-center">
          <p className="font-semibold text-[#0E2133] text-base">
            SLA CNOP ACHIEVEMENT
          </p>
        </div>
        <div className="flex justify-between items-end my-4">
          <div className="flex gap-5">
            {/* <div className="flex bg-green-50 px-4 py-2 rounded-xl">
              <Image src={checkIcon} alt="icon" width={36} preview={false} /> */}
            <div className="flex bg-yellow-50 px-4 py-2 rounded-xl">
              <Image src={warningIcon} alt="icon" width={36} preview={false} />
              <div className="ml-2 ">
                <p className="text-sm text-primary-1 font-bold">
                  {dataComply && dataComply[1].parameter}
                </p>
                <p className="text-base text-[#4B465C] medium">
                  {dataComply && dataComply[1].jumlah} Parameter
                </p>
                {/* <p className="text-base text-[#4B465C] medium">100%</p> */}
              </div>
            </div>
            <div className="flex bg-yellow-50 px-4 py-2 rounded-xl">
              <Image src={warningIcon} alt="icon" width={36} preview={false} />
              <div className="ml-2">
                <p className="text-sm text-primary-1 font-bold">
                  {dataComply && dataComply[2].parameter}
                </p>
                <p className="text-base text-[#4B465C] medium">
                  {dataComply && dataComply[2].jumlah} Parameter
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <AppDropdown
              title="Filter Treg"
              placeholder="All"
              options={filterOptions}
              onChange={(value) => handletreg(value)}
              value={treg}
            />
            <AppDropdown
              title="Filter By"
              placeholder="All"
              options={filterBy}
              onChange={(value) => handlefilter(value)}
              value={filter}
            />
            <Button
              onClick={() => {}}
              className="!h-11 !px-3 py-2.5 !border-0 !rounded-full !bg-[#EDFFFD]"
            >
              <p className="text-brand-secondary font-medium">Export as XLS</p>
              <Image src={xlxsIcon} alt="icon" width={16} preview={false} />
            </Button>
          </div>
        </div>
        <div className="">
          <TableParentChildCNOP
            filter={filter}
            treg={treg}
            data={dataWithIndex}
            loadingMainData={isLoadingSC}
          ></TableParentChildCNOP>
        </div>
        {/* </div> */}

        <div className="bg-white rounded-xl my-6 text-brand-secondary">
          <div className="flex justify-between border-b-[1px]  border-gray-200 font-medium mb-5">
            <div className="bg-[#EDEDED] py-2 px-4 rounded-full mb-3">
              <p className="text-base font-semibold">TREND ACHIEVEMENT</p>
            </div>
            <div className="flex gap-2">
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
                    ? "text-brand-secondary border-b-2 pb-4 border-brand-secondary"
                    : "text-gray-500 pb-4"
                }
                onClick={() => setLevel("area")}
              >
                Area
              </button>
              <button
                className={
                  level === "region"
                    ? "text-brand-secondary border-b-2 pb-4 border-brand-secondary"
                    : "text-gray-500 pb-4"
                }
                onClick={() => setLevel("region")}
              >
                Regional
              </button> */}
            </div>
          </div>
          <div className=" flex gap-4 w-full overflow-auto">
            <div className="w-full">
              {trendData["packetloss ran to core"] && (
                <ChartMSA
                  description="Lower Better"
                  title="PACKETLOSS RAN-TO-CORE"
                  key="PACKETLOSS RAN-TO-CORE"
                  data={{
                    week: trendData["packetloss ran to core"].data.week,
                    data: trendData["packetloss ran to core"].data.data,
                  }}
                />
              )}
              {trendData["packetloss core to internet"] && (
                <ChartMSA
                  description="Higher Better"
                  title="PACKETLOSS CORE-TO-INTERNET"
                  key="PACKETLOSS CORE-TO-INTERNET"
                  data={{
                    week: trendData["packetloss core to internet"].data.week,
                    data: trendData["packetloss core to internet"].data.data,
                  }}
                />
              )}
            </div>
            <div className="w-full">
              {trendData["latency ran to core"] && (
                <ChartMSA
                  description="Higher Better"
                  title="LATENCY RAN-TO-CORE"
                  key="LATENCY RAN-TO-CORE"
                  data={{
                    week: trendData["latency ran to core"].data.week,
                    data: trendData["latency ran to core"].data.data,
                  }}
                />
              )}
              {trendData["latency core to internet"] && (
                <ChartMSA
                  description="Higher Better"
                  title="LATENCY CORE-TO-INTERNET"
                  key="LATENCY CORE-TO-INTERNET"
                  data={{
                    week: trendData["latency core to internet"].data.week,
                    data: trendData["latency core to internet"].data.data,
                  }}
                />
              )}
            </div>
            <div className="w-full">
              {trendData["jitter ran to core"] && (
                <ChartMSA
                  description="Higher Better"
                  title="JITTER RAN-TO-CORE"
                  key="JITTER RAN-TO-CORE"
                  data={{
                    week: trendData["jitter ran to core"].data.week,
                    data: trendData["jitter ran to core"].data.data,
                  }}
                />
              )}
              {trendData["jitter core to internet"] && (
                <ChartMSA
                  description="Higher Better"
                  title="JITTER CORE-TO-INTERNET"
                  key="JITTER CORE-TO-INTERNET"
                  data={{
                    week: trendData["jitter core to internet"].data.week,
                    data: trendData["jitter core to internet"].data.data,
                  }}
                />
              )}
            </div>
            <div className="w-full">
              {trendData["mttrq ran to core major"] && (
                <ChartMSA
                  description="Higher Better"
                  title="MTTRQ MAJOR"
                  key="MTTRQ MAJOR"
                  data={{
                    week: trendData["mttrq ran to core major"].data.week,
                    data: trendData["mttrq ran to core major"].data.data,
                  }}
                />
              )}
              {trendData["mttrq ran to core minor"] && (
                <ChartMSA
                  description="Higher Better"
                  title="MTTRQ MINOR"
                  key="MTTRQ MINOR"
                  data={{
                    week: trendData["mttrq ran to core minor"].data.week,
                    data: trendData["mttrq ran to core minor"].data.data,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl text-brand-secondary">
          <div className="bg-[#EDEDED] py-2 px-4 rounded-full mb-3 w-fit">
            <p className="text-base font-semibold">MONTHLY DATA SLA</p>
          </div>
          <div className="flex justify-between">
            <div className="w-auto flex gap-3 overflow-x-auto pb-3">
              {HistoryOptions.map((option) => (
                <Button
                  key={option}
                  className={`${
                    historyType === option
                      ? "!bg-gradient-to-r from-[#001A41] to-[#0E336C]"
                      : ""
                  } !border-0 mr-3 !px-6 !py-2 !h-9 !shadow-none`}
                  onClick={() => {
                    handleHistoryCNOP(option);
                  }}
                >
                  <p
                    className={
                      historyType === option
                        ? "text-white"
                        : "text-brand-secondary"
                    }
                  >
                    {snakeToPascal_Utils(option).replace("Pl", "PL")}
                  </p>
                </Button>
              ))}
            </div>
          </div>
          <div className="w-auto overflow-x-auto mt-6">
            <TableHistoryCNOP
              filter={filter}
              dataSource={dataHistoryData?.data}
              parameter={parameterHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CNOPmenu;
