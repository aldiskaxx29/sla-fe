import { useState } from "react";
import { toast } from "react-toastify";

import { SampleDataBadge } from "@/app/components/molecules/SampleDataBadge";

import { TicketTrendAchievementChart } from "@/app/components/organisms/charts/TicketTrendAchievementChart";
import type { TicketTrendSeriesKey } from "@/app/components/organisms/charts/TicketTrendAchievementChart";
import { TicketQualityToolbar } from "@/app/components/organisms/forms/TicketQualityToolbar";
import { TicketAchievementDistributionPanel } from "@/app/components/organisms/panels/TicketAchievementDistributionPanel";
import { TicketHighestTtrPanel } from "@/app/components/organisms/panels/TicketHighestTtrPanel";
import { TicketHighlightSummaryPanel } from "@/app/components/organisms/panels/TicketHighlightSummaryPanel";
import { TicketSeverityMapPanel } from "@/app/components/organisms/panels/TicketSeverityMapPanel";
import { TicketRegionPerformanceTable } from "@/app/components/organisms/tables/TicketRegionPerformanceTable";
import { TicketRegionRankTable } from "@/app/components/organisms/tables/TicketRegionRankTable";

import TicketQualityTemplate from "@/app/components/templates/TicketQualityTemplate";

import {
  SAMPLE_TICKET_DISTRIBUTION,
  SAMPLE_TICKET_HIGHEST_TTR,
  SAMPLE_TICKET_HIGHLIGHT,
  SAMPLE_TICKET_LAST_UPDATED,
  SAMPLE_TICKET_MAP,
  SAMPLE_TICKET_REGION_PERFORMANCE,
  SAMPLE_TICKET_TREND,
  TICKET_AREA_OPTIONS,
  TICKET_COMPARISON_OPTIONS,
  TICKET_PERIOD_OPTIONS,
} from "@/app/api/ticket";
import type {
  TicketAccessType,
  TicketSeverityFilter,
} from "@/app/types/ticket/ticketQuality.types";

const TicketQualityPage = () => {
  const [accessType, setAccessType] = useState<TicketAccessType>("fo");
  const [comparison, setComparison] = useState(
    TICKET_COMPARISON_OPTIONS[0].value,
  );
  const [area, setArea] = useState(TICKET_AREA_OPTIONS[0].value);
  const [period, setPeriod] = useState(TICKET_PERIOD_OPTIONS[0].value);

  const [mapSeverity, setMapSeverity] = useState<TicketSeverityFilter>("all");
  const [regionSeverity, setRegionSeverity] =
    useState<TicketSeverityFilter>("critical");
  const [trendSeverity, setTrendSeverity] =
    useState<TicketSeverityFilter>("all");
  const [distributionSeverity, setDistributionSeverity] =
    useState<TicketSeverityFilter>("all");

  const [visibleSeries, setVisibleSeries] = useState<TicketTrendSeriesKey[]>([
    "jawa",
    "nonJawa",
  ]);

  const toggleSeries = (key: TicketTrendSeriesKey) =>
    setVisibleSeries((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );

  const handleExport = () =>
    toast.info("Export Ticket Quality belum tersedia.");

  return (
    <TicketQualityTemplate
      toolbar={
        <div className="flex flex-col gap-2">
          <TicketQualityToolbar
            accessType={accessType}
            comparison={comparison}
            area={area}
            period={period}
            lastUpdated={SAMPLE_TICKET_LAST_UPDATED}
            onAccessTypeChange={setAccessType}
            onComparisonChange={setComparison}
            onAreaChange={setArea}
            onPeriodChange={setPeriod}
            onExport={handleExport}
          />
          <div className="flex">
            <SampleDataBadge />
          </div>
        </div>
      }
      highlight={
        <>
          <TicketHighlightSummaryPanel groups={SAMPLE_TICKET_HIGHLIGHT.groups} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TicketRegionRankTable
              title="Best 5 Regions"
              tone="best"
              rows={SAMPLE_TICKET_HIGHLIGHT.bestRegions}
            />
            <TicketRegionRankTable
              title="Worst 5 Regions"
              tone="worst"
              rows={SAMPLE_TICKET_HIGHLIGHT.worstRegions}
            />
          </div>
        </>
      }
      overview={
        <>
          <TicketSeverityMapPanel
            data={SAMPLE_TICKET_MAP}
            severity={mapSeverity}
            onSeverityChange={setMapSeverity}
          />

          <TicketRegionPerformanceTable
            rows={SAMPLE_TICKET_REGION_PERFORMANCE}
            severity={regionSeverity}
            onSeverityChange={setRegionSeverity}
          />
        </>
      }
      analysis={
        <>
          <TicketHighestTtrPanel data={SAMPLE_TICKET_HIGHEST_TTR} />

          <TicketTrendAchievementChart
            points={SAMPLE_TICKET_TREND}
            severity={trendSeverity}
            visibleSeries={visibleSeries}
            onSeverityChange={setTrendSeverity}
            onToggleSeries={toggleSeries}
          />

          <TicketAchievementDistributionPanel
            data={SAMPLE_TICKET_DISTRIBUTION}
            severity={distributionSeverity}
            onSeverityChange={setDistributionSeverity}
          />
        </>
      }
    />
  );
};

export default TicketQualityPage;
