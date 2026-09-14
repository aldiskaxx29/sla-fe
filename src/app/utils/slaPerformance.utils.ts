// Types
import type {
  AccessPlTotal,
  CnopAccessRow,
  CoreSlaRow,
  MsaAccessRow,
  MttrRegionRow,
  SlaPerformanceSources,
  SlaRcaGroupingItem,
} from "@/app/types/monday/slaPerformance.types";
import type {
  MetricSubCard,
  SlaCardDetail,
  SLAMetricCard,
} from "@/app/types/monday/ticketQuality.types";

/** Angka datang sebagai string, kadang "99.50" kadang "99,50". */
export const toNumber = (value?: string | number | null): number | null => {
  if (value === undefined || value === null || value === "") return null;

  const numeric = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(numeric) ? numeric : null;
};

const formatPercent = (value?: string | number | null) => {
  const numeric = toNumber(value);
  return numeric === null ? "-" : `${numeric.toFixed(2)}%`;
};

const REGION_ALIASES: Record<string, string> = {
  "INNER JABOTABEK": "JABOTABEK INNER",
  "OUTER JABOTABEK": "JABOTABEK OUTER",
  JABAR: "JAWA BARAT",
  "WEST JAVA": "JAWA BARAT",
  JATENG: "JAWA TENGAH",
  "JATENG DIY": "JAWA TENGAH",
  "JAWA TENGAH DIY": "JAWA TENGAH",
  "CENTRAL JAVA": "JAWA TENGAH",
  JATIM: "JAWA TIMUR",
  "EAST JAVA": "JAWA TIMUR",
  "BALI NUSA TENGGARA": "BALI NUSRA",
  "MALUKU DAN PAPUA": "PUMA",
  "PAPUA MALUKU": "PUMA",
};

