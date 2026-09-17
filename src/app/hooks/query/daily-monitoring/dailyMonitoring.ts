import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import {
  dailyMonitoringKeys,
  downloadDailyMonitoringPacketLoss,
  getDailyMonitoringPacketLoss,
  getDailyMonitoringPacketLossDetail,
  getDailyMonitoringSites,
  getDailyMonitoringSummary,
} from "@/app/api";

import type {
  DailyMonitoringDownloadParams,
  DailyMonitoringPacketLossView,
  DailyMonitoringSiteParams,
  DailyMonitoringSiteRow,
  DailyMonitoringSummaryView,
  PacketLossDetailKey,
} from "@/app/types/daily-monitoring/dailyMonitoring.types";
import {
  toDailyMonitoringSummaryView,
  toPacketLossDetailView,
  toPacketLossView,
} from "@/app/utils/dailyMonitoring.utils";

const DATA_STALE_TIME = 5 * 60 * 1000;

export const useDailyMonitoringSummaryQuery = () =>
  useQuery({
    queryKey: dailyMonitoringKeys.summary(),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getDailyMonitoringSummary(signal),
    select: (response): DailyMonitoringSummaryView =>
      toDailyMonitoringSummaryView(response),
  });

/**
 * Tanpa `pl` tabelnya gabungan; dengan `pl` isinya khusus PL 5% atau PL 1-5%
 * dan dipakai saat mode split.
 */
export const useDailyMonitoringPacketLossQuery = (
  pl?: PacketLossDetailKey,
  enabled = true,
) =>
  useQuery({
    queryKey: dailyMonitoringKeys.packetLoss({ pl: pl ?? "combined" }),
    enabled,
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      pl
        ? getDailyMonitoringPacketLossDetail(pl, signal)
        : getDailyMonitoringPacketLoss(signal),
    select: (response): DailyMonitoringPacketLossView =>
      pl
        ? toPacketLossDetailView(response, pl)
        : toPacketLossView(response),
  });

export const useDailyMonitoringSitesQuery = (
  params: DailyMonitoringSiteParams | null,
) =>
  useQuery({
    queryKey: dailyMonitoringKeys.sites({ ...params }),
    enabled: Boolean(params?.value),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) =>
      getDailyMonitoringSites(params as DailyMonitoringSiteParams, signal),
    select: (response): DailyMonitoringSiteRow[] =>
      Array.isArray(response) ? response : [],
  });

const triggerBlobDownload = (blob: Blob, fileName: string) => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

/** Unduh Excel Packet Loss: tanpa `type` berarti seluruh tabel. */
export const useDailyMonitoringDownloadMutation = () =>
  useMutation({
    mutationFn: (params: DailyMonitoringDownloadParams) =>
      downloadDailyMonitoringPacketLoss(params),
    onSuccess: ({ blob, fileName }) => triggerBlobDownload(blob, fileName),
  });
