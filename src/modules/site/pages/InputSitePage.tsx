import AppDropdown from "@/app/components/AppDropdown";
import xlxsIcon from "@/assets/file-spreadsheet.svg";
import { Button, Image, Spin, Upload } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { TableInputSite } from "../components/TableInputSite";
import { useSite } from "../hooks/site.hooks";

const SitePage = () => {
  const [week, setWeek] = useState("");
  const [month, setMonth] = useState(dayjs().format("M"));
  const [parameter, setParameter] = useState("packetloss 1-5% ran to core");
  const { dataSite, getSite, isLoadingSite } = useSite();

  useEffect(() => {
    if (!week || !month) return;

    (async () => {
      await getSite({
        query: {
          parameter,
          ...(!["mttrq major", "mttrq minor"].includes(parameter) && { week }),
          ...(["mttrq major", "mttrq minor"].includes(parameter) && { month }),
        },
      }).unwrap();
    })();
  }, [getSite, parameter, week, month]);

  const optParameters = [
    { label: "Packetloss 1-5%", value: "packetloss 1-5% ran to core" },
    { label: "Packetloss >5%", value: "packetloss >5% ran to core" },
    { label: "Jitter", value: "jitter ran to core" },
    { label: "Latency", value: "latency ran to core" },
    { label: "Mttrq Major", value: "mttrq major" },
    { label: "Mttrq Minor", value: "mttrq minor" },
  ];

  const filterWeeks = [
    { month: "1", value: ["1", "2", "3"] },
    { month: "2", value: ["4", "5", "6", "7"] },
    { month: "3", value: ["8", "9", "10", "11", "12"] },
    { month: "4", value: ["13", "14", "15", "16"] },
    { month: "5", value: ["17", "18", "19", "20"] },
    { month: "6", value: ["21", "22", "23", "24", "25"] },
    { month: "7", value: ["26", "27", "28", "29"] },
    { month: "8", value: ["30", "31", "32", "33"] },
    { month: "9", value: ["34", "35", "36", "37"] },
    { month: "10", value: ["38", "39", "40", "41"] },
    { month: "11", value: ["42", "43", "44", "45"] },
    { month: "12", value: ["46", "47", "48", "49", "50"] },
  ];

  const optMonths = Array.from({ length: 12 }, (_, i) => ({
    label: dayjs().month(i).format("MMMM"),
    value: String(i + 1),
  }));

  const optWeeks = useMemo(() => {
    return filterWeeks
      .find((item) => item.month === month)
      ?.value.map((item) => ({
        label: `Week ${item}`,
        value: item,
      }));
  }, [month]);

  useEffect(() => {
    setWeek(filterWeeks.find((item) => item.month === month)?.value[0] ?? "1");
  }, [month]);

  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 m-6">
      {isLoadingSite ? (
        <Spin fullscreen tip="Sedang Memuat Data..." />
      ) : (
        <>
          {" "}
          <div className="flex justify-between mb-6">
            <div className="bg-[#EDEDED] max-w-[210px] rounded-[54px] px-4 py-2 h-12 flex justify-center items-center">
              <p className="font-semibold text-[#0E2133] text-base">
                REKONSILIASI
              </p>
            </div>
            <div className="flex gap-4">
              <AppDropdown
                title="Parameter"
                placeholder="All"
                options={optParameters}
                value={parameter}
                onChange={(value) => setParameter(value)}
              />
              <AppDropdown
                title="Month"
                placeholder="All"
                options={optMonths}
                value={month}
                onChange={(value) => setMonth(value)}
              />
              {!["mttrq major", "mttrq minor"].includes(parameter) && (
                <AppDropdown
                  title="Week"
                  placeholder="All"
                  options={optWeeks}
                  value={week}
                  onChange={(value) => setWeek(value)}
                />
              )}
              <Upload>
                <Button
                  onClick={() => {}}
                  className="!h-11 !px-3 py-2.5 !border-0 !rounded-full !bg-[#EDFFFD]"
                >
                  <p className="text-brand-secondary font-medium">
                    Import Excel
                  </p>
                  <Image src={xlxsIcon} alt="icon" width={16} preview={false} />
                </Button>
              </Upload>
            </div>
          </div>
          <div>
            {dataSite && (
              <TableInputSite
                dataSource={dataSite.data}
                parameter={parameter}
                week={week}
                month={month}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SitePage;
