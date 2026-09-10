// React Query
import { useQuery } from "@tanstack/react-query";

// Api
import {
  getCoreTransitDetail,
  getMttrTickets,
  getSiteDetailRegion,
  mondayMonitoringKeys,
} from "@/app/api";

// Types
import type {
  SlaCardDetail,
  SlaDetailColumn,
  SlaDetailRow,
} from "@/app/types/monday/ticketQuality.types";

export interface SlaDrilldownResult {
  columns: SlaDetailColumn[];
  rows: SlaDetailRow[];
  statusKey?: string;
}

const dash = (value: unknown) =>
  value === undefined || value === null || value === "" ? "-" : String(value);

/** Sebagian teks dari API masih membawa tag HTML dan baris baru. */
const toPlainText = (value: unknown) =>
  dash(value)
    .replace(/<br\s*\/?>/gi, " · ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Nama region di file tiket berawalan kode, mis. "07-BALINUSRA". */
const normalizeRegion = (value?: string) =>
  String(value ?? "")
    .toUpperCase()
    .replace(/[\d-]/g, "")
    .replace(/\s+/g, "")
    .trim();

const SITE_COLUMNS: SlaDetailColumn[] = [
  { key: "no", label: "No", align: "center" },
  { key: "region", label: "Treg" },
  { key: "regionTsel", label: "Region" },
  { key: "witel", label: "Witel" },
  { key: "siteId", label: "Site ID" },
  { key: "value", label: "Value", align: "right" },
  { key: "rca", label: "RCA" },
  { key: "analisis", label: "Analisis" },
];

const TICKET_COLUMNS: SlaDetailColumn[] = [
  { key: "ticketId", label: "Ticket ID" },
  { key: "siteId", label: "Site ID" },
  { key: "witel", label: "Witel" },
  { key: "ttr", label: "TTR (jam)", align: "right" },
  { key: "status", label: "Status", align: "center" },
  { key: "reportedBy", label: "Reported By" },
  { key: "headline", label: "Trouble Headline" },
];

const TRANSIT_COLUMNS: SlaDetailColumn[] = [
  { key: "transit", label: "Transit" },
  { key: "treg", label: "Treg", align: "center" },
  { key: "plBtc", label: "PL BTC", align: "right" },
  { key: "plBds", label: "PL BDS", align: "right" },
  { key: "jitterBtc", label: "Jitter BTC", align: "right" },
  { key: "jitterBds", label: "Jitter BDS", align: "right" },
  { key: "latBtc", label: "Lat BTC", align: "right" },
  { key: "latBds", label: "Lat BDS", align: "right" },
  { key: "latPnk", label: "Lat PNK", align: "right" },
];

/**
 * Rincian lanjutan saat satu baris popup diklik: daftar site, tiket MTTR,
 * atau nilai per transit untuk region tersebut.
 */
export const useSlaDrilldownQuery = (
  detail: SlaCardDetail | null,
  region: string | null,
) => {
  const drilldown = detail?.drilldown;

  return useQuery<SlaDrilldownResult>({
    queryKey: mondayMonitoringKeys.slaDrilldown(
      drilldown?.kind ?? "",
      region ?? "",
      drilldown?.level ?? drilldown?.distributionPl ?? "",
    ),
    enabled: Boolean(drilldown && region),
    staleTime: 60 * 1000,
    retry: false,
    queryFn: async ({ signal }) => {
      const currentRegion = region as string;

      if (drilldown?.kind === "mttr-ticket") {
        const tickets = await getMttrTickets(signal);
        const target = normalizeRegion(currentRegion);

        return {
          columns: TICKET_COLUMNS,
          statusKey: "status",
          rows: tickets
            .filter((row) => normalizeRegion(row.region_tsel) === target)
            .map((row) => ({
              ticketId: dash(row.ticket_id),
              siteId: dash(row.site_id),
              witel: dash(row.witel),
              ttr: dash(row.ttr_customer_jam),
              status: dash(row.status),
              reportedBy: dash(row.reportedby),
              headline: toPlainText(row.trouble_headline),
            })),
        };
      }

      if (drilldown?.kind === "core-transit") {
        const transits = await getCoreTransitDetail(signal);
        const target = normalizeRegion(currentRegion);

        return {
          columns: TRANSIT_COLUMNS,
          rows: transits
            .filter((row) => normalizeRegion(row.region_tsel) === target)
            .map((row) => ({
              transit: dash(row.transit),
              treg: dash(row.treg),
              plBtc: dash(row.packetloss_btc),
              plBds: dash(row.packetloss_bds),
              jitterBtc: dash(row.jitter_btc),
              jitterBds: dash(row.jitter_bds),
              latBtc: dash(row.latency_btc),
              latBds: dash(row.latency_bds),
              latPnk: dash(row.latency_pnk),
            })),
        };
      }

      const sites = await getSiteDetailRegion(
        {
          region: currentRegion,
          level: drilldown?.level ?? "packetloss",
          distributionPl: drilldown?.distributionPl,
        },
        signal,
      );

      return {
        columns: SITE_COLUMNS,
        rows: sites.map((row, index) => ({
          no: index + 1,
          region: dash(row.region),
          regionTsel: dash(row.region_tsel),
          witel: dash(row.witel),
          siteId: dash(row.site_id),
          value: dash(row.value),
          rca: dash(row.rca),
          analisis: toPlainText(row.analisis),
        })),
      };
    },
  });
};
