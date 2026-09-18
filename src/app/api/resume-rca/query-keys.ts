export const resumeRcaKeys = {
  all: ["resume-rca"] as const,
  lastWeek: (isMttr: boolean) => [...resumeRcaKeys.all, "last-week", isMttr] as const,
  nationalTotal: (params: Record<string, unknown>) =>
    [...resumeRcaKeys.all, "national-total", params] as const,
  trafficTable: (params: Record<string, unknown>) =>
    [...resumeRcaKeys.all, "traffic-table", params] as const,
  trafficChart: (params: Record<string, unknown>) =>
    [...resumeRcaKeys.all, "traffic-chart", params] as const,
  actionPlan: (params: Record<string, unknown>) =>
    [...resumeRcaKeys.all, "action-plan", params] as const,
  mttrResume: (params: Record<string, unknown>) =>
    [...resumeRcaKeys.all, "mttr-resume", params] as const,
  notClearChart: (params: Record<string, unknown>) =>
    [...resumeRcaKeys.all, "not-clear-chart", params] as const,
  notClearDetail: (params: Record<string, unknown>) =>
    [...resumeRcaKeys.all, "not-clear-detail", params] as const,
  topOldest: (params: Record<string, unknown>) =>
    [...resumeRcaKeys.all, "top-oldest", params] as const,
  ticketDetail: (params: Record<string, unknown>) =>
    [...resumeRcaKeys.all, "ticket-detail", params] as const,
};
