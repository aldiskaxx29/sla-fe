import { useQuery } from "@tanstack/react-query";
import type {
  SLAMetricCard,
  CtiRow,
  RegionPerformanceInfo,
  BenchmarkRow,
} from "@/app/types/monday/ticketQuality.types";

const mockSlaPerformance: SLAMetricCard[] = [
  {
    title: "Packet Loss",
    subCards: [
      {
        id: "pl_core",
        name: "Packet Loss Core",
        status: "success",
        beforeValue: "100%",
        currentValue: "100%",
      },
      {
        id: "pl_5_access",
        name: "PL 5% Access",
        status: "danger",
        beforeValue: "237",
        currentValue: "200",
        trend: { direction: "down", value: 37, color: "green" },
        nestedData: { total: 249, regNotClear: 9, worstReg: "Sumbagteng (31)" },
      },
      {
        id: "pl_1_5_access",
        name: "PL 1-5% Access",
        status: "danger",
        beforeValue: "573",
        currentValue: "620",
        trend: { direction: "up", value: 47, color: "red" },
        nestedData: { total: 249, regNotClear: 10, worstReg: "Bali nusra (29)" },
      },
    ],
  },
  {
    title: "Latency",
    subCards: [
      {
        id: "lat_core",
        name: "Latency Core",
        status: "success",
        beforeValue: "100%",
        currentValue: "100%",
      },
      {
        id: "lat_access",
        name: "Latency Access",
        status: "success",
        beforeValue: "99.21%",
        currentValue: "99.35%",
        worstText: "Reg Not Clear : 3",
      },
    ],
  },
  {
    title: "Jitter",
    subCards: [
      {
        id: "jit_core",
        name: "Jitter Core",
        status: "success",
        beforeValue: "100%",
        currentValue: "100%",
      },
      {
        id: "jit_access",
        name: "Jitter Access",
        status: "success",
        beforeValue: "99.21%",
        currentValue: "99.35%",
        trend: { direction: "up", value: "0.14", color: "green" },
        worstText: "Reg Not Clear : 3",
      },
    ],
  },
  {
    title: "MTTR",
    subCards: [
      {
        id: "mttr_critical",
        name: "MTTR Access Critical",
        status: "success",
        beforeValue: "",
        currentValue: "",
        tableData: [
          { area: "Jawa", target: 90.8, ach: 100 },
          { area: "Non Jawa", target: 87.8, ach: 100 },
        ],
      },
      {
        id: "mttr_major",
        name: "MTTR Access Major",
        status: "danger",
        beforeValue: "",
        currentValue: "",
        tableData: [
          { area: "Jawa", target: 90.8, ach: 100 },
          { area: "Non Jawa", target: 87.8, ach: 84.66 },
        ],
        nestedData: { worstReg: "Bali nusra (29)" },
        worstText: "Reg Not Clear : 3",
      },
      {
        id: "mttr_minor",
        name: "MTTR Access Minor",
        status: "success",
        beforeValue: "",
        currentValue: "",
        tableData: [
          { area: "Jawa", target: 90.8, ach: 100 },
          { area: "Non Jawa", target: 87.8, ach: 100 },
        ],
      },
    ],
  },
];

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


const mockWinningBenchmark: BenchmarkRow[] = [
  {
    id: "area_1_1",
    area: "Area 1",
    latency: {
      trophy: { type: "green_check", value: 21.91, trend: "up" },
      warning: { value: 25.91, trend: "down" },
    },
    packetLoss: {
      trophy: { type: "green_check", value: 0.56, trend: "up" },
      warning: { value: 0.6, trend: "down" },
    },
    jitter: {
      trophy: { type: "green_check", value: 4.91, trend: "up" },
      warning: { value: 5.1, trend: "down" },
    },
  },
  {
    id: "sumbagut_1",
    area: "Sumbagut",
    latency: {
      trophy: { type: "gold", value: 21.91, trend: "up" },
      warning: { value: 25.91, trend: "down" },
    },
    packetLoss: {
      trophy: { type: "gold", value: 0.56, trend: "up" },
      warning: { value: 0.6, trend: "down" },
    },
    jitter: {
      trophy: { type: "gold", value: 4.91, trend: "up" },
      warning: { value: 5.1, trend: "down" },
    },
  },
  {
    id: "sumbagut_2",
    area: "Sumbagut",
    latency: {
      trophy: { type: "gold", value: 21.91, trend: "up" },
      warning: { value: 25.91, trend: "down" },
    },
    packetLoss: {
      trophy: { type: "gold", value: 0.56, trend: "up" },
      warning: { value: 0.6, trend: "down" },
    },
    jitter: {
      trophy: { type: "gold", value: 4.91, trend: "up" },
      warning: { value: 5.1, trend: "down" },
    },
  },
  {
    id: "sumbagut_3",
    area: "Sumbagut",
    latency: {
      trophy: { type: "gold", value: 21.91, trend: "up" },
      warning: { value: 25.91, trend: "down" },
    },
    packetLoss: {
      trophy: { type: "gold", value: 0.56, trend: "up" },
      warning: { value: 0.6, trend: "down" },
    },
    jitter: {
      trophy: { type: "gold", value: 4.91, trend: "up" },
      warning: { value: 5.1, trend: "down" },
    },
  },
  {
    id: "area_1_2",
    area: "Area 1",
    latency: {
      trophy: { type: "green_check", value: 21.91, trend: "up" },
      warning: { value: 25.91, trend: "down" },
    },
    packetLoss: {
      trophy: { type: "green_check", value: 0.56, trend: "up" },
      warning: { value: 0.6, trend: "down" },
    },
    jitter: {
      trophy: { type: "green_check", value: 4.91, trend: "up" },
      warning: { value: 5.1, trend: "down" },
    },
  },
  {
    id: "area_1_3",
    area: "Area 1",
    latency: {
      trophy: { type: "green_check", value: 21.91, trend: "up" },
      warning: { value: 25.91, trend: "down" },
    },
    packetLoss: {
      trophy: { type: "green_check", value: 0.56, trend: "up" },
      warning: { value: 0.6, trend: "down" },
    },
    jitter: {
      trophy: { type: "green_check", value: 4.91, trend: "up" },
      warning: { value: 5.1, trend: "down" },
    },
  },
];

