import React, { useCallback, useEffect, useState } from "react";
import { TableInputSite } from "../components/TableInputSite";
import { useSite } from "../hooks/site.hooks";
import { AppDropdown } from "@/app/components/AppDropdown";
import { Button, Image, Spin, Upload } from "antd";
import xlxsIcon from "@/assets/file-spreadsheet.svg";

const SitePage = () => {
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState("21");
  const [month, setMonth] = useState("4");
  const [parameter, setParameter] = useState("packetloss 1-5% ran to core");
  const { dataSite, getSite, isLoadingSite } = useSite();
  /**
   * @description Fetch customer list
   *
   * @return {Promise<void>} Promise<void>
   */
  const fetchSite = useCallback(async (): Promise<void> => {
    setLoading(true);

    await getSite({
      query: {
        parameter,
        week,
        month,
      },
    }).unwrap();
    setLoading(false);
  }, [month, parameter, week]);

  useEffect(() => {
    fetchSite();
  }, [parameter, week, month]);

  const filterParameter = [
    { label: "Packetloss 1-5%", value: "packetloss 1-5% ran to core" },
    { label: "Packetloss >5%", value: "packetloss >5% ran to core" },
    { label: "Jitter", value: "jitter ran to core" },
    { label: "Latency", value: "latency ran to core" },
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

  const filterWeek = Array.from({ length: 52 }, (_, i) => ({
    label: `Week ${i + 1}`,
    value: `${i + 1}`,
  }));

  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 mx-6 ">
      {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}

      <div className="flex justify-between mb-6">
        <div className="bg-[#EDEDED] max-w-[210px] rounded-[54px] px-4 py-2 h-12 flex justify-center items-center">
          <p className="font-semibold text-[#0E2133] text-base">
            REKONSILIASI
          </p>
        </div>
        <div className="flex gap-4">
          <AppDropdown
            title="Parameter"
            className="w-full !h-11"
            placeholder="All"
            options={filterParameter}
            setOption={setParameter}
          ></AppDropdown>
          <AppDropdown
            title="Month"
            className="w-full !h-11"
            placeholder="All"
            options={filterMonth}
            setOption={setMonth}
          ></AppDropdown>{" "}
          <AppDropdown
            title="Week"
            className="w-full !h-11"
            placeholder="All"
            options={filterWeek}
            setOption={setWeek}
          ></AppDropdown>
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
        {dataSite && (
          <TableInputSite
            dataSource={dataSite.data}
            parameter={parameter}
            week={week}
            month={month}
          />
        )}
      </div>
    </div>
  );
};

export default SitePage;
