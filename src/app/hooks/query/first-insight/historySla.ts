import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  firstInsightKeys,
  getHistorySlaHighlightSummary,
  getHistorySlaTable,
  getHistorySlaTrend,
} from "@/app/api";

import type {
  HistorySlaIndicator,
  HistorySlaTableData,
  HistorySlaTableParams,
  HistorySlaTableRow,
  HistorySlaTrendPoint,
} from "@/app/types/first-insight/historySla.types";

const DATA_STALE_TIME = 5 * 60 * 1000;

const TARGET_KEY = "target";

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const toQuarterLabel = (key: string) =>
  key
    .split("_")
    .map((part, index) => (index === 0 ? part.toUpperCase() : part))
    .join(" ");

const toMonthLabel = (key: string) => {
  const [prefix, month = ""] = key.split("_");
  return `${prefix.toUpperCase()} ${capitalize(month)}`;
};

const parsePercent = (value?: string) => {
  const numeric = Number(String(value ?? "").replace("%", "").replace(",", "."));
  return Number.isFinite(numeric) ? numeric : null;
};

const isAchieved = (value: string, target: string) => {
  const actual = parsePercent(value);
  const expected = parsePercent(target);

  return actual === null || expected === null || actual >= expected;
};

const toIndicator = (
  row: HistorySlaTableRow,
  quarterKeys?: string[],
): HistorySlaIndicator => {
  const achievement = row.achievement ?? {};
  const keys = quarterKeys?.length ? quarterKeys : Object.keys(achievement);

  return {
    no: row.no,
    category: row.kpi_category,
    indicator: row.performance_indicator,
    threshold: row.threshold,
    quarters: keys.map((key) => {
      const quarter = achievement[key] ?? {};
      const target = quarter[TARGET_KEY] ?? "-";

      return {
        key,
        label: toQuarterLabel(key),
        target,
        months: Object.keys(quarter)
          .filter((monthKey) => monthKey !== TARGET_KEY)
          .map((monthKey) => ({
            key: monthKey,
            label: toMonthLabel(monthKey),
            value: quarter[monthKey] ?? "-",
            achieved: isAchieved(quarter[monthKey], target),
          })),
      };
    }),
  };
};

export const useHistorySlaHighlightSummaryQuery = () =>
  useQuery({
    queryKey: firstInsightKeys.highlightSummary(),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getHistorySlaHighlightSummary(signal),
    select: (response) => response.data,
  });

export const useHistorySlaTrendQuery = () =>
  useQuery({
    queryKey: firstInsightKeys.trend(),
    staleTime: DATA_STALE_TIME,
    queryFn: ({ signal }) => getHistorySlaTrend(signal),
    select: (
      response,
    ): { points: HistorySlaTrendPoint[]; activeMonth?: string } => {
      const period = response.meta?.period ?? "";

      return {
        activeMonth: response.meta?.active_month,
        points: (response.data?.monthly ?? []).map((item) => ({
          ...item,
          breakdown: item.breakdown ?? [],
          period: period ? `${item.month} ${period}` : item.month,
        })),
      };
    },
  });

export const useHistorySlaTableQuery = (params: HistorySlaTableParams) =>
  useQuery({
    queryKey: firstInsightKeys.table({ ...params }),
    staleTime: DATA_STALE_TIME,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getHistorySlaTable(params, signal),
    select: (response): HistorySlaTableData => ({
      rows: (response.data ?? []).map((row) =>
        toIndicator(row, response.meta?.columns?.quarters),
      ),
      categoryOptions: response.options?.kpi_category ?? [],
      meta: response.meta,
    }),
  });