function getMockSlaPerformance(week: string, rekon: string): SLAMetricCard[] {
  const baseData = JSON.parse(JSON.stringify(mockSlaPerformance)) as SLAMetricCard[];

  const updateCard = (
    title: string,
    id: string,
    props: Partial<typeof mockSlaPerformance[0]["subCards"][0]>
  ) => {
    const m = baseData.find((c) => c.title === title);
    if (m) {
      const sub = m.subCards.find((s) => s.id === id);
      if (sub) {
        Object.assign(sub, props);
      }
    }
  };

  if (week === "W4") {
    updateCard("Packet Loss", "pl_5_access", { currentValue: "200", beforeValue: "237" });
    updateCard("Packet Loss", "pl_1_5_access", { currentValue: "620", beforeValue: "573" });
    updateCard("Latency", "lat_access", { currentValue: "99.35%", beforeValue: "99.21%" });
    updateCard("Jitter", "jit_access", { currentValue: "99.35%", beforeValue: "99.21%" });
  } else if (week === "W3") {
    updateCard("Packet Loss", "pl_5_access", {
      currentValue: "215",
      beforeValue: "248",
      trend: { direction: "down", value: 33, color: "green" },
    });
    updateCard("Packet Loss", "pl_1_5_access", {
      currentValue: "600",
      beforeValue: "612",
      trend: { direction: "down", value: 12, color: "green" },
    });
    updateCard("Latency", "lat_access", {
      currentValue: "99.18%",
      beforeValue: "99.05%",
      status: "danger",
      worstText: "Reg Not Clear : 5",
    });
    updateCard("Jitter", "jit_access", {
      currentValue: "99.29%",
      beforeValue: "99.40%",
      trend: { direction: "down", value: "0.11", color: "red" },
    });
  } else if (week === "W2") {
    updateCard("Packet Loss", "pl_5_access", {
      currentValue: "230",
      beforeValue: "260",
      trend: { direction: "down", value: 30, color: "green" },
    });
    updateCard("Packet Loss", "pl_1_5_access", {
      currentValue: "580",
      beforeValue: "595",
      trend: { direction: "down", value: 15, color: "green" },
    });
    updateCard("Latency", "lat_access", { currentValue: "99.42%", beforeValue: "99.10%" });
    updateCard("Jitter", "jit_access", {
      currentValue: "99.12%",
      beforeValue: "99.25%",
      status: "danger",
      worstText: "Reg Not Clear : 7",
    });
  } else if (week === "W1") {
    updateCard("Packet Loss", "pl_5_access", {
      currentValue: "245",
      beforeValue: "278",
      trend: { direction: "down", value: 33, color: "green" },
    });
    updateCard("Packet Loss", "pl_1_5_access", {
      currentValue: "550",
      beforeValue: "520",
      trend: { direction: "up", value: 30, color: "red" },
    });
    updateCard("Latency", "lat_access", {
      currentValue: "98.92%",
      beforeValue: "99.15%",
      status: "danger",
      worstText: "Reg Not Clear : 8",
    });
    updateCard("Jitter", "jit_access", {
      currentValue: "98.85%",
      beforeValue: "99.02%",
      status: "danger",
      worstText: "Reg Not Clear : 9",
    });
  }

  if (rekon === "After Rekon") {
    baseData.forEach((metric) => {
      metric.subCards.forEach((sub) => {
        sub.status = "success";

        if (sub.id.includes("pl_5")) {
          const afterVals: Record<string, string> = { W4: "120", W3: "135", W2: "140", W1: "155" };
          sub.currentValue = afterVals[week] || "150";
          sub.nestedData = { total: 249, regNotClear: 0, worstReg: "-" };
        }
        if (sub.id.includes("pl_1_5")) {
          const afterVals: Record<string, string> = { W4: "420", W3: "410", W2: "435", W1: "460" };
          sub.currentValue = afterVals[week] || "450";
          sub.nestedData = { total: 249, regNotClear: 0, worstReg: "-" };
        }
        if (sub.id.includes("lat_access") || sub.id.includes("jit_access")) {
          sub.currentValue = "99.98%";
          sub.worstText = "";
        }
        if (sub.id.includes("major")) {
          const achVals: Record<string, number> = { W4: 98.5, W3: 99.1, W2: 97.8, W1: 96.5 };
          sub.tableData = [
            { area: "Jawa", target: 90.8, ach: 100 },
            { area: "Non Jawa", target: 87.8, ach: achVals[week] || 98.5 },
          ];
          sub.nestedData = { worstReg: "-" };
          sub.worstText = "Reg Not Clear : 0";
        }
      });
    });
  }

  return baseData;
}

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

export function useSlaPerformanceQuery(week: string, rekon: string) {
  return useQuery<SLAMetricCard[]>({
    queryKey: ["ticketQuality", "slaPerformance", week, rekon],
    queryFn: async () => {
      return getMockSlaPerformance(week, rekon);
    },
  });
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

export function useWinningBenchmarkQuery() {
  return useQuery<BenchmarkRow[]>({
    queryKey: ["ticketQuality", "winningBenchmark"],
    queryFn: async () => {
      return mockWinningBenchmark;
    },
  });
}
