import { useMemo, useState } from "react";

import {
  useActionPlanQuery,
  useMttrResumeQuery,
  useRcaNotClearChartQuery,
  useRcaNotClearDetailQuery,
  useRcaTicketDetailQuery,
  useResumeRcaFilter,
  useTopOldestTicketsQuery,
  useTrafficChartQuery,
  useTrafficNationalQuery,
  useTrafficTableQuery,
  useUploadReconProgressMutation,
} from "@/app/hooks";

import ResumeRcaTemplate from "@/app/components/templates/ResumeRcaTemplate";

import { SectionCard } from "@/app/components/molecules/SectionCard";

import ResumeRcaFilterBar from "@/app/components/organisms/forms/ResumeRcaFilterBar";
import MttrResumePanel from "@/app/components/organisms/panels/MttrResumePanel";
import RcaActionPlanPanel from "@/app/components/organisms/panels/RcaActionPlanPanel";
import ResumeRcaHighlightPanel from "@/app/components/organisms/panels/ResumeRcaHighlightPanel";
import RcaNotClearChart from "@/app/components/organisms/charts/RcaNotClearChart";
import RcaNotClearTable from "@/app/components/organisms/tables/RcaNotClearTable";
import ResumeRcaRegionTable from "@/app/components/organisms/tables/ResumeRcaRegionTable";
import TopOldestTicketTable from "@/app/components/organisms/tables/TopOldestTicketTable";
import RcaSiteDetailModal from "@/app/components/organisms/popup/RcaSiteDetailModal";
import RcaTicketDetailModal from "@/app/components/organisms/popup/RcaTicketDetailModal";
import ReconUploadModal from "@/app/components/organisms/popup/ReconUploadModal";

import type { RcaSiteRow } from "@/app/types/resume-rca/resumeRca.types";
import {
  buildRegionProgress,
  collectActionPlanSites,
  collectSites,
  collectSitesByStatus,
  sumTotalSites,
} from "@/app/utils/resumeRca.utils";

interface SitePopup {
  title: string;
  rows: RcaSiteRow[];
}

interface TicketPopup {
  region: string;
  rca: string;
  sitegroup: string;
  week: string;
}

