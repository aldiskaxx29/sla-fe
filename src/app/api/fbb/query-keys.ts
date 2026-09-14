export const fbbKeys = {
  all: ["fbb"] as const,
  yearWeek: () => [...fbbKeys.all, "year-week"] as const,
  slaWsa: (yearweek: string | null) =>
    [...fbbKeys.all, "sla-wsa", yearweek] as const,
  options: (name: string) => [...fbbKeys.all, "options", name] as const,
  nationMetrics: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "onx", "nation-metrics-kpi", params] as const,
  ooklaNationMetrics: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "ookla", "nation-metrics-kpi", params] as const,
  ooklaMapRegionStatus: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "ookla", "maps-region-status", params] as const,
  ooklaLoseRegion: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "ookla", "lose-region", params] as const,
  ooklaLoseRegionKabupaten: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "ookla", "lose-region-kabupaten", params] as const,
  mapRegionStatus: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "onx", "maps-region-status", params] as const,
  loseRegion: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "onx", "lose-region", params] as const,
  loseRegionKabupaten: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "onx", "lose-region-kabupaten", params] as const,
};
