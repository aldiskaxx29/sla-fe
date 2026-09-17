import type {
  PeHsiGatewayPerformance,
  PeHsiLinkDetail,
  PeHsiPath,
  PeHsiPivotItem,
  PeHsiSummaryData,
  PeHsiTracerouteHop,
} from "@/app/types/network/peHsi.types";

/**
 * Ringkasan Jumlah Link & Issue Link belum punya endpoint, jadi sementara
 * memakai data contoh. Tabel pivot dan trend sudah memakai API.
 */
export const PE_HSI_SUMMARY_SAMPLE: PeHsiSummaryData = {
  last_updated: "Week 24 (12 Juni 2026 - 18 Juni 2026)",
  total_link: 248,
  best_path: [
    { path: "BTC", percentage: 85 },
    { path: "PNK", percentage: 85 },
    { path: "BDS", percentage: 85 },
    { path: "JT2", percentage: 85 },
  ],
  issue_link: 7,
  issue_breakdown: [
    { metric: "packetloss", label: "Packet Loss", total: 0 },
    { metric: "latency", label: "Latency", total: 0 },
    { metric: "jitter", label: "Jitter", total: 7 },
  ],
};

/**
 * Detail per link (traceroute, performa gateway, trend latency) belum punya
 * endpoint. Data contoh dibangun dari baris pivot supaya angkanya konsisten
 * dengan tabel.
 */
const PATHS: PeHsiPath[] = ["BTC", "BDS", "PNK", "JT2"];

const LATENCY_DANGER = 100;

const gatewayStatus = (latency: number | null) =>
  latency !== null && latency <= LATENCY_DANGER ? "OK" : "Not OK";

const TRACEROUTE_HOPS: PeHsiTracerouteHop[] = [
  { no: 1, ip_address: "10.10.0.1", latency_ms: 1 },
  { no: 2, ip_address: "10.180.0.1", latency_ms: 3 },
  { no: 3, ip_address: "172.16.241.1", latency_ms: 7 },
  { no: 4, ip_address: "192.168.164.1", latency_ms: 12 },
  { no: 5, ip_address: "180.241.164.5", latency_ms: 1 },
];

export const buildPeHsiLinkDetailSample = (
  item: PeHsiPivotItem,
): PeHsiLinkDetail => {
  const gateways: PeHsiGatewayPerformance[] = PATHS.map((path, index) => {
    const latency = item[path];
    const jitter = latency === null ? null : (latency * (index + 1)) % 45;

    return {
      gateway: path,
      latency_ms: latency,
      jitter_ms: jitter,
      packet_loss: 0,
      status: gatewayStatus(latency),
    };
  });

  const bestGateway = gateways
    .filter((gateway) => gateway.latency_ms !== null)
    .sort((a, b) => (a.latency_ms ?? 0) - (b.latency_ms ?? 0))[0];

  const categories = Array.from({ length: 7 }).map((_, index) =>
    `0${index + 3}/09`.slice(-5),
  );

  return {
    pe_hsi: item.pe_hsi,
    best_path: bestGateway?.gateway ?? "BDS",
    best_path_status: bestGateway ? "OK" : "No Data",
    link_degrade: gateways.filter((gateway) => gateway.status !== "OK").length,
    traceroute: TRACEROUTE_HOPS,
    gateways,
    latency_trend: {
      categories,
      gateways: gateways.map((gateway, gatewayIndex) => ({
        gateway: gateway.gateway,
        series: categories.map((_, pointIndex) => {
          const base = gateway.latency_ms ?? 20;
          const wave = Math.sin((pointIndex + gatewayIndex) * 0.9) * 12;

          return Math.max(1, Math.round(base + wave));
        }),
      })),
    },
  };
};
