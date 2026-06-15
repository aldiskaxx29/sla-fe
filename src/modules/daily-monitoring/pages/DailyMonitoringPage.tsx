import { FileImageOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { toBlob } from "html-to-image";
import { useEffect, useRef, useState } from "react";

import MttrQualityTable from "@/modules/daily-monitoring/components/MttrQualityTable";
import PacketLossTable from "@/modules/daily-monitoring/components/PacketLossTable";
import {
  useDailyMonitoringPacketLoss,
  useDailyMonitoringSummary,
} from "@/modules/daily-monitoring/hooks/dailyMonitoring.hooks";

const formatMonitoringDate = (value?: string) => {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const DailyMonitoringPage = () => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const { data: summary, error, isLoading } = useDailyMonitoringSummary();
  const {
    data: packetLoss,
    error: packetLossError,
    isLoading: isPacketLossLoading,
  } = useDailyMonitoringPacketLoss();

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (packetLossError) {
      message.error(packetLossError);
    }
  }, [packetLossError]);

  const handleExportImage = async () => {
    if (!captureRef.current || exporting || isLoading) return;

    try {
      setExporting(true);

      const node = captureRef.current;
      node.setAttribute("data-export-mode", "true");
      const width = node.scrollWidth;
      const height = node.scrollHeight;

      const blob = await toBlob(node, {
        cacheBust: true,
        backgroundColor: "#f8fafc",
        pixelRatio: 6,
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: "none",
          overflow: "visible",
        },
      });

      if (!blob) {
        message.error("Gagal membuat file gambar.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `daily-monitoring-${new Date()
        .toISOString()
        .slice(0, 10)}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Gagal mengekspor image.");
      console.error(error);
    } finally {
      captureRef.current?.removeAttribute("data-export-mode");
      setExporting(false);
    }
  };

  return (
    <div className="min-h-full px-4 py-4 md:px-6">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4">
        <div className="flex justify-end">
          <Button
            type="primary"
            icon={<FileImageOutlined />}
            onClick={handleExportImage}
            loading={exporting || isLoading}
            disabled={isLoading}
          >
            Export Image
          </Button>
        </div>

        <div
          ref={captureRef}
          id="daily-monitoring-export-root"
          className="daily-monitoring-export-root flex flex-col gap-6 bg-slate-100"
        >
          <header className="flex flex-col items-center justify-center gap-2">
            <div className="flex w-full items-center justify-center bg-gray-200 p-4">
              <h1 className="daily-monitoring-page-title font-bold uppercase tracking-wide text-blue-600">
                {packetLoss?.title || "Daily Monitoring Quality CNOP"}
              </h1>
            </div>
            <p className="daily-monitoring-page-subtitle ml-4 font-medium text-gray-600">
              {packetLoss
                ? `${packetLoss.date} | ${packetLoss.time}`
                : formatMonitoringDate(summary?.reportDate) ||
                  "Memuat tanggal..."}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6">
            <PacketLossTable
              rows={packetLoss?.rows}
              section={packetLoss?.section}
              isLoading={isPacketLossLoading}
            />
            <MttrQualityTable
              rows={summary?.rows}
              summaryRows={summary?.summaryRows}
              isLoading={isLoading}
              totalTickets={summary?.totalTickets}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyMonitoringPage;
