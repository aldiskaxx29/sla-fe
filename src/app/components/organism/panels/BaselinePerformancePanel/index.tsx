import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Source, type LayerProps, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { LuArrowDown, LuArrowUp, LuInfo, LuPlus, LuMinus } from "react-icons/lu";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";
import { useThrottledEvent } from "@/app/hooks/custom/pacer";
import {
  BASELINE_CRITICAL_THRESHOLD,
  BASELINE_WARNING_THRESHOLD,
  useBaselinePerformanceQuery,
} from "@/app/hooks/query/monday/baselinePerformance";
import type {
  BaselineRegionRow,
  BaselineStatus,
} from "@/app/types/monday/baseline.types";
import { BaselineTrendModal } from "@/app/components/organism/panels/BaselinePerformancePanel/BaselineTrendModal";

// sla-fe memakai nama VITE_MAPBOX_TOKEN; nama dari qosmo-new tetap didukung.
const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ??
  import.meta.env.VITE_MAPBOX_TOKEN ??
  "";
// Default-nya style publik Mapbox, sama dengan peta lain di sla-fe. Style
// bawaan qosmo-new (`mapbox://styles/obby19/...`) milik akun berbeda, jadi
// tidak bisa dimuat oleh token di sini.
const MAPBOX_STYLE_URL =
  import.meta.env.VITE_MAPBOX_STYLE_URL ?? "mapbox://styles/mapbox/light-v11";
const REGION_GEOJSON_URL = "/geojson/region.json";
const INDONESIA_BOUNDS: [[number, number], [number, number]] = [
  [90.0, -15.0],
  [145.0, 10.0],
];

/** Nama region di geojson tidak sama persis dengan nama di data baseline. */
const GEOJSON_TO_BASELINE_REGION: Record<string, string> = {
  SUMBAGUT: "SUMBAGUT",
  SUMBAGTENG: "SUMBAGTENG",
  SUMBAGSEL: "SUMBAGSEL",
  "INNER JABOTABEK": "JABOTABEK INNER",
  "OUTER JABOTABEK": "JABOTABEK OUTER",
  JABAR: "JAWA BARAT",
  "JATENG-DIY": "JAWA TENGAH",
  JATIM: "JAWA TIMUR",
  "BALI NUSRA": "BALI NUSRA",
  KALIMANTAN: "KALIMANTAN",
  SULAWESI: "SULAWESI",
  "MALUKU DAN PAPUA": "PUMA",
};

const STATUS_COLOR: Record<BaselineStatus, string> = {
  critical: "#DC3545",
  warning: "#FFC107",
  good: "#28A745",
};

const STATUS_LABEL: Record<BaselineStatus, string> = {
  critical: "Critical",
  warning: "Warning",
  good: "Good",
};

const PERFORMANCE_FILTERS = [
  { label: "All Performance", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "Warning", value: "warning" },
  { label: "Good", value: "good" },
];

/**
 * WoW dari API adalah selisih jumlah site not clear terhadap minggu lalu, jadi
 * angka negatif berarti membaik.
 */
function WowBadge({ value }: { value: number }) {
  const improving = value <= 0;

  return (
    <span
      className={`flex shrink-0 items-center gap-0.5 font-extrabold ${
        improving ? "text-emerald-500" : "text-red-500"
      }`}
      title="Perubahan dibanding minggu lalu"
    >
      {improving ? <LuArrowDown size={8} /> : <LuArrowUp size={8} />}
      {Math.abs(value)}% WoW
    </span>
  );
}

/** Warna tiap region di peta diambil dari status baseline-nya. */
const buildRegionFillLayer = (
  regions: BaselineRegionRow[],
  filter: string,
): LayerProps => {
  // Catatan: `Map` di file ini adalah komponen react-map-gl, jadi lookup-nya
  // memakai objek biasa.
  const byRegion: Record<string, BaselineRegionRow> = {};
  regions.forEach((row) => {
    byRegion[row.region.toUpperCase()] = row;
  });

  const matchPairs: string[] = [];

  Object.entries(GEOJSON_TO_BASELINE_REGION).forEach(([geoName, dataName]) => {
    const row = byRegion[dataName];
    if (!row) return;
    if (filter !== "all" && row.status !== filter) return;

    matchPairs.push(geoName, STATUS_COLOR[row.status]);
  });

  return {
    id: "region-performance-fill-ticket",
    type: "fill",
    paint: {
      "fill-color": matchPairs.length
        ? ["match", ["get", "REGION"], ...matchPairs, "rgba(0,0,0,0)"]
        : "rgba(0,0,0,0)",
      "fill-opacity": 0.45,
    },
  };
};

