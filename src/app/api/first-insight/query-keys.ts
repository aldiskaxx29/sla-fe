export const firstInsightKeys = {
  all: ["first-insight"] as const,
  historySla: () => [...firstInsightKeys.all, "history-sla"] as const,
};
