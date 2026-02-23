import AppDropdown from "@/app/components/AppDropdown";
import xlxsIcon from "@/assets/file-spreadsheet.svg";
import { Button, Image, Spin, Upload } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TableInputSite } from "../components/TableInputSite";
import { useSite } from "../hooks/site.hooks";
import {
  useLazyDownload_templateQuery,
  useUpload_templateMutation,
} from "../rtk/site.rtk";
import { toast } from "react-toastify";

const SitePage = () => {
  const [week, setWeek] = useState("");
  const [month, setMonth] = useState(dayjs().format("M"));
  const [year, setYear] = useState(dayjs(new Date()).year());
  const [exclude, setExclude] = useState("all");
  const [prev, setPrev] = useState("corrective");
  const [loading, setLoading] = useState(false);
  const [parameter, setParameter] = useState("packetloss ran to core");
  const { dataSite, getSite } = useSite();
  const [trigger, setTrigger] = useState(0);

  const fetchSite = useCallback(async () => {
    setLoading(true);
    try {
      await getSite({
        query: {
          prev,
          exclude,
          parameter,
          year,
          month,
          ...(!["mttrq critical","mttrq major", "mttrq minor"].includes(parameter) && { week }),
          ...(["mttrq critical","mttrq major", "mttrq minor"].includes(parameter) && { month }),
        },
      }).unwrap();
    } catch (error) {
      console.error("Failed to fetch site data:", error);
    } finally {
      setLoading(false);
    }
  }, [exclude, parameter, month, week, year, prev]);

  useEffect(() => {
    if (!week || !month || !year) return;
    fetchSite();
  }, [exclude, parameter, year, week, month, trigger, prev]);

  const optPrev = [
    // { label: "All", value: "all" },
    { label: "Corrective", value: "corrective" },
    { label: "Preventive", value: "preventive" },
  ];

  const optExclude = [
    { label: "All", value: "all" },
    { label: "Exclude", value: "2" },
    { label: "Non Exclude", value: "1" },
  ];

  const optParameters = [
    // { label: "Packetloss 1-5%", value: "packetloss 1-5% ran to core" },
    { label: "Packetloss", value: "packetloss ran to core" },
    { label: "Jitter", value: "jitter ran to core" },
    { label: "Latency", value: "latency ran to core" },
    { label: "Mttrq Critical", value: "mttrq critical" },
    { label: "Mttrq Major", value: "mttrq major" },
    { label: "Mttrq Minor", value: "mttrq minor" },
  ];

  const optYear = [
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
    { label: "2028", value: "2028" },
    { label: "2029", value: "2029" },
    { label: "2030", value: "2030" },
  ];

  const filterWeeks = [
    { month: "1", value: ["all", "1", "2", "3", "4"] },
    { month: "2", value: ["all", "5", "6", "7", "8"] },
    { month: "3", value: ["all", "9", "10", "11", "12", "13"] },
    { month: "4", value: ["all", "14", "15", "16", "17"] },
    { month: "5", value: ["all", "18", "19", "20", "21"] },
    { month: "6", value: ["all", "22", "23", "24", "25", "26"] },
    { month: "7", value: ["all", "27", "28", "29", "30"] },
    { month: "8", value: ["all", "31", "32", "33", "34"] },
    { month: "9", value: ["all", "35", "36", "37", "38", "39"] },
    { month: "10", value: ["all", "40", "41", "42", "43"] },
    { month: "11", value: ["all", "44", "45", "46", "47"] },
    { month: "12", value: ["all", "48", "49", "50", "51", "52"] },
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

  const [downloadTemplate] = useLazyDownload_templateQuery();

  const handleDownload = useCallback(async () => {
    try {
      const result = await downloadTemplate({
        query: {
          exclude,
          parameter,
          year,
          month,
          week,
          ...(!["mttrq critical","mttrq major", "mttrq minor"].includes(parameter) && { week }),
          ...(["mttrq critical","mttrq major", "mttrq minor"].includes(parameter) && { month }),
        },
      }).unwrap();

      const blobUrl = URL.createObjectURL(result as Blob);

      const tempLink = document.createElement("a");
      tempLink.href = blobUrl;
      if (
        parameter.includes("mttrq major") ||
        parameter.includes("mttrq minor")
      ) {
        tempLink.setAttribute("download", "template-rekonsiliasi-mttr.xlsx");
      } else {
        tempLink.setAttribute("download", "template-rekonsiliasi-access.xlsx");
      }
      document.body.appendChild(tempLink);
      tempLink.click();

      document.body.removeChild(tempLink);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download the file:", error);
    }
  }, [exclude, month, parameter, week]);
  const [uploadTemplate, { isLoading }] = useUpload_templateMutation();

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadTemplate({
        query: {
          exclude,
          parameter,
          month,
          ...(!["mttrq critical","mttrq major", "mttrq minor"].includes(parameter) && { week }),
          ...(["mttrq critical","mttrq major", "mttrq minor"].includes(parameter) && { month }),
        },
        body: formData,
      }).unwrap();

      onSuccess?.("Ok");
      toast.success(`${file.name} file uploaded successfully`);
      setTrigger((value) => value + 1);
    } catch (error) {
      // Signal to Antd that the upload failed
      onError?.(new Error("Upload failed"));
      console.error("Failed to upload file:", error);
      toast.error(`${file.name} file upload failed.`);
    }
  };

  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 m-6">
      {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}
      <div className="flex justify-between mb-6">
        {/* <div className="bg-[#EDEDED] max-w-[210px] rounded-[54px] px-4 py-1 h-10 flex justify-center items-center mr-2">
          <p className="font-semibold text-[#0E2133] text-base">REKONSILIASI</p>
        </div> */}
        <div className="flex gap-4">
          <AppDropdown
            title="Site Type"
            placeholder="All"
            options={optPrev}
            value={prev}
            onChange={(value) => setPrev(value)}
          />
          <AppDropdown
            title="Exclude"
            placeholder="All"
            options={optExclude}
            value={exclude}
            onChange={(value) => setExclude(value)}
          />
          <AppDropdown
            title="Parameter"
            placeholder="All"
            options={optParameters}
            value={parameter}
            onChange={(value) => setParameter(value)}
          />
          <AppDropdown
            
            title="Tahun"
            placeholder="All"
            options={optYear}
            value={year}
            onChange={(value) => setYear(value)}
          />
          <AppDropdown
            title="Month"
            placeholder="All"
            options={optMonths}
            value={month}
            onChange={(value) => setMonth(value)}
          />
          {!["mttrq critical","mttrq major", "mttrq minor"].includes(parameter) && (
            <AppDropdown
              title="Week"
              placeholder="All"
              options={optWeeks}
              value={week}
              onChange={(value) => setWeek(value)}
            />
          )}
          <Button
            onClick={() => {
              handleDownload();
            }}
            className="!h-11 !px-3 py-2.5 !border-0 !rounded-full !bg-[#EDFFFD]"
          >
            <p className="text-brand-secondary font-medium">
              Download Template Excel
            </p>
            <Image src={xlxsIcon} alt="icon" width={16} preview={false} />
          </Button>
          <Upload customRequest={handleUpload} showUploadList={false}>
            <Button
              className="!h-11 !px-3 py-2.5 !border-0 !rounded-full !bg-[#EDFFFD]"
              loading={isLoading}
            >
              <p className="text-brand-secondary font-medium">
                {isLoading ? "Uploading..." : "Import Excel"}
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
            year={year}
            setTrigger={setTrigger}
          />
        )}
      </div>
    </div>
  );
};

export default SitePage;
