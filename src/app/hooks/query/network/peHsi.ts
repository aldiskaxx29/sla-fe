import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getPeHsiDateTime,
  getPeHsiListPe,
  getPeHsiPeDetail,
  getPeHsiPerformanceLink,
  getPeHsiPivot,
  getPeHsiTrendSummary,
  getPeHsiTrendVerifier,
  networkKeys,
} from "@/app/api";

import type {
  PeHsiDetailParams,
  PeHsiGatewayPerformance,
  PeHsiLinkDetail,
  PeHsiParams,
  PeHsiPerformanceLink,
  PeHsiPivotArea,
  PeHsiTrendPoint,
  PeHsiTrendSummaryParams,
  PeHsiVerifierParams,
  PeHsiVerifierTrend,
} from "@/app/types/network/peHsi.types";
import type { PeHsiMetric, PeHsiPath } from "@/app/types/network/peHsi.types";

const DATA_STALE_TIME = 5 * 60 * 1000;
const LAST_UPDATED_STALE_TIME = 30 * 60 * 1000;

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Backend mengirim `"2026-09-17 10:00:00"`; dibaca sebagai waktu lokal supaya
 * jamnya tidak bergeser oleh zona waktu.
 */
export const usePeHsiLastUpdatedQuery = () =>
  useQuery({
    queryKey: networkKeys.peHsiDateTime(),
    staleTime: LAST_UPDATED_STALE_TIME,
    queryFn: ({ signal }) => getPeHsiDateTime(signal),
    select: (response): string => {
      const raw = response?.[0]?.datetime;

      if (!raw) return "";

      const parsed = new Date(raw.replace(" ", "T"));

      return Number.isNaN(parsed.getTime())
        ? raw
        : DATE_TIME_FORMATTER.format(parsed);
    },
  });

/** Daftar PE-HSI untuk dropdown popup; sumbernya endpoint `pe-hsi/list-pe`. */
export const usePeHsiListPeQuery = () =>
  useQuery({
    queryKey: networkKeys.peHsiListPe(),
    staleTime: LAST_UPDATED_STALE_TIME,
    queryFn: ({ signal }) => getPeHsiListPe(signal),
    select: (response): string[] =>
      (Array.isArray(response) ? response : [])
        .map((item) => item?.hostname ?? "")
        .filter(Boolean),
  });

/** Urutan gateway dibuat tetap supaya kartu Best Path tidak berubah-ubah. */
const BEST_PATH_ORDER: PeHsiPath[] = ["BTC", "PNK", "BDS", "JT2"];

const METRIC_BY_LABEL: Record<string, PeHsiMetric> = {
  "packet loss": "packetloss",
  latency: "latency",
  jitter: "jitter",
};

export const usePeHsiPerformanceLinkQuery = (params: PeHsiParams) =>
  useQuery({
    queryKey: networkKeys.peHsiPerformanceLink({ ...params }),
    enabled: Boolean(params.date),
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getPeHsiPerformanceLink(params, signal),
    select: (response): PeHsiPerformanceLink => {
      const bestPathEntries = Object.entries(response?.best_path ?? {});

      return {
        totalLink: response?.jumlah_link ?? 0,
        bestPath: bestPathEntries
          .map(([path, percentage]) => ({
            path: path as PeHsiPath,
            percentage,
          }))
          .sort(
            (a, b) =>
              BEST_PATH_ORDER.indexOf(a.path) - BEST_PATH_ORDER.indexOf(b.path),
          ),
        issueLink: response?.issue_link ?? 0,
        issueBreakdown: Object.entries(response?.breakdown ?? {}).map(
          ([label, total]) => ({
            metric:
              METRIC_BY_LABEL[label.toLowerCase()] ??
              (label.toLowerCase() as PeHsiMetric),
            label,
            total,
          }),
        ),
      };
    },
  });

export const usePeHsiPivotQuery = (params: PeHsiParams) =>
  useQuery({
    queryKey: networkKeys.peHsiPivot({ ...params }),
    enabled: Boolean(params.date),
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getPeHsiPivot(params, signal),
    select: (response): PeHsiPivotArea[] =>
      (Array.isArray(response) ? response : []).map((area) => ({
        ...area,
        items: area.items ?? [],
      })),
  });

export const usePeHsiTrendSummaryQuery = (params: PeHsiTrendSummaryParams) =>
  useQuery({
    queryKey: networkKeys.peHsiTrend({ ...params }),
    enabled: Boolean(params.date),
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getPeHsiTrendSummary(params, signal),
    select: (response): PeHsiTrendPoint[] =>
      (response?.categories ?? []).map((label, index) => ({
        label,
        value: response?.series?.[index] ?? 0,
        unachieved: response?.unachieved_list?.[index] ?? [],
      })),
  });

export const usePeHsiTrendVerifierQuery = (
  params: PeHsiVerifierParams,
  enabled = true,
) =>
  useQuery({
    queryKey: networkKeys.peHsiTrendVerifier({ ...params }),
    enabled: enabled && Boolean(params.date),
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getPeHsiTrendVerifier(params, signal),
    select: (response): PeHsiVerifierTrend[] =>
      Array.isArray(response) ? response : [],
  });

const isKnownPath = (value: string): value is PeHsiPath =>
  BEST_PATH_ORDER.includes(value as PeHsiPath);

/** Nama series datang sebagai `"BDS Latency"`, gateway-nya kata pertama. */
const toTrendGateway = (name: string) => name.trim().split(/\s+/)[0] ?? "";

export const usePeHsiPeDetailQuery = (
  params: PeHsiDetailParams,
  enabled = true,
) =>
  useQuery({
    queryKey: networkKeys.peHsiPeDetail({ ...params }),
    enabled: enabled && Boolean(params.date) && Boolean(params.peHsi),
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getPeHsiPeDetail(params, signal),
    select: (response): PeHsiLinkDetail => {
      const gateways: PeHsiGatewayPerformance[] = (response?.overview ?? [])
        .filter((item) => isKnownPath(String(item.gateway)))
        .map((item) => ({
          gateway: String(item.gateway) as PeHsiPath,
          latency_ms: item.latency ?? null,
          jitter_ms: item.jitter ?? null,
          packet_loss: item.packet_loss ?? 0,
          status: item.status ?? "-",
          kpi: item.kpi ?? "-",
        }));

      const bestGateway = gateways
        .filter((gateway) => gateway.latency_ms !== null)
        .sort((a, b) => (a.latency_ms ?? 0) - (b.latency_ms ?? 0))[0];

      const trend = response?.latency_trend;

      return {
        pe_hsi: params.peHsi,
        best_path: bestGateway?.gateway,
        best_path_status: bestGateway ? "OK" : "No Data",
        link_degrade: response?.link_degrade ?? 0,
        traceroute: [],
        gateways,
        latency_trend: {
          categories: trend?.categories ?? [],
          gateways: (trend?.series ?? [])
            .filter((series) => isKnownPath(toTrendGateway(series.name)))
            .map((series) => ({
              gateway: toTrendGateway(series.name) as PeHsiPath,
              series: (series.data ?? []).map((value) => Number(value) || 0),
            })),
        },
      };
    },
  });