/** "13-NATION WIDE", "JABOTABEK_INNER", dan variasi alias harus dianggap sama. */
const normalizeRegion = (name?: string) => {
  const normalized = String(name ?? "")
    .toUpperCase()
    .replace(/^\s*\d+\s*[-_.]?\s*/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return REGION_ALIASES[normalized] ?? normalized;
};

const isNationRegion = (name?: string) => normalizeRegion(name) === "NATION WIDE";

const REGION_ORDER = [
  "SUMBAGUT",
  "SUMBAGTENG",
  "SUMBAGSEL",
  "JABOTABEK INNER",
  "JABOTABEK OUTER",
  "JAWA BARAT",
  "JAWA TENGAH",
  "JAWA TIMUR",
  "BALI NUSRA",
  "KALIMANTAN",
  "SULAWESI",
  "PUMA",
  "NATION WIDE",
];

const regionOrderOf = (name?: string) => {
  const normalized = normalizeRegion(name);
  const index = REGION_ORDER.indexOf(normalized);
  return index === -1 ? REGION_ORDER.length : index;
};

const orderByRegion = <TRow extends { region_tsel?: string; region?: string }>(
  rows: TRow[],
) =>
  [...rows].sort((left, right) => {
    const leftName = left.region_tsel ?? left.region;
    const rightName = right.region_tsel ?? right.region;
    const byOrder = regionOrderOf(leftName) - regionOrderOf(rightName);

    if (byOrder !== 0) return byOrder;
    return normalizeRegion(leftName).localeCompare(normalizeRegion(rightName));
  });

const findNation = <TRow extends { region_tsel?: string; region?: string }>(
  rows: TRow[],
) =>
  rows.find((row) => isNationRegion(row.region_tsel ?? row.region)) ?? null;

const findArea = <TRow extends { region_tsel: string }>(
  rows: TRow[],
  area: string,
) => rows.find((row) => normalizeRegion(row.region_tsel) === area) ?? null;

const sumOf = <TRow>(rows: TRow[], pick: (row: TRow) => unknown) =>
  rows.reduce((total, row) => total + (toNumber(pick(row) as string) ?? 0), 0);

const plTotalOf = (rows: AccessPlTotal[], distribution: string) => {
  const match = rows.find((row) => row.distribution_pl === distribution);
  return toNumber(match?.total ?? null);
};

const dash = (value: unknown) =>
  value === undefined || value === null || value === "" ? "-" : String(value);

/** Satu kartu RCA di popup: judul, persentase, dan rincian penyebabnya. */
export interface SlaRcaBucket {
  id: "cap" | "tsel" | "technical" | "oe" | "others";
  label: string;
  total: number;
  percent: number;
  items: { label: string; total: number }[];
}

const RCA_LABELS: Record<SlaRcaBucket["id"], string> = {
  cap: "Capacity",
  tsel: "Issue TSEL",
  technical: "Technical",
  oe: "OE",
  others: "Others",
};

/** Aturan pengelompokan mengikuti aplikasi lama; urutannya berpengaruh. */
const rcaBucketOf = (name?: string | null): SlaRcaBucket["id"] => {
  const text = String(name ?? "").toLowerCase();

  if (text.includes("cap")) return "cap";
  if (text.includes("tsel")) return "tsel";
  if (text.includes("force") || text.includes("technical")) return "technical";
  if (text.includes("qe")) return "oe";

  return "others";
};

/**
 * Ubah daftar RCA mentah jadi lima kartu. Baris tanpa `grouping_rca` tetap
 * dihitung (masuk Others) supaya persentasenya sama dengan aplikasi lama.
 */
export const groupSlaRca = (items: SlaRcaGroupingItem[] = []): SlaRcaBucket[] => {
  const buckets: Record<SlaRcaBucket["id"], SlaRcaBucket> = {
    cap: { id: "cap", label: RCA_LABELS.cap, total: 0, percent: 0, items: [] },
    tsel: { id: "tsel", label: RCA_LABELS.tsel, total: 0, percent: 0, items: [] },
    technical: {
      id: "technical",
      label: RCA_LABELS.technical,
      total: 0,
      percent: 0,
      items: [],
    },
    oe: { id: "oe", label: RCA_LABELS.oe, total: 0, percent: 0, items: [] },
    others: {
      id: "others",
      label: RCA_LABELS.others,
      total: 0,
      percent: 0,
      items: [],
    },
  };

  let grandTotal = 0;

  items.forEach((item) => {
    const total = toNumber(item.total) ?? 0;
    const bucket = buckets[rcaBucketOf(item.grouping_rca)];

    bucket.total += total;
    grandTotal += total;
    if (item.grouping_rca) {
      bucket.items.push({ label: item.grouping_rca, total });
    }
  });

  return Object.values(buckets).map((bucket) => ({
    ...bucket,
    percent: grandTotal ? Math.round((bucket.total / grandTotal) * 100) : 0,
  }));
};

/** Detail per region untuk kartu PL access (MSA). */
const buildPacketLossDetail = (
  name: string,
  rows: MsaAccessRow[],
  distributionPl: string,
): SlaCardDetail => ({
  title: name,
  subtitle: "Rincian per region — klik baris untuk daftar site",
  statusKey: "status",
  drilldown: { kind: "site", level: "packetloss", distributionPl, regionKey: "region" },
  rca: {
    key: distributionPl === "1-5%" ? "packetloss_1_5" : "packetloss_5",
    // Angka nation wide = jumlah site yang belum clear minggu ini.
    notClear: dash(findNation(rows)?.realisasi),
    notClearUnit: "Site",
  },
  columns: [
    { key: "region", label: "Region" },
    { key: "totalSite", label: "Total Site", align: "right" },
    { key: "target", label: "Target", align: "right" },
    { key: "realisasi", label: "Realisasi", align: "right" },
    { key: "gap", label: "Gap", align: "right" },
  ],
  rows: orderByRegion(rows).map((row) => ({
    region: dash(row.region_tsel),
    totalSite: dash(row.total_site),
    target: dash(row.target),
    realisasi: dash(row.realisasi),
    gap: dash(row.gap_hijau),
    status: dash(row.status_),
  })),
});

/** Detail per region untuk kartu latency/jitter access (CNOP). */
const buildCnopAccessDetail = (
  name: string,
  rows: CnopAccessRow[],
  level: "latency" | "jitter",
): SlaCardDetail => ({
  title: name,
  subtitle: "Rincian per region — klik baris untuk daftar site",
  statusKey: "status",
  drilldown: { kind: "site", level, regionKey: "region" },
  rca: {
    key: level,
    notClear: dash(findNation(rows)?.not_clear),
    notClearUnit: "Site",
  },
  columns: [
    { key: "region", label: "Region" },
    { key: "totalSite", label: "Total Site", align: "right" },
    { key: "notClear", label: "Not Clear", align: "right" },
    { key: "target", label: "Target", align: "right" },
    { key: "ach", label: "Ach", align: "right" },
  ],
  rows: orderByRegion(rows).map((row) => ({
    region: dash(row.region_tsel),
    totalSite: dash(row.total_site),
    notClear: dash(row.not_clear),
    target: formatPercent(row.target),
    ach: formatPercent(row.ach),
    status: dash(row.status),
  })),
});

/** Detail per region untuk kartu core (packet loss / jitter). */
const buildCoreDetail = (name: string, rows: CoreSlaRow[]): SlaCardDetail => ({
  title: name,
  subtitle: "Rincian per region (EBR) — klik baris untuk daftar transit",
  statusKey: "notClear",
  drilldown: { kind: "core-transit", regionKey: "region" },
  columns: [
    { key: "region", label: "Region" },
    { key: "target", label: "Target SLA", align: "right" },
    { key: "realisasi", label: "Realisasi", align: "right" },
    { key: "ebr", label: "EBR", align: "right" },
    { key: "clear", label: "Clear", align: "right" },
    { key: "notClear", label: "Not Clear", align: "right" },
  ],
  rows: orderByRegion(rows).map((row) => ({
    region: dash(row.region),
    target: formatPercent(row.target_sla),
    realisasi: formatPercent(coreRealisasi(row)),
    ebr: dash(row.total_ebr ?? row.ebr),
    clear: dash(row.clear ?? row.total_clear),
    notClear: dash(row.not_clear ?? row.total_not_clear),
  })),
});

/** Detail latency core: satu baris per verifier x region. */
const buildCoreLatencyDetail = (
  sources: SlaPerformanceSources["coreLatency"],
): SlaCardDetail => ({
  title: "Latency Core",
  subtitle: "Rincian per verifier dan region (EBR) — klik baris untuk daftar transit",
  statusKey: "notClear",
  drilldown: { kind: "core-transit", regionKey: "region" },
  columns: [
    { key: "verifier", label: "Verifier", align: "center" },
    { key: "region", label: "Region" },
    { key: "target", label: "Target SLA", align: "right" },
    { key: "realisasi", label: "Realisasi", align: "right" },
    { key: "ebr", label: "EBR", align: "right" },
    { key: "notClear", label: "Not Clear", align: "right" },
  ],
  rows: sources.flatMap(({ code, rows }) =>
    orderByRegion(rows).map((row) => ({
      verifier: code,
      region: dash(row.region),
      target: formatPercent(row.target_sla),
      realisasi: formatPercent(coreRealisasi(row)),
      ebr: dash(row.total_ebr ?? row.ebr),
      notClear: dash(row.not_clear ?? row.total_not_clear),
    })),
  ),
});

/** Detail tiket MTTR per region. */
/** Baris ringkasan pada tabel MTTR; diberi latar penuh seperti aplikasi lama. */
const MTTR_GROUP_ROWS = ["Jawa", "Non Jawa"];

/** Urutan tabel MTTR mengikuti urutan region pada popup SLA. */
const orderMttrRows = (rows: MttrRegionRow[]) => orderByRegion(rows);

const buildMttrDetail = (
  name: string,
  rows: MttrRegionRow[],
): SlaCardDetail => ({
  title: name,
  subtitle: "Rincian per region — klik baris untuk daftar tiket",
  drilldown: { kind: "mttr-ticket", regionKey: "region" },
  columns: [
    { key: "no", label: "No", align: "center" },
    { key: "region", label: "Region" },
    { key: "treshold", label: "Treshold", align: "center" },
    { key: "target", label: "Target (%)", align: "center" },
    { key: "ach", label: "Realisasi Ach (%)", align: "center" },
    { key: "closeTotal", label: "Total", group: "Ticket Close", align: "center" },
    {
      key: "closeHijau",
      label: "Hijau",
      group: "Ticket Close",
      tone: "green",
      align: "center",
    },
    {
      key: "closeMerah",
      label: "Merah",
      group: "Ticket Close",
      tone: "red",
      align: "center",
    },
    { key: "openTotal", label: "Total", group: "Ticket Open", align: "center" },
    {
      key: "openHijau",
      label: "Hijau",
      group: "Ticket Open",
      tone: "green",
      align: "center",
    },
    {
      key: "openKuning",
      label: "Kuning",
      group: "Ticket Open",
      tone: "yellow",
      align: "center",
    },
    {
      key: "openMerah",
      label: "Merah",
      group: "Ticket Open",
      tone: "red",
      align: "center",
    },
    { key: "totalTiket", label: "Total Ticket", align: "center" },
  ],
  achievement: {
    achKey: "ach",
    targetKey: "target",
    labelKey: "region",
    groupRows: MTTR_GROUP_ROWS,
  },
  rows: orderMttrRows(rows).map((row, index) => ({
    no: index + 1,
    region: dash(row.region_tsel),
    treshold: dash(row.treshold),
    target: dash(row.target),
    ach: dash(row.ach),
    closeTotal: dash(row.tiket_close),
    closeHijau: dash(row.tiket_close_clear),
    closeMerah: dash(row.tiket_close_not_clear),
    openTotal: dash(row.tiket_open),
    openHijau: dash(row.hijau),
    openKuning: dash(row.kuning),
    openMerah: dash(row.merah),
    totalTiket: dash(row.total_tiket),
  })),
});

/** Kartu PL access: jumlah site minggu lalu vs minggu terpilih. */
const buildPacketLossAccessCard = (
  id: string,
  name: string,
  rows: MsaAccessRow[],
  distribution: string,
  sources: SlaPerformanceSources,
): MetricSubCard => {
  const nation = findNation(rows);
  const regions = rows.filter((row) => !isNationRegion(row.region_tsel));
  const notClear = regions.filter(
    (row) => String(row.status_).toUpperCase() === "MERAH",
  ).length;

  const worst = regions.reduce<MsaAccessRow | null>((worstRow, row) => {
    const current = toNumber(row.realisasi) ?? 0;
    const previous = toNumber(worstRow?.realisasi) ?? -1;
    return current > previous ? row : worstRow;
  }, null);

  const currentTotal = plTotalOf(sources.plCurrentWeek, distribution);
  const previousTotal = plTotalOf(sources.plPreviousWeek, distribution);
  const nationRealisasi = toNumber(nation?.realisasi);
  const current = currentTotal ?? nationRealisasi;

  const gap =
    current !== null && previousTotal !== null ? current - previousTotal : null;

  return {
    id,
    name,
    status:
      String(nation?.status_ ?? "").toUpperCase() === "HIJAU"
        ? "success"
        : "danger",
    beforeValue: previousTotal === null ? "-" : String(previousTotal),
    currentValue: current === null ? "-" : String(current),
    beforeLabel: `(${sources.previousWeekLabel})`,
    currentLabel: `(${sources.currentWeekLabel})`,
    trend:
      gap === null || gap === 0
        ? undefined
        : {
            direction: gap > 0 ? "up" : "down",
            value: Math.abs(gap),
            color: gap > 0 ? "red" : "green",
          },
    nestedData: {
      total: toNumber(nation?.target) ?? undefined,
      totalLabel: "Target",
      regNotClear: notClear,
      worstReg: worst
        ? `${worst.region_tsel} (${toNumber(worst.realisasi) ?? "-"})`
        : undefined,
    },
    detail: buildPacketLossDetail(name, rows, distribution),
  };
};

/** Kartu latency/jitter access: target vs achievement nation wide. */
const buildCnopAccessCard = (
  id: string,
  name: string,
  rows: CnopAccessRow[],
  level: "latency" | "jitter",
  options: { withNestedTotal: boolean },
): MetricSubCard => {
  const nation = findNation(rows);
  const regions = rows.filter((row) => !isNationRegion(row.region_tsel));
  const notClear = regions.filter(
    (row) => String(row.status).toLowerCase() === "merah",
  ).length;

  const worst = regions.reduce<CnopAccessRow | null>((worstRow, row) => {
    const current = toNumber(row.ach);
    if (current === null) return worstRow;

    const previous = toNumber(worstRow?.ach);
    return previous === null || current < previous ? row : worstRow;
  }, null);

  const target = toNumber(nation?.target);
  const ach = toNumber(nation?.ach);
  const gap = target !== null && ach !== null ? ach - target : null;

  return {
    id,
    name,
    status:
      String(nation?.status ?? "").toLowerCase() === "hijau"
        ? "success"
        : "danger",
    beforeValue: formatPercent(nation?.target),
    currentValue: formatPercent(nation?.ach),
    beforeLabel: "(Target)",
    currentLabel: "(Ach)",
    trend:
      gap === null
        ? undefined
        : {
            direction: gap >= 0 ? "up" : "down",
            value: Math.abs(gap).toFixed(2),
            color: gap >= 0 ? "green" : "red",
          },
    // Kolom kiri sudah menampilkan "Reg Not Clear" lewat nestedData, jadi
    // worstText hanya dipakai kartu yang tidak merender blok itu.
    worstText: options.withNestedTotal
      ? undefined
      : `Reg Not Clear : ${notClear}`,
    nestedData: {
      total: options.withNestedTotal
        ? (toNumber(nation?.total_site) ?? undefined)
        : undefined,
      totalLabel: "Total",
      regNotClear: notClear,
      worstReg: worst
        ? `${worst.region_tsel} (${formatPercent(worst.ach)})`
        : undefined,
    },
    detail: buildCnopAccessDetail(name, rows, level),
  };
};

const coreRealisasi = (row: CoreSlaRow | null) =>
  row?.realisasi ?? row?.realisasi_sla ?? null;

/** Core packet loss punya baris NATION WIDE sendiri. */
const buildCorePacketLossCard = (rows: CoreSlaRow[]): MetricSubCard => {
  const nation = findNation(rows);
  const target = toNumber(nation?.target_sla);
  const ach = toNumber(coreRealisasi(nation));
  const notClear = toNumber(nation?.total_not_clear) ?? 0;

  return {
    id: "pl_core",
    name: "Packet Loss Core",
    status: target !== null && ach !== null && ach >= target ? "success" : "danger",
    beforeValue: formatPercent(nation?.target_sla),
    currentValue: formatPercent(coreRealisasi(nation)),
    beforeLabel: "(Target)",
    currentLabel: "(Ach)",
    nestedData: {
      total: toNumber(nation?.ebr) ?? undefined,
      totalLabel: "EBR",
      regNotClear: notClear,
    },
    detail: buildCoreDetail("Packet Loss Core", rows),
  };
};

/** Core jitter tidak punya baris nation, jadi diakumulasi dari semua region. */
const buildCoreJitterCard = (rows: CoreSlaRow[]): MetricSubCard => {
  const totalEbr = sumOf(rows, (row) => row.total_ebr ?? row.ebr);
  const totalClear = sumOf(rows, (row) => row.clear ?? row.total_clear);
  const notClear = sumOf(rows, (row) => row.not_clear ?? row.total_not_clear);
  const target = toNumber(rows[0]?.target_sla);
  const ach = totalEbr > 0 ? (totalClear / totalEbr) * 100 : null;

  return {
    id: "jit_core",
    name: "Jitter Core",
    status: target !== null && ach !== null && ach >= target ? "success" : "danger",
    beforeValue: formatPercent(rows[0]?.target_sla),
    currentValue: ach === null ? "-" : `${ach.toFixed(2)}%`,
    beforeLabel: "(Target)",
    currentLabel: "(Ach)",
    nestedData: {
      total: totalEbr || undefined,
      totalLabel: "EBR",
      regNotClear: notClear,
    },
    detail: buildCoreDetail("Jitter Core", rows),
  };
};

/** Latency core dipecah per verifier (BDS/BTC/PNK), jadi ditampilkan sebagai tabel. */
const buildCoreLatencyCard = (
  sources: SlaPerformanceSources["coreLatency"],
): MetricSubCard => {
  const tableData = sources
    .map(({ code, rows }) => {
      const nation = findNation(rows);
      const target = toNumber(nation?.target_sla);
      const ach = toNumber(coreRealisasi(nation));

      if (target === null || ach === null) return null;
      return { area: code, target, ach };
    })
    .filter((row): row is { area: string; target: number; ach: number } =>
      Boolean(row),
    );

  const notClear = sources.reduce(
    (total, { rows }) =>
      total + (toNumber(findNation(rows)?.not_clear ?? null) ?? 0),
    0,
  );

  return {
    id: "lat_core",
    name: "Latency Core",
    status: tableData.every((row) => row.ach >= row.target)
      ? "success"
      : "danger",
    beforeValue: "",
    currentValue: "",
    tableData,
    worstText: notClear > 0 ? `EBR Not Clear : ${notClear}` : undefined,
    detail: buildCoreLatencyDetail(sources),
  };
};

/** MTTR ditarget terpisah untuk Jawa dan Non Jawa. */
const buildMttrCard = (
  id: string,
  name: string,
  rows: MttrRegionRow[],
): MetricSubCard => {
  const nation = findNation(rows);
  const areas = ["JAWA", "NON JAWA"];

  const tableData = areas
    .map((area) => {
      const row = findArea(rows, area);
      const target = toNumber(row?.target);
      const ach = toNumber(row?.ach);

      if (!row || target === null || ach === null) return null;
      return { area: row.region_tsel, target, ach };
    })
    .filter((row): row is { area: string; target: number; ach: number } =>
      Boolean(row),
    );

  const nationTarget = toNumber(nation?.target);
  const nationAch = toNumber(nation?.ach);
  // Status kartu harus mengikuti baris yang terlihat di card. Nation Wide
  // tetap dipakai sebagai fallback kalau ringkasan Jawa/Non Jawa tidak ada.
  const hasNationAch = nationTarget !== null && nationAch !== null;
  const isOnTarget =
    tableData.length > 0
      ? tableData.every((row) => row.ach >= row.target)
      : hasNationAch && (nationAch as number) >= (nationTarget as number);

  return {
    id,
    name,
    status: isOnTarget ? "success" : "danger",
    beforeValue: "",
    currentValue: "",
    tableData,
    detail: buildMttrDetail(name, rows),
  };
};

export const buildSlaPerformanceCards = (
  sources: SlaPerformanceSources,
): SLAMetricCard[] => [
  {
    title: "Packet Loss",
    subCards: [
      buildCorePacketLossCard(sources.corePacketLoss),
      buildPacketLossAccessCard(
        "pl_5_access",
        "PL 5% Access",
        sources.packetLoss5,
        ">5%",
        sources,
      ),
      buildPacketLossAccessCard(
        "pl_1_5_access",
        "PL 1-5% Access",
        sources.packetLoss15,
        "1-5%",
        sources,
      ),
    ],
  },
  {
    title: "Latency",
    subCards: [
      buildCoreLatencyCard(sources.coreLatency),
      buildCnopAccessCard(
        "lat_access",
        "Latency Access",
        sources.latencyAccess,
        "latency",
        { withNestedTotal: false },
      ),
    ],
  },
  {
    title: "Jitter",
    subCards: [
      buildCoreJitterCard(sources.coreJitter),
      buildCnopAccessCard(
        "jit_access",
        "Jitter Access",
        sources.jitterAccess,
        "jitter",
        { withNestedTotal: true },
      ),
    ],
  },
  {
    title: "MTTR",
    subCards: [
      buildMttrCard("mttr_critical", "MTTR Access Critical", sources.mttrCritical),
      buildMttrCard("mttr_major", "MTTR Access Major", sources.mttrMajor),
      buildMttrCard("mttr_minor", "MTTR Access Minor", sources.mttrMinor),
    ],
  },
];
