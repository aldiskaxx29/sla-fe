/**
 * Kunci cache react-query untuk modul FBB. Dipusatkan supaya invalidasi tidak
 * perlu menebak bentuk key-nya.
 */
export const fbbKeys = {
  all: ["fbb"] as const,
  yearWeek: () => [...fbbKeys.all, "year-week"] as const,
  slaWsa: (yearweek: string | null) =>
    [...fbbKeys.all, "sla-wsa", yearweek] as const,
  /** Isi dropdown filter halaman ONX benchmark. */
  options: (name: string) => [...fbbKeys.all, "options", name] as const,
  nationMetrics: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "onx", "nation-metrics-kpi", params] as const,
  ooklaNationMetrics: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "ookla", "nation-metrics-kpi", params] as const,
  ooklaMapRegionStatus: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "ookla", "maps-region-status", params] as const,
  ooklaLoseRegionKabupaten: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "ookla", "lose-region-kabupaten", params] as const,
  mapRegionStatus: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "onx", "maps-region-status", params] as const,
  loseRegionKabupaten: (params: Record<string, unknown>) =>
    [...fbbKeys.all, "onx", "lose-region-kabupaten", params] as const,
};
