import { useCallback, useEffect, useState } from "react";

import { axios } from "@/plugins/axios";

import {
  DailyMonitoringPacketLossResponse,
  DailyMonitoringPacketLossView,
  DailyMonitoringSummaryResponse,
  DailyMonitoringSummaryView,
  MttrQualityLevel,
  MttrQualityRow,
  PacketLossLevel,
  PacketLossRow,
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

const toPacketLossLevel = (ach: string): PacketLossLevel => {
  const numeric = Number(String(ach).replace("%", "").replace(",", "."));
  return Number.isFinite(numeric) && numeric >= 100 ? "good" : "danger";
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

const mapPacketLossRow = (
  row: DailyMonitoringPacketLossResponse["regions"][number] | DailyMonitoringPacketLossResponse["areas"][number],
  labelKey: "region" | "area",
  isTotalRow = false
): PacketLossRow => {
  const label = row[labelKey];

  return {
    no: isTotalRow ? "" : String(row.no ?? ""),
    region: isTotalRow ? "TOTAL" : String(label ?? ""),
    target: String(row.target ?? ""),
    siteDegradeH1: String(row.site_degrade_h1 ?? ""),
    siteDegradeH: String(row.site_degrade_h ?? ""),
    clear: String(row.clear ?? ""),
    growth: String(row.growth ?? ""),
    notClear: String(row.not_clear ?? ""),
    ach: String(row.ach ?? ""),
    remark: String(row.remark ?? ""),
    achLevel: toPacketLossLevel(String(row.ach ?? "")),
    isSpacerRow: false,
    isTotalRow,
  };
};

const normalizeDailyMonitoringPacketLoss = (
  response: DailyMonitoringPacketLossResponse
): DailyMonitoringPacketLossView => {
  const regionRows = response.regions?.map((row) => mapPacketLossRow(row, "region")) ?? [];
  const areaRows = response.areas?.map((row) => mapPacketLossRow(row, "area")) ?? [];
  const totalRow: PacketLossRow = {
    no: "",
    region: "TOTAL",
    target: String(response.total.target ?? ""),
    siteDegradeH1: String(response.total.site_degrade_h1 ?? ""),
    siteDegradeH: String(response.total.site_degrade_h ?? ""),
    clear: String(response.total.clear ?? ""),
    growth: String(response.total.growth ?? ""),
    notClear: String(response.total.not_clear ?? ""),
    ach: String(response.total.ach ?? ""),
    remark: "",
    achLevel: toPacketLossLevel(String(response.total.ach ?? "")),
    isSpacerRow: false,
    isTotalRow: true,
  };

  return {
    title: response.title,
    section: response.section,
    date: response.date,
    time: response.time,
    rows: [
      ...regionRows,
      {
        no: "",
        region: "",
        target: "",
        siteDegradeH1: "",
        siteDegradeH: "",
        clear: "",
        growth: "",
        notClear: "",
        ach: "",
        remark: "",
        achLevel: "warning",
        isSpacerRow: true,
      },
      ...areaRows,
      totalRow,
    ],
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

const useDailyMonitoringPacketLoss = () => {
  const [data, setData] = useState<DailyMonitoringPacketLossView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPacketLoss = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios("daily-monitoring/pl-quality-cnop", "get", {});
      const payload = response.result as DailyMonitoringPacketLossResponse;
      setData(normalizeDailyMonitoringPacketLoss(payload));
    } catch (fetchError) {
      setData(null);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Gagal memuat data Packet Loss."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPacketLoss();
  }, [fetchPacketLoss]);

  return {
    data,
    error,
    fetchPacketLoss,
    isLoading,
  };
};

export { useDailyMonitoringPacketLoss, useDailyMonitoringSummary };
