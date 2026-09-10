import { useQuery } from "@tanstack/react-query";
import type { CtiRow } from "@/app/types/monday/ticketQuality.types";

const mockCtiData: CtiRow[] = [
  {
    no: 1,
    peTransit: "PE-D1-BNA-TRANSIT",
    bds: { baseline: 20, latency: 16.5 },
    btc: { baseline: 38, latency: 32.8 },
    pink: { baseline: 14, latency: 12.1 },
  },
  {
    no: 2,
    peTransit: "PE-D7-PL2-TRANSIT",
    bds: { baseline: 20, latency: 16.5 },
    btc: { baseline: 38, latency: 32.8 },
    pink: { baseline: 14, latency: 12.1 },
  },
  {
    no: 3,
    peTransit: "PE-D1-BNA-TRANSIT",
    bds: { baseline: 20, latency: 16.5 },
    btc: { baseline: 38, latency: 32.8 },
    pink: { baseline: 14, latency: 12.1 },
  },
  {
    no: 4,
    peTransit: "PE-D7-PL2-TRANSIT",
    bds: { baseline: 20, latency: 16.5 },
    btc: { baseline: 38, latency: 32.8 },
    pink: { baseline: 14, latency: 12.1 },
  },
  {
    no: 5,
    peTransit: "PE-D1-BNA-TRANSIT",
    bds: { baseline: 20, latency: 16.5 },
    btc: { baseline: 38, latency: 32.8 },
    pink: { baseline: 14, latency: 12.1 },
  },
  {
    no: 6,
    peTransit: "PE-D7-PL2-TRANSIT",
    bds: { baseline: 20, latency: 16.5 },
    btc: { baseline: 38, latency: 32.8 },
    pink: { baseline: 14, latency: 12.1 },
  },
];

const mockAwsData: CtiRow[] = [
  {
    no: 1,
    peTransit: "PE-AWS-JABO-TRANSIT-1",
    bds: { baseline: 15, latency: 12.4 },
    btc: { baseline: 25, latency: 22.1 },
    pink: { baseline: 10, latency: 8.9 },
  },
  {
    no: 2,
    peTransit: "PE-AWS-SG-TRANSIT-2",
    bds: { baseline: 30, latency: 28.5 },
    btc: { baseline: 45, latency: 41.2 },
    pink: { baseline: 20, latency: 17.6 },
  },
  {
    no: 3,
    peTransit: "PE-AWS-US-TRANSIT-3",
    bds: { baseline: 180, latency: 172.3 },
    btc: { baseline: 210, latency: 195.4 },
    pink: { baseline: 160, latency: 148.9 },
  },
  {
    no: 4,
    peTransit: "PE-AWS-EU-TRANSIT-4",
    bds: { baseline: 140, latency: 135.2 },
    btc: { baseline: 170, latency: 158.1 },
    pink: { baseline: 120, latency: 110.3 },
  },
];


export function useCtiMonitoringQuery(type: "CTI" | "AWS") {
  return useQuery<CtiRow[]>({
    queryKey: ["ticketQuality", "ctiMonitoring", type],
    queryFn: async () => {
      return type === "AWS" ? mockAwsData : mockCtiData;
    },
  });
}
