import React, { useCallback, useEffect, useState } from "react";
import { useSite } from "../hooks/site.hooks";
import AppDropdown from "@/app/components/AppDropdown";
import { Button, Image, Spin, Upload } from "antd";
import xlxsIcon from "@/assets/file-spreadsheet.svg";
import { TableReportSite } from "../components/TableReportSite";
import TableMTTRQ from "../components/TableMTTRQ";

const SitePage = () => {
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState("32");
  const [month, setMonth] = useState(String(new Date().getMonth()));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [parameter, setParameter] = useState("packetloss ran to core");
  const { dataReportSite, getReportSite, isLoadingSite } = useSite();
  /**
   * @description Fetch customer list
   *
   * @return {Promise<void>} Promise<void>
   */
  const fetchSite = useCallback(async (): Promise<void> => {
    setLoading(true);

    await getReportSite({
      query: {
        parameter,
        week,
        month,
        year,
      },
    }).unwrap();
    setLoading(false);
  }, [month, parameter, week, year]);

  useEffect(() => {
    fetchSite();
  }, [parameter, week, month]);

  const filterParameter = [
    { label: "Packetloss", value: "packetloss ran to core" },
    { label: "Jitter", value: "jitter ran to core" },
    { label: "Latency", value: "latency ran to core" },
    { label: "Mttrq Critical", value: "mttrq critical" },
    { label: "Mttrq Major", value: "mttrq major" },
    { label: "Mttrq Minor", value: "mttrq minor" },
  ];

  const filterMonth = [
    {
      label: "January",
      value: "1",
    },
    {
      label: "February",
      value: "2",
    },
    {
      label: "March",
      value: "3",
    },
    {
      label: "April",
      value: "4",
    },
    {
      label: "May",
      value: "5",
    },
    {
      label: "June",
      value: "6",
    },
    {
      label: "July",
      value: "7",
    },
    {
      label: "August",
      value: "8",
    },
    {
      label: "September",
      value: "9",
    },
    {
      label: "October",
      value: "10",
    },
    {
      label: "November",
      value: "11",
    },
    {
      label: "December",
      value: "12",
    },
  ];

  const filterYear = Array.from({ length: 2 }, (_, i) => {
    const currentYear = new Date().getFullYear();
    const year = currentYear - i;
    return {
      label: `${year}`,
      value: `${year}`,
    };
  });
  const filterWeek = Array.from({ length: 52 }, (_, i) => ({
    label: `Week ${i + 1}`,
    value: `${i + 1}`,
  }));

  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 mx-6 ">
      {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}

      <div className="flex justify-between mb-6">
        <div className="bg-[#EDEDED] rounded-[54px] px-4 py-2 h-12 flex justify-center items-center">
          <span className="font-semibold text-[#0E2133] text-base w-full">
            SUMMARY ASSESMENT
          </span>
        </div>
        <div className="flex gap-4">
          <AppDropdown
            title="Parameter"
            placeholder="All"
            options={filterParameter}
            onChange={(value) => setParameter(value)}
            value={parameter}
          />
          {/* <AppDropdown
            title="Month"
            placeholder="All"
            options={filterMonth}
            onChange={(value) => setMonth(Number(value))}
            value={month}
          /> */}
          <AppDropdown
            title="Week"
            placeholder="All"
            options={filterWeek}
            onChange={(value) => setWeek(value)}
            value={week}
          />
          <AppDropdown
            title="Year"
            placeholder="All"
            options={filterYear}
            onChange={(value) => setYear(value)}
            value={year}
          />
          <Upload>
            <Button
              onClick={() => {}}
              className="!h-11 !px-3 py-2.5 !border-0 !rounded-full !bg-[#EDFFFD]"
            >
              <p className="text-brand-secondary font-medium">Import Excel</p>
              <Image src={xlxsIcon} alt="icon" width={16} preview={false} />
            </Button>
          </Upload>
        </div>
      </div>
      <div>
        {parameter.includes("mttrq") ? (
          <div>
            <p className="mb-4 font-medium text-sm text-[#0E2133]">
              MTTRQ (Mean Time To Repair and Quality) is a metric used to
              measure the average time taken to repair and restore a system or
              service after a failure or outage, including the quality of the
              repair process.
            </p>
            <TableMTTRQ
              parameter={parameter}
              week={week}
              month={month}
              year={year}
            />
          </div>
        ) : dataReportSite && "data" in dataReportSite ? (
          <TableReportSite
            dataSource={dataReportSite.data as Record<string, unknown>[]}
            parameter={parameter}
            week={week}
            month={month}
            year={year}
          />
        ) : null}
      </div>
    </div>
  );
};

export default SitePage;
