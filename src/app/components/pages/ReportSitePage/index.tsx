import { useMemo, useState } from "react";

import {
  useDownloadReportSiteEvidenceMutation,
  useMttrqReportQuery,
  useReportSiteDetailQuery,
  useReportSiteProfilingQuery,
} from "@/app/hooks";

import ReportSiteTemplate from "@/app/components/templates/ReportSiteTemplate";

import ReportSiteFilterBar from "@/app/components/organisms/forms/ReportSiteFilterBar";
import MttrqIssueDetailModal from "@/app/components/organisms/popup/MttrqIssueDetailModal";
import ReportSiteDetailModal from "@/app/components/organisms/popup/ReportSiteDetailModal";
import MttrqResumeChart from "@/app/components/organisms/charts/MttrqResumeChart";
import MttrqActionPlanTable from "@/app/components/organisms/tables/MttrqActionPlanTable";
import MttrqDetailIssueTable from "@/app/components/organisms/tables/MttrqDetailIssueTable";
import ReportSiteProfilingTable from "@/app/components/organisms/tables/ReportSiteProfilingTable";

import { isMttrqParameter } from "@/app/api";
import {
  buildReportSiteYearOptions,
  MTTRQ_DESCRIPTION,
} from "@/app/config/reportSite.config";
import { DEFAULT_PARAMETER } from "@/app/config/rekonsiliasi.config";

import type {
  ReportSiteDetailParams,
  ReportSiteProfilingRow,
} from "@/app/types/site/reportSite.types";

/** Minggu tidak dipilih di UI, backend tetap butuh nilainya. */
const DEFAULT_WEEK = "1";

const ReportSitePage = () => {
  const [parameter, setParameter] = useState<string>(DEFAULT_PARAMETER);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [detail, setDetail] = useState<ReportSiteDetailParams | null>(null);

  const isMttrq = isMttrqParameter(parameter);
  const yearOptions = useMemo(buildReportSiteYearOptions, []);

  const baseParams = { parameter, week: DEFAULT_WEEK, month, year };

  const profiling = useReportSiteProfilingQuery(baseParams);
  const mttrq = useMttrqReportQuery(baseParams);
  const detailQuery = useReportSiteDetailQuery(detail);
  const exportMutation = useDownloadReportSiteEvidenceMutation();

  const openDetail = (region: string, statusSite: string) =>
    setDetail({ ...baseParams, region, statusSite });

  return (
    <ReportSiteTemplate
      toolbar={
        <ReportSiteFilterBar
          parameter={parameter}
          month={month}
          year={year}
          yearOptions={yearOptions}
          onParameterChange={setParameter}
          onMonthChange={setMonth}
          onYearChange={setYear}
          onExport={() => exportMutation.mutate(baseParams)}
          isExporting={exportMutation.isPending}
        />
      }
      description={isMttrq ? MTTRQ_DESCRIPTION : undefined}
    >
      {isMttrq ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <MttrqResumeChart
              data={mttrq.data?.resume ?? []}
              loading={mttrq.isFetching}
              error={mttrq.isError}
            />

            <MttrqDetailIssueTable
              rows={mttrq.data?.detailRows ?? []}
              loading={mttrq.isFetching}
              error={mttrq.isError}
              onCellClick={openDetail}
            />
          </div>

          <MttrqActionPlanTable
            rows={mttrq.data?.actionPlan ?? []}
            loading={mttrq.isFetching}
            error={mttrq.isError}
          />
        </div>
      ) : (
        <ReportSiteProfilingTable
          rows={profiling.data?.rows ?? []}
          loading={profiling.isFetching}
          error={profiling.isError}
          onCellClick={(row: ReportSiteProfilingRow, statusSite: string) =>
            openDetail(String(row.region_tsel ?? ""), statusSite)
          }
        />
      )}

      {isMttrq ? (
        <MttrqIssueDetailModal
          open={Boolean(detail)}
          title={
            detail ? `${detail.region} - ${detail.statusSite}` : "Detail Issue"
          }
          rows={detailQuery.data ?? []}
          loading={detailQuery.isFetching}
          error={detailQuery.isError}
          onClose={() => setDetail(null)}
        />
      ) : (
        <ReportSiteDetailModal
          open={Boolean(detail)}
          parameter={parameter}
          region={detail?.region}
          statusSite={detail?.statusSite}
          rows={detailQuery.data ?? []}
          loading={detailQuery.isFetching}
          error={detailQuery.isError}
          onClose={() => setDetail(null)}
        />
      )}
    </ReportSiteTemplate>
  );
};

export default ReportSitePage;
