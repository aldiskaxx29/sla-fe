export const networkKeys = {
  all: ["network"] as const,
  peHsiPivot: (params: Record<string, unknown>) =>
    [...networkKeys.all, "pe-hsi", "pivot", params] as const,
  peHsiPerformanceLink: (params: Record<string, unknown>) =>
    [...networkKeys.all, "pe-hsi", "performance-link", params] as const,
  peHsiDateTime: () => [...networkKeys.all, "pe-hsi", "date-time"] as const,
  peHsiListPe: () => [...networkKeys.all, "pe-hsi", "list-pe"] as const,
  peHsiTrend: (params: Record<string, unknown>) =>
    [...networkKeys.all, "pe-hsi", "trend-summary", params] as const,
  peHsiTrendVerifier: (params: Record<string, unknown>) =>
    [...networkKeys.all, "pe-hsi", "trend-verifier", params] as const,
};
