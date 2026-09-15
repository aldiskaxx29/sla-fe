export const firstInsightKeys = {
  all: ["first-insight"] as const,
  highlightSummary: () =>
    [...firstInsightKeys.all, "highlight-summary"] as const,
  trend: () => [...firstInsightKeys.all, "trend-kpi-not-clear"] as const,
  table: (params: Record<string, unknown>) =>
    [...firstInsightKeys.all, "table", params] as const,
};
