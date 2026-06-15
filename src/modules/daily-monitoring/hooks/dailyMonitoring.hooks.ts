import { useCallback, useEffect, useState } from "react";

import {
  DailyMonitoringSummaryResponse,
  DailyMonitoringSummaryView,
  MttrQualityLevel,
  MttrQualityRow,
} from "../types";

const DAILY_MONITORING_API_BASE_URL =
  import.meta.env.VITE_DAILY_MONITORING_API_BASE_URL ||
  "/daily-monitoring-api";

const SUMMARY_ENDPOINT = `${DAILY_MONITORING_API_BASE_URL}/api_summary_monitor.php`;

const formatNumber = (value: number | string | null | undefined) =>
  String(value ?? "");

const formatTriple = (...values: Array<number | string | null | undefined>) =>
  values.map(formatNumber).join(" | ");

const formatSlash = (...values: Array<number | string | null | undefined>) =>
  values.map(formatNumber).join("/");

const parsePercent = (value: string) => {
  const numeric = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(numeric) ? numeric : 0;
};

const toAchievementLevel = (
  achievement: DailyMonitoringSummaryResponse["summary_table"]["total"]["achievement"]
): MttrQualityLevel => {
  const ta = parsePercent(achievement.ta);
  const pst = parsePercent(achievement.pst);

  return ta >= 100 && pst >= 100 ? "good" : "danger";
};

const mapRow = (
  row: DailyMonitoringSummaryResponse["summary_table"]["data"][number]
): MttrQualityRow => {
  return {
    no: formatNumber(row.no),
    area: row.area,
    reg: row.reg,
    openFoRip: formatTriple(row.open.total, row.open.fo, row.open.rip),
    kuningMerah96Jam: formatSlash(
      row.aging.kuning,
      row.aging.merah,
      row.aging.gt_96_jam
    ),
    closingTicketH1: formatNumber(row.closing_ticket.h_minus_1),
    closingTicketH: formatNumber(row.closing_ticket.h),
    doneTaPst: formatTriple(row.done.ta, row.done.pst),
    achTaPst: formatTriple(
      row.achievement.ach,
      row.achievement.ta,
      row.achievement.pst
    ),
    achLevel: toAchievementLevel({
      ta: row.achievement.ta,
      pst: row.achievement.pst,
    }),
  };
};

const mapTotalRow = (
  total: DailyMonitoringSummaryResponse["summary_table"]["total"]
): MttrQualityRow => {
  return {
    no: "",
    area: "Total",
    reg: "",
    openFoRip: formatTriple(total.open.total, total.open.fo, total.open.rip),
    kuningMerah96Jam: formatSlash(
      total.aging.kuning,
      total.aging.merah,
      total.aging.gt_96_jam
    ),
    closingTicketH1: formatNumber(total.closing_ticket.h_minus_1),
    closingTicketH: formatNumber(total.closing_ticket.h),
    doneTaPst: formatTriple(total.done.ta, total.done.pst),
    achTaPst: formatTriple(
      total.achievement.ach,
      total.achievement.ta,
      total.achievement.pst
    ),
    achLevel: toAchievementLevel(total.achievement),
  };
};

const normalizeDailyMonitoringSummary = (
  response: DailyMonitoringSummaryResponse
): DailyMonitoringSummaryView => {
  const rows = response.summary_table?.data?.map(mapRow) ?? [];

  return {
    reportDate: response.tanggal,
    totalTickets: Number(response.total_tickets) || 0,
    rows: [...rows, mapTotalRow(response.summary_table.total)],
  };
};

const useDailyMonitoringSummary = () => {
  const [data, setData] = useState<DailyMonitoringSummaryView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(SUMMARY_ENDPOINT, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json = (await response.json()) as DailyMonitoringSummaryResponse;
      setData(normalizeDailyMonitoringSummary(json));
    } catch (fetchError) {
      setData(null);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Gagal memuat data MTTRQ."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return {
    data,
    error,
    fetchSummary,
    isLoading,
  };
};

export { useDailyMonitoringSummary };
