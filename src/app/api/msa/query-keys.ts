export const msaKeys = {
  all: ["msa"] as const,
  achievement: (params: Record<string, unknown>) =>
    [...msaKeys.all, "achievement", params] as const,
  region: (params: Record<string, unknown>) =>
    [...msaKeys.all, "region", params] as const,
  witel: (params: Record<string, unknown>) =>
    [...msaKeys.all, "witel", params] as const,
  trend: (params: Record<string, unknown>) =>
    [...msaKeys.all, "trend", params] as const,
  history: (params: Record<string, unknown>) =>
    [...msaKeys.all, "history", params] as const,
  comply: () => [...msaKeys.all, "comply"] as const,
  weeklyDetail: (params: Record<string, unknown>) =>
    [...msaKeys.all, "weekly-detail", params] as const,
  realisasi: (params: Record<string, unknown>) =>
    [...msaKeys.all, "realisasi", params] as const,
  siteWeek: (params: Record<string, unknown>) =>
    [...msaKeys.all, "site-week", params] as const,
};
