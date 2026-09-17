import { useEffect, useRef, useState } from "react";
import { LuImage } from "react-icons/lu";
import { toast } from "react-toastify";

import {
  useDailyMonitoringDownloadMutation,
  useDailyMonitoringPacketLossQuery,
  useDailyMonitoringSitesQuery,
  useDailyMonitoringSummaryQuery,
} from "@/app/hooks";

import { Button } from "@/app/components/atoms";

import { PacketLossSiteDetailModal } from "@/app/components/organisms/popup/PacketLossSiteDetailModal";
import { DailyMonitoringPacketLossTable } from "@/app/components/organisms/tables/DailyMonitoringPacketLossTable";
import { MttrQualityTable } from "@/app/components/organisms/tables/MttrQualityTable";
import DailyMonitoringTemplate from "@/app/components/templates/DailyMonitoringTemplate";

import type {
  DailyMonitoringSiteParams,
  PacketLossDetailKey,
} from "@/app/types/daily-monitoring/dailyMonitoring.types";
import { formatMonitoringDate } from "@/app/utils/dailyMonitoring.utils";
import { exportNodeAsImage } from "@/app/utils/dailyMonitoringExport.utils";

const DailyMonitoringPage = () => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [siteDetail, setSiteDetail] =
    useState<DailyMonitoringSiteParams | null>(null);

  const summary = useDailyMonitoringSummaryQuery();
  const combined = useDailyMonitoringPacketLossQuery(undefined, !splitView);
  const p5 = useDailyMonitoringPacketLossQuery("p5", splitView);
  const p15 = useDailyMonitoringPacketLossQuery("p15", splitView);
  const sites = useDailyMonitoringSitesQuery(siteDetail);
  const download = useDailyMonitoringDownloadMutation();

  const packetLossLoading = splitView
    ? p5.isFetching || p15.isFetching
    : combined.isFetching;

  const activeView = splitView ? (p5.data ?? p15.data) : combined.data;

  useEffect(() => {
    if (summary.isError) toast.error("Gagal memuat data MTTRq.");
  }, [summary.isError]);

  const handleExportImage = async () => {
    const node = captureRef.current;

    if (!node || exporting || summary.isFetching) return;

    setExporting(true);

    try {
      const fileName = `daily-monitoring-${new Date()
        .toISOString()
        .slice(0, 10)}.png`;

      const success = await exportNodeAsImage(node, fileName);

      if (!success) toast.error("Gagal membuat file gambar.");
    } catch (error) {
      toast.error("Gagal mengekspor image.");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const openSiteDetail = (
    params: Omit<DailyMonitoringSiteParams, "pl">,
    pl?: PacketLossDetailKey,
  ) => setSiteDetail({ ...params, ...(pl ? { pl } : {}) });

  const downloadTable = (pl?: PacketLossDetailKey) =>
    download.mutate({ ...(pl ? { pl } : {}) });

  const downloadDetail = () => {
    if (!siteDetail) return;

    download.mutate({
      type: siteDetail.type,
      value: siteDetail.value,
      ...(siteDetail.pl ? { pl: siteDetail.pl } : {}),
    });
  };

  return (
    <>
      <DailyMonitoringTemplate
        captureRef={captureRef}
        splitMode={splitView}
        title={activeView?.title || "Daily Monitoring Quality CNOP"}
        subtitle={
          activeView
            ? `${activeView.date} | ${activeView.time}`
            : formatMonitoringDate(summary.data?.reportDate) ||
              "Memuat tanggal..."
        }
        actions={
          <Button
            variant="gradient"
            icon={<LuImage size={16} />}
            loading={exporting || summary.isFetching || packetLossLoading}
            disabled={summary.isFetching || packetLossLoading}
            onClick={() => {
              void handleExportImage();
            }}
          >
            Export Image
          </Button>
        }
      >
        {splitView ? (
          <>
            <DailyMonitoringPacketLossTable
              rows={p5.data?.rows}
              section="A. PL 5%"
              loading={p5.isFetching}
              showSplitToggle
              splitView={splitView}
              onSplitViewChange={setSplitView}
              downloading={download.isPending}
              onDownload={() => downloadTable("p5")}
              onSiteDetail={(scope, value) =>
                openSiteDetail({ type: scope, value }, "p5")
              }
              pendingDetailValue={
                sites.isFetching ? siteDetail?.value : undefined
              }
            />

            <DailyMonitoringPacketLossTable
              rows={p15.data?.rows}
              section="B. PL 1-5%"
              loading={p15.isFetching}
              downloading={download.isPending}
              onDownload={() => downloadTable("p15")}
              onSiteDetail={(scope, value) =>
                openSiteDetail({ type: scope, value }, "p15")
              }
              pendingDetailValue={
                sites.isFetching ? siteDetail?.value : undefined
              }
            />
          </>
        ) : (
          <DailyMonitoringPacketLossTable
            rows={combined.data?.rows}
            section={combined.data?.section}
            loading={combined.isFetching}
            showSplitToggle
            splitView={splitView}
            onSplitViewChange={setSplitView}
            downloading={download.isPending}
            onDownload={() => downloadTable()}
            onSiteDetail={(scope, value) =>
              openSiteDetail({ type: scope, value })
            }
            pendingDetailValue={
              sites.isFetching ? siteDetail?.value : undefined
            }
          />
        )}

        <div className="daily-monitoring-hide-on-split-export">
          <MttrQualityTable
            rows={summary.data?.rows}
            summaryRows={summary.data?.summaryRows}
            loading={summary.isFetching}
            totalTickets={summary.data?.totalTickets}
          />
        </div>
      </DailyMonitoringTemplate>

      <PacketLossSiteDetailModal
        open={Boolean(siteDetail)}
        scope={siteDetail?.type}
        value={siteDetail?.value}
        pl={siteDetail?.pl}
        rows={sites.data ?? []}
        loading={sites.isFetching}
        error={sites.isError}
        downloading={download.isPending}
        onDownload={downloadDetail}
        onClose={() => setSiteDetail(null)}
      />
    </>
  );
};

export default DailyMonitoringPage;
