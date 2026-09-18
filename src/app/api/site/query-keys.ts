export const reportSiteKeys = {
  all: ["report-site"] as const,
  profiling: (params: Record<string, unknown>) =>
    [...reportSiteKeys.all, "profiling", params] as const,
  mttrq: (params: Record<string, unknown>) =>
    [...reportSiteKeys.all, "mttrq", params] as const,
  detail: (params: Record<string, unknown>) =>
    [...reportSiteKeys.all, "detail", params] as const,
};
