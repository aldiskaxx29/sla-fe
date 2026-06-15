const DAILY_MONITORING_API_ORIGIN = import.meta.env.DEV
  ? "/daily-monitoring-api"
  : import.meta.env.VITE_DAILY_MONITORING_API_BASE_URL ||
    "http://10.60.174.188:8089";

export const dailyMonitoringUrl = (path: string) => {
  if (!path.startsWith("/")) {
    return `${DAILY_MONITORING_API_ORIGIN}/${path}`;
  }

  return `${DAILY_MONITORING_API_ORIGIN}${path}`;
};

