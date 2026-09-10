// React Query
import { useQuery } from "@tanstack/react-query";

// Api
import { getRpjBenchmark, mondayMonitoringKeys } from "@/app/api";

// Types
import type {
  MagistaRow,
  RpjBenchmarkRow,
  RpjOperatorValues,
} from "@/app/types/monday/trendQuality.types";

const toNumber = (value?: number | string | null) => {
  if (value === undefined || value === null || value === "") return null;

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const toValues = (row?: MagistaRow): RpjOperatorValues => ({
  telkomsel: toNumber(row?.telkomsel),
  indosat: toNumber(row?.["Indosat Ooredoo"]),
  smartfren: toNumber(row?.smartfren),
  xl: toNumber(row?.xl),
});

/** "TREG3-JAWA BARAT" -> "Treg 3 - Jawa Barat", "SUMBAGUT" -> "Sumbagut". */
const formatLabel = (location: string) => {
  const titled = location
    .toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, prefix: string, letter: string) =>
      `${prefix}${letter.toUpperCase()}`,
    );

  return titled
    .replace(/^Treg(\d)/, "Treg $1")
    .replace(/-/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
};

/** Baris induk adalah TREG dan NATION; sisanya region di bawah TREG terdekat. */
const isParentLocation = (location: string) =>
  /^TREG/i.test(location) || location.toUpperCase() === "NATION";

/**
 * Winning Benchmark RPJ CX: tiga file magista (latency, packet loss, jitter)
 * dengan urutan baris yang sama, digabung jadi satu pohon region.
 */
export const useRpjBenchmarkQuery = () =>
  useQuery<RpjBenchmarkRow[]>({
    queryKey: mondayMonitoringKeys.rpjBenchmark(),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const [latency, packetloss, jitter] = await Promise.all([
        getRpjBenchmark("latency", signal),
        getRpjBenchmark("packetloss", signal),
        getRpjBenchmark("jitter", signal),
      ]);

      const byLocation = (rows: MagistaRow[], location: string) =>
        rows.find((row) => row.location === location);

      const tree: RpjBenchmarkRow[] = [];

      latency.forEach((row) => {
        const location = String(row.location ?? "");
        if (!location) return;

        const item: RpjBenchmarkRow = {
          id: location,
          label: formatLabel(location),
          isParent: isParentLocation(location),
          children: [],
          latency: toValues(row),
          packetloss: toValues(byLocation(packetloss, location)),
          jitter: toValues(byLocation(jitter, location)),
        };

        if (item.isParent || !tree.length) {
          tree.push(item);
          return;
        }

        tree[tree.length - 1].children.push(item);
      });

      return tree;
    },
  });