const ResumeRcaPage = () => {
  const filter = useResumeRcaFilter();

  const [sitePopup, setSitePopup] = useState<SitePopup | null>(null);
  const [ticketPopup, setTicketPopup] = useState<TicketPopup | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const trafficParams = { mode: filter.parameter, week: filter.week };
  const enabledTraffic = !filter.isMttr;

  const nationalTotal = useTrafficNationalQuery(
    enabledTraffic ? trafficParams : { mode: filter.parameter, week: "" },
  );
  const trafficChart = useTrafficChartQuery(
    enabledTraffic ? trafficParams : { mode: filter.parameter, week: "" },
  );
  const trafficTable = useTrafficTableQuery(
    enabledTraffic ? trafficParams : { mode: filter.parameter, week: "" },
  );
  const actionPlan = useActionPlanQuery(
    enabledTraffic ? trafficParams : { mode: filter.parameter, week: "" },
  );

  /** MTTRq memakai sitegroup dari kata kedua parameter, mis. "MTTRq Major". */
  const sitegroup = filter.parameter.split(" ")[1] ?? "";
  const mttrParams = {
    sitegroup,
    week: filter.isMttr ? filter.week : "",
    weekStart: filter.weekStart,
    weekEnd: filter.weekEnd,
  };

  const mttrResume = useMttrResumeQuery(mttrParams);
  const notClearChart = useRcaNotClearChartQuery(mttrParams);
  const notClearDetail = useRcaNotClearDetailQuery(mttrParams);
  const topOldest = useTopOldestTicketsQuery({
    sitegroup,
    week: filter.isMttr ? filter.week : "",
  });

  const ticketDetail = useRcaTicketDetailQuery(ticketPopup);
  const uploadMutation = useUploadReconProgressMutation();

  const labels = trafficChart.data?.labels ?? [];
  const sites = trafficTable.data?.sites ?? {};

  const regionProgress = useMemo(
    () =>
      buildRegionProgress(
        {
          progress: trafficTable.data?.progress ?? {},
          sites,
        },
        labels,
      ),
    [labels, sites, trafficTable.data],
  );

  const handleTableCellClick = (region: string, rca: string) =>
    setSitePopup({
      title: `Site Not Clear - ${region}${rca ? ` / ${rca}` : ""}`,
      rows: collectSites(sites, region, rca),
    });

  const handleChartBarClick = (label: string, status: string) =>
    setSitePopup({
      title: `Site ${label} - ${status}`,
      rows: collectSitesByStatus(sites, label, status),
    });

  const handleActionPlanClick = ({
    rca,
    rca2,
    status,
  }: {
    rca: string;
    rca2: string;
    status: "OGP" | "CLOSED";
    region?: string;
  }) =>
    setSitePopup({
      title: `${rca}${rca2 ? ` / ${rca2}` : ""} - ${status}`,
      rows: collectActionPlanSites(sites, { rca, rca2, status }),
    });

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync(file);

      setUploadMessage({
        type: "success",
        text: result?.message ?? "File berhasil diunggah.",
      });
    } catch (error) {
      setUploadMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan koneksi saat mengunggah file.",
      });
    }
  };

  return (
    <ResumeRcaTemplate
      toolbar={
        <ResumeRcaFilterBar
          filter={filter}
          onUploadClick={() => {
            setUploadMessage(null);
            setIsUploadOpen(true);
          }}
        />
      }
    >
      {filter.isMttr ? (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <MttrResumePanel
              total={mttrResume.data?.total ?? 0}
              closed={mttrResume.data?.closed ?? 0}
              open={mttrResume.data?.open ?? 0}
              loading={mttrResume.isFetching}
              error={mttrResume.isError}
            />

            <RcaNotClearChart
              data={notClearChart.data ?? []}
              loading={notClearChart.isFetching}
              error={notClearChart.isError}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <TopOldestTicketTable
              rows={topOldest.data ?? []}
              loading={topOldest.isFetching}
              error={topOldest.isError}
            />

            <RcaNotClearTable
              data={notClearDetail.data ?? { totals: {}, detail: {} }}
              loading={notClearDetail.isFetching}
              error={notClearDetail.isError}
              onCellClick={(region, rca) =>
                setTicketPopup({
                  region,
                  rca,
                  sitegroup,
                  week: filter.week,
                })
              }
            />
          </div>
        </>
      ) : (
        <>
          <ResumeRcaHighlightPanel
            nationalTotal={nationalTotal.data ?? 0}
            labels={labels}
            ogp={trafficChart.data?.ogp ?? []}
            closed={trafficChart.data?.closed ?? []}
            loadingTotal={nationalTotal.isFetching}
            loadingChart={trafficChart.isFetching}
            error={trafficChart.isError}
            onBarClick={handleChartBarClick}
          />

          <SectionCard className="flex min-w-0 flex-col gap-3 p-4">
            <h2 className="text-base font-semibold text-[#020617]">
              Progress RCA per Region
            </h2>

            <ResumeRcaRegionTable
              labels={labels}
              progress={regionProgress}
              totalSites={sumTotalSites(sites)}
              loading={trafficTable.isFetching || trafficChart.isFetching}
              error={trafficTable.isError}
              onCellClick={handleTableCellClick}
            />
          </SectionCard>

          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-[#020617]">
              Action Plan &amp; Progress
            </h2>

            <RcaActionPlanPanel
              data={actionPlan.data ?? {}}
              loading={actionPlan.isFetching}
              error={actionPlan.isError}
              onCellClick={handleActionPlanClick}
            />
          </div>
        </>
      )}

      <RcaSiteDetailModal
        open={Boolean(sitePopup)}
        title={sitePopup?.title ?? "Detail Site"}
        rows={sitePopup?.rows ?? []}
        onClose={() => setSitePopup(null)}
      />

      <RcaTicketDetailModal
        open={Boolean(ticketPopup)}
        title={
          ticketPopup
            ? `${ticketPopup.region} - ${ticketPopup.rca}`
            : "Detail Ticket"
        }
        rows={ticketDetail.data ?? []}
        loading={ticketDetail.isFetching}
        error={ticketDetail.isError}
        onClose={() => setTicketPopup(null)}
      />

      <ReconUploadModal
        open={isUploadOpen}
        isLoading={uploadMutation.isPending}
        message={uploadMessage}
        onUpload={handleUpload}
        onClose={() => setIsUploadOpen(false)}
      />
    </ResumeRcaTemplate>
  );
};

export default ResumeRcaPage;
