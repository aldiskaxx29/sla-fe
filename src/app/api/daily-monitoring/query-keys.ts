export const dailyMonitoringKeys = {
  all: ["daily-monitoring"] as const,
  summary: () => [...dailyMonitoringKeys.all, "summary"] as const,
  packetLoss: (params: Record<string, unknown>) =>
    [...dailyMonitoringKeys.all, "packet-loss", params] as const,
  sites: (params: Record<string, unknown>) =>
    [...dailyMonitoringKeys.all, "sites", params] as const,
};
