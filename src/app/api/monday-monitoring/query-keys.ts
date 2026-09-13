/** Kunci cache react-query untuk data Monday Monitoring lama. */
export const mondayMonitoringKeys = {
  all: ["monday-monitoring"] as const,
  slaPerformance: (yearWeek: string, rekon: string) =>
    [...mondayMonitoringKeys.all, "sla-performance", yearWeek, rekon] as const,
  latestPlWeek: () =>
    [...mondayMonitoringKeys.all, "latest-pl-week"] as const,
  trendQuality: (kind: string, metric: string, scope: string) =>
    [...mondayMonitoringKeys.all, "trend-quality", kind, metric, scope] as const,
  ctiMonitoring: () => [...mondayMonitoringKeys.all, "cti-monitoring"] as const,
  rcaGrouping: () => [...mondayMonitoringKeys.all, "rca-grouping"] as const,
  rpjBenchmark: () => [...mondayMonitoringKeys.all, "rpj-benchmark"] as const,
  baselinePerformance: () =>
    [...mondayMonitoringKeys.all, "baseline-performance"] as const,
  baselineTrend: () => [...mondayMonitoringKeys.all, "baseline-trend"] as const,
  ctiTransitDetail: (transit: string, verifier: string, range: string) =>
    [...mondayMonitoringKeys.all, "cti-transit-detail", transit, verifier, range] as const,
  onxSummary: () => [...mondayMonitoringKeys.all, "onx-summary"] as const,
  onxDetail: (region: string, provider: string, code: string) =>
    [...mondayMonitoringKeys.all, "onx-detail", region, provider, code] as const,
  slaDrilldown: (kind: string, region: string, level: string) =>
    [...mondayMonitoringKeys.all, "sla-drilldown", kind, region, level] as const,
};