const regionBorderLayer: LayerProps = {
  id: "region-performance-border-ticket",
  type: "line",
  paint: {
    "line-color": "#FFFFFF",
    "line-width": 0.5,
  },
};

export function BaselinePerformancePanel() {
  const [performanceFilter, setPerformanceFilter] = useState("all");
  const [viewTab, setViewTab] = useState<"map" | "detail">("map");
  const [trendRegion, setTrendRegion] = useState<BaselineRegionRow | null>(null);

  const { data, isPending, isError } = useBaselinePerformanceQuery();
  const regions = useMemo(() => data?.regions ?? [], [data]);
  const nation = data?.nation ?? null;

  const filteredRegions = useMemo(
    () =>
      performanceFilter === "all"
        ? regions
        : regions.filter((row) => row.status === performanceFilter),
    [regions, performanceFilter],
  );

  const fillLayer = useMemo(
    () => buildRegionFillLayer(regions, performanceFilter),
    [regions, performanceFilter],
  );

  /** Kartu di atas peta menyorot region dengan not clear terparah. */
  const highlightRegions = useMemo(
    () =>
      [...filteredRegions]
        .sort((a, b) => b.worstPersen - a.worstPersen)
        .slice(0, 3),
    [filteredRegions],
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  const handleResize = useThrottledEvent(() => {
    mapRef.current?.resize();
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  /** Enam kolom "Site Not Clear": latency, %, WoW, packetloss, %, WoW. */
  const renderNotClearCells = (row: BaselineRegionRow, onDark = false) => {
    const cells = [
      { key: "lat", value: row.latency, kind: "count" as const, divider: true },
      { key: "latp", value: row.latPersen, kind: "percent" as const },
      { key: "latw", value: row.latWow, kind: "wow" as const },
      { key: "pl", value: row.packetlos, kind: "count" as const, divider: true },
      { key: "plp", value: row.pacPersen, kind: "percent" as const },
      { key: "plw", value: row.pacWow, kind: "wow" as const },
    ];

    return cells.map((cell) => {
      const critical =
        cell.kind === "percent" && cell.value >= BASELINE_CRITICAL_THRESHOLD;
      const warning =
        cell.kind === "percent" &&
        !critical &&
        cell.value >= BASELINE_WARNING_THRESHOLD;
      const improving = cell.kind === "wow" && cell.value <= 0;

      const tone = onDark
        ? critical
          ? "text-red-300"
          : warning
            ? "text-amber-300"
            : cell.kind === "wow"
              ? improving
                ? "text-emerald-300"
                : "text-red-300"
              : "text-white"
        : critical
          ? "text-red-500"
          : warning
            ? "text-amber-600"
            : cell.kind === "wow"
              ? improving
                ? "text-emerald-600"
                : "text-red-500"
              : "text-[#213c52]";

      return (
        <td
          key={cell.key}
          className={`px-1.5 py-1.5 text-center text-[10px] font-bold tabular-nums ${tone} ${
            cell.divider ? "border-l border-slate-100" : ""
          }`}
        >
          {cell.kind === "count"
            ? cell.value.toLocaleString("id-ID")
            : cell.kind === "percent"
              ? `${cell.value}%`
              : `${cell.value > 0 ? "+" : ""}${cell.value}%`}
        </td>
      );
    });
  };

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();

  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <style>{`
        .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib {
          display: none !important;
        }
      `}</style>

      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xs font-extrabold text-[#213c52]">
            Baseline Performance
          </h2>
          <div className="flex items-center gap-1 text-[9px] font-semibold text-blue-500">
            <LuInfo size={12} />
            <span>Site Clear Min 80%</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 z-20">
          <SelectMenu
            value={performanceFilter}
            onChange={setPerformanceFilter}
            options={PERFORMANCE_FILTERS}
            size="xs"
            className="text-[10px] font-semibold"
          />

          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => setViewTab("map")}
              className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold transition-all cursor-pointer ${
                viewTab === "map"
                  ? "bg-blue-500 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setViewTab("detail")}
              className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold transition-all cursor-pointer ${
                viewTab === "detail"
                  ? "bg-blue-500 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Detail View
            </button>
          </div>
        </div>
      </header>

      <div className="relative mt-3 flex-1 rounded-xl border border-slate-200 bg-[#E8F1FC]/30 overflow-hidden min-h-[220px]">
        {viewTab === "map" ? (
          <div ref={containerRef} className="h-full w-full relative animate-fadeIn">
            {MAPBOX_TOKEN && MAPBOX_STYLE_URL ? (
              <Map
                ref={mapRef}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={MAPBOX_STYLE_URL}
                initialViewState={{
                  longitude: 118.0,
                  latitude: -2.0,
                  zoom: 2.8,
                }}
                attributionControl={false}
                dragPan={true}
                maxBounds={INDONESIA_BOUNDS}
                scrollZoom={false}
                doubleClickZoom={false}
                dragRotate={false}
                style={{ width: "100%", height: "100%" }}
              >
                <Source
                  id="region-performance-source-ticket"
                  type="geojson"
                  data={REGION_GEOJSON_URL}
                >
                  <Layer {...fillLayer} />
                  <Layer {...regionBorderLayer} />
                </Source>
              </Map>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div className="h-full w-full rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <span className="text-[9px] font-extrabold text-slate-400 select-none">INDONESIA MAP VIEW</span>
                  <div className="absolute top-1/3 left-1/4 h-8 w-16 rounded-full bg-red-400/20 blur-md" />
                  <div className="absolute top-1/2 left-1/2 h-10 w-24 rounded-full bg-emerald-400/20 blur-md" />
                  <div className="absolute top-1/3 right-1/4 h-12 w-20 rounded-full bg-yellow-400/20 blur-md" />
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 right-3 flex justify-between gap-2 z-10 pointer-events-none">
              {highlightRegions.map((region) => (
                <button
                  key={region.region}
                  type="button"
                  onClick={() => setTrendRegion(region)}
                  title={`Lihat tren ${region.region}`}
                  className="pointer-events-auto flex-1 max-w-[150px] cursor-pointer rounded-xl border border-slate-100 bg-white/95 p-1.5 text-left shadow-md backdrop-blur-xs transition-transform hover:scale-102"
                >
                  <header className="flex items-center justify-between gap-1 border-b border-slate-100 pb-0.5">
                    <span className="truncate text-[8px] font-extrabold text-[#213c52]">
                      {region.region}
                    </span>
                    <span
                      className={`rounded px-1 py-0.5 text-[7px] font-extrabold uppercase tracking-wider ${
                        region.status === "critical"
                          ? "bg-red-50 text-red-500"
                          : region.status === "warning"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {STATUS_LABEL[region.status]}
                    </span>
                  </header>
                  <div className="mt-1 flex flex-col gap-0.5 text-[8px] font-semibold text-slate-500">
                    <div className="flex items-center justify-between gap-1">
                      <span>Latency :</span>
                      <span className="font-extrabold text-slate-800">
                        {region.latency} ({region.latPersen}%)
                      </span>
                      <WowBadge value={region.latWow} />
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span>PL :</span>
                      <span className="font-extrabold text-slate-800">
                        {region.packetlos} ({region.pacPersen}%)
                      </span>
                      <WowBadge value={region.pacWow} />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-slate-100 bg-white/90 px-2 py-1 shadow-xs backdrop-blur-xs text-[8px] font-bold text-slate-600">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Warning</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>Good</span>
              </div>
            </div>

            {MAPBOX_TOKEN && MAPBOX_STYLE_URL && (
              <div className="absolute bottom-3 right-3 flex flex-col gap-1">
                <button
                  onClick={zoomIn}
                  className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800 pointer-events-auto"
                >
                  <LuPlus size={12} />
                </button>
                <button
                  onClick={zoomOut}
                  className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800 pointer-events-auto"
                >
                  <LuMinus size={12} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col bg-white animate-fadeIn">
            <div className="flex min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr>
                    <th
                      rowSpan={2}
                      className="sticky top-0 z-10 w-8 bg-white px-2 py-1.5 text-center text-[9px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0]"
                    >
                      No
                    </th>
                    <th
                      rowSpan={2}
                      className="sticky top-0 z-10 bg-white px-2 py-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0]"
                    >
                      Region
                    </th>
                    <th
                      rowSpan={2}
                      className="sticky top-0 z-10 w-16 bg-white px-2 py-1.5 text-right text-[9px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0]"
                    >
                      Total Site
                    </th>
                    <th
                      colSpan={6}
                      className="sticky top-0 z-10 border-l border-slate-100 bg-white px-2 py-1.5 text-center text-[9px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0]"
                    >
                      Site Not Clear
                    </th>
                  </tr>
                  <tr>
                    {[
                      { key: "lat", label: "Latency", tone: "text-sky-600" },
                      { key: "latp", label: "(%)", tone: "text-sky-600" },
                      { key: "latw", label: "WoW", tone: "text-sky-600" },
                      { key: "pl", label: "Packetloss", tone: "text-amber-600" },
                      { key: "plp", label: "(%)", tone: "text-amber-600" },
                      { key: "plw", label: "WoW", tone: "text-amber-600" },
                    ].map((column, index) => (
                      <th
                        key={column.key}
                        className={`sticky top-[27px] z-10 bg-white px-1.5 py-1.5 text-center text-[9px] font-bold uppercase tracking-wide shadow-[inset_0_-1px_0_#E2E8F0] ${column.tone} ${
                          index === 0 || index === 3
                            ? "border-l border-slate-100"
                            : ""
                        }`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredRegions.map((row, index) => (
                    <tr
                      key={row.region}
                      className="border-b border-slate-50 transition-colors last:border-b-0 hover:bg-slate-50/60"
                    >
                      <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => setTrendRegion(row)}
                          title={`Lihat tren ${row.region}`}
                          className="flex cursor-pointer items-center gap-1.5 text-[10px] font-extrabold text-[#213c52] transition-colors hover:text-indigo-500 hover:underline"
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: STATUS_COLOR[row.status] }}
                          />
                          {row.region}
                        </button>
                      </td>
                      <td className="px-2 py-1.5 text-right text-[10px] font-semibold tabular-nums text-slate-500">
                        {row.total.toLocaleString("id-ID")}
                      </td>
                      {renderNotClearCells(row)}
                    </tr>
                  ))}

                  {!filteredRegions.length && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-2 py-10 text-center text-[10px] font-semibold text-slate-400"
                      >
                        {isError
                          ? "Gagal memuat Baseline Performance."
                          : isPending
                            ? "Memuat data baseline..."
                            : "Tidak ada region pada filter ini."}
                      </td>
                    </tr>
                  )}
                </tbody>

                {nation && (
                  <tfoot>
                    <tr className="bg-[#213c52] text-white">
                      <td className="px-2 py-1.5" />
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => setTrendRegion(nation)}
                          title={`Lihat tren ${nation.region}`}
                          className="cursor-pointer text-[10px] font-extrabold text-white transition-colors hover:text-sky-300 hover:underline"
                        >
                          {nation.region}
                        </button>
                      </td>
                      <td className="px-2 py-1.5 text-right text-[10px] font-extrabold tabular-nums">
                        {nation.total.toLocaleString("id-ID")}
                      </td>
                      {renderNotClearCells(nation, true)}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <p className="border-t border-slate-100 px-3 py-1.5 text-[9px] font-semibold text-slate-400">
              Merah = site not clear ≥ {BASELINE_CRITICAL_THRESHOLD}%, kuning ≥{" "}
              {BASELINE_WARNING_THRESHOLD}%. WoW dibanding minggu lalu.
            </p>
          </div>
        )}
      </div>

      <BaselineTrendModal
        region={trendRegion}
        onClose={() => setTrendRegion(null)}
      />
    </div>
  );
}
