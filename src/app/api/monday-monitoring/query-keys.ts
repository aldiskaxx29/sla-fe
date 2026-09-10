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
  rpjBenchmark: () => [...mondayMonitoringKeys.all, "rpj-benchmark"] as const,
  ctiTransitDetail: (transit: string, verifier: string, range: string) =>
    [...mondayMonitoringKeys.all, "cti-transit-detail", transit, verifier, range] as const,
  slaDrilldown: (kind: string, region: string, level: string) =>
    [...mondayMonitoringKeys.all, "sla-drilldown", kind, region, level] as const,
};
