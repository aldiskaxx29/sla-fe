import { useQuery } from "@tanstack/react-query";
import type {
  CtiRow,
  RegionPerformanceInfo,
} from "@/app/types/monday/ticketQuality.types";

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


function getMockRegionPerformance(filter: string): RegionPerformanceInfo[] {
  if (filter === "Critical") {
    return [
      {
        id: "kalimantan",
        name: "Kalimantan",
        status: "Not Ach",
        latency: { value: 520, percentage: "9%", wowValue: "12%", wowTrend: "up", wowColor: "red" },
        packetLoss: { value: 2.115, percentage: "28%", wowValue: "31%", wowTrend: "up", wowColor: "red" },
      },
      {
        id: "sulawesi",
        name: "Sulawesi",
        status: "Not Ach",
        latency: { value: 480, percentage: "8%", wowValue: "15%", wowTrend: "down", wowColor: "green" },
        packetLoss: { value: 1.845, percentage: "25%", wowValue: "18%", wowTrend: "up", wowColor: "red" },
      },
    ];
  }

  if (filter === "Warning") {
    return [
      {
        id: "sumbagsel",
        name: "Sumbagsel",
        status: "Warning",
        latency: { value: 395, percentage: "5%", wowValue: "8%", wowTrend: "down", wowColor: "green" },
        packetLoss: { value: 0.942, percentage: "15%", wowValue: "10%", wowTrend: "down", wowColor: "green" },
      },
    ];
  }

  if (filter === "Good") {
    return [
      {
        id: "sumbagut",
        name: "Sumbagut",
        status: "Ach",
        latency: { value: 120, percentage: "1.5%", wowValue: "25%", wowTrend: "down", wowColor: "green" },
        packetLoss: { value: 0.212, percentage: "3%", wowValue: "40%", wowTrend: "down", wowColor: "green" },
      },
      {
        id: "jabar",
        name: "Jabar",
        status: "Ach",
        latency: { value: 95, percentage: "1.1%", wowValue: "30%", wowTrend: "down", wowColor: "green" },
        packetLoss: { value: 0.105, percentage: "2%", wowValue: "45%", wowTrend: "down", wowColor: "green" },
      },
    ];
  }

  return [
    {
      id: "sumbagsel",
      name: "Sumbagsel",
      status: "Not Ach",
      latency: { value: 490, percentage: "7%", wowValue: "17%", wowTrend: "down", wowColor: "green" },
      packetLoss: { value: 1.534, percentage: "24%", wowValue: "24%", wowTrend: "up", wowColor: "red" },
    },
    {
      id: "kalimantan",
      name: "Kalimantan",
      status: "Not Ach",
      latency: { value: 520, percentage: "9%", wowValue: "12%", wowTrend: "up", wowColor: "red" },
      packetLoss: { value: 2.115, percentage: "28%", wowValue: "31%", wowTrend: "up", wowColor: "red" },
    },
    {
      id: "sulawesi",
      name: "Sulawesi",
      status: "Not Ach",
      latency: { value: 480, percentage: "8%", wowValue: "15%", wowTrend: "down", wowColor: "green" },
      packetLoss: { value: 1.845, percentage: "25%", wowValue: "18%", wowTrend: "up", wowColor: "red" },
    },
  ];
}

export function useCtiMonitoringQuery(type: "CTI" | "AWS") {
  return useQuery<CtiRow[]>({
    queryKey: ["ticketQuality", "ctiMonitoring", type],
    queryFn: async () => {
      return type === "AWS" ? mockAwsData : mockCtiData;
    },
  });
}

export function useRegionPerformanceQuery(filter: string) {
  return useQuery<RegionPerformanceInfo[]>({
    queryKey: ["ticketQuality", "regionPerformance", filter],
    queryFn: async () => {
      return getMockRegionPerformance(filter);
    },
  });
}

