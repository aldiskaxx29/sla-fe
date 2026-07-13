import { useCallback, useEffect, useRef, useState } from "react";

import type { IApiResponseBase } from "@/app/interfaces/app-api.interface";
import { axios } from "@/plugins/axios";

import {
  DailyMonitoringPacketLossResponse,
  DailyMonitoringPacketLossDetailResponse,
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
const PACKET_LOSS_ENDPOINT = "daily-monitoring/pl-quality-cnop";
const PACKET_LOSS_DETAIL_ENDPOINT = "daily-monitoring/pl-quality-cnop/detail";

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

const toTrafficLightLevel = (value: string): MttrQualityLevel | PacketLossLevel => {
  const percent = parsePercent(value);

  if (percent >= 96) return "good";
  if (percent >= 75) return "warning";
  return "danger";
};

const toAchievementLevel = (
  achievement: DailyMonitoringSummaryResponse["summary_table"]["total"]["achievement"]
): MttrQualityLevel => {
  return toTrafficLightLevel(achievement.ach);
};

const toPacketLossLevel = (ach: string): PacketLossLevel => {
  return toTrafficLightLevel(ach);
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
    achLevel: toAchievementLevel(row.achievement),
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
  const summaryRows =
    response.summary_rows?.map((row) => ({
      ticketId: String(row.ticket_id ?? ""),
      regionTsel: String(row.region_tsel ?? ""),
      status: String(row.status ?? ""),
      area: String(row.area ?? ""),
      ttrCustomerDecimal: String(row.ttr_customer_decimal ?? ""),
      network: String(row.network ?? ""),
      sitegroup: String(row.sitegroup ?? ""),
      regtsel: String(row.regtsel ?? ""),
      statusPersen: String(row.status_persen ?? ""),
    })) ?? [];

  return {
    reportDate: response.tanggal,
    totalTickets: Number(response.total_tickets) || 0,
    rows: [...rows, mapTotalRow(response.summary_table.total)],
    summaryRows,
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
    downloadType: isTotalRow ? "total" : labelKey,
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
    downloadType: "total",
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
        downloadType: undefined,
        isSpacerRow: true,
      },
      ...areaRows,
      totalRow,
    ],
  };
};

const normalizeDailyMonitoringPacketLossDetail = (
  response: DailyMonitoringPacketLossDetailResponse,
  pl: PacketLossDetailKey,
): DailyMonitoringPacketLossView => {
  const nested = response[pl];

  if (!nested) {
    return {
      title: response.title,
      section: response.section,
      date: response.date,
      time: response.time,
      rows: [],
    };
  }

  const nestedView = normalizeDailyMonitoringPacketLoss(nested);

  return {
    ...nestedView,
    title: response.title,
    section: response.section,
    date: response.date,
    time: response.time,
  };
};

type PacketLossMode = "combined" | "split";
type PacketLossDetailKey = "p5" | "p15";

type DailyMonitoringPacketLossData = {
  combined?: DailyMonitoringPacketLossView;
  split?: Record<PacketLossDetailKey, DailyMonitoringPacketLossView>;
};

const fetchPacketLossView = async (
  pl?: PacketLossDetailKey
): Promise<DailyMonitoringPacketLossView> => {
  const response = await axios<IApiResponseBase>(pl ? PACKET_LOSS_DETAIL_ENDPOINT : PACKET_LOSS_ENDPOINT, "get", {
    ...(pl ? { params: { pl } } : {}),
  });

  const payload = response.result as
    | DailyMonitoringPacketLossResponse
    | DailyMonitoringPacketLossDetailResponse;

  if (pl) {
    return normalizeDailyMonitoringPacketLossDetail(
      payload as DailyMonitoringPacketLossDetailResponse,
      pl,
    );
  }

  return normalizeDailyMonitoringPacketLoss(payload as DailyMonitoringPacketLossResponse);
};

const useDailyMonitoringSummary = () => {
  const [data, setData] = useState<DailyMonitoringSummaryView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // const response = await fetch(SUMMARY_ENDPOINT, {
      //   method: "GET",
      //   headers: {
      //     Accept: "application/json",
      //   },
      // });
      const token = localStorage.getItem('access_token');
      console.log('token', token)
      const response = await fetch(SUMMARY_ENDPOINT, {
            method: "GET",
            headers: {
            Accept: "application/json",
            "Authorization": `Bearer ${token}`  // <-- TAMBAHKAN INI
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

const useDailyMonitoringPacketLoss = (mode: PacketLossMode = "combined") => {
  const [data, setData] = useState<DailyMonitoringPacketLossData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  const fetchPacketLoss = useCallback(async () => {
    const requestSeq = requestSeqRef.current + 1;
    requestSeqRef.current = requestSeq;
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "split") {
        const [p5, p15] = await Promise.all([
          fetchPacketLossView("p5"),
          fetchPacketLossView("p15"),
        ]);

        if (requestSeqRef.current !== requestSeq) return;
        setData({
          split: {
            p5,
            p15,
          },
        });
        return;
      }

      const combined = await fetchPacketLossView();
      if (requestSeqRef.current !== requestSeq) return;
      setData({
        combined,
      });
    } catch (fetchError) {
      if (requestSeqRef.current !== requestSeq) return;
      setData(null);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Gagal memuat data Packet Loss."
      );
    } finally {
      if (requestSeqRef.current === requestSeq) {
        setIsLoading(false);
      }
    }
  }, [mode]);

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
