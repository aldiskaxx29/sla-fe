import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Source, type LayerProps, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { LuInfo, LuPlus, LuMinus } from "react-icons/lu";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";
import { useThrottledEvent } from "@/app/hooks/custom/pacer";
import {
  BASELINE_NOT_ACHIEVE_THRESHOLD,
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
/** Batas geser peta (dibuat longgar). */
const INDONESIA_BOUNDS: [[number, number], [number, number]] = [
  [90.0, -15.0],
  [145.0, 10.0],
];
/** Batas untuk framing awal — seluas daratan Indonesia saja, tanpa laut lebih. */
const INDONESIA_FIT_BOUNDS: [[number, number], [number, number]] = [
  [94.5, -11.0],
  [141.5, 7.0],
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
  achieve: "#28A745",
  "not-achieve": "#DC3545",
};

const PERFORMANCE_FILTERS = [
  { label: "All Performance", value: "all" },
  { label: "Achieve", value: "achieve" },
  { label: "Not Achieve", value: "not-achieve" },
];

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
      const notAchieve =
        cell.kind === "percent" && cell.value >= BASELINE_NOT_ACHIEVE_THRESHOLD;
      const improving = cell.kind === "wow" && cell.value <= 0;

      const tone = onDark
        ? notAchieve
          ? "text-red-300"
          : cell.kind === "percent"
            ? "text-emerald-300"
            : cell.kind === "wow"
              ? improving
                ? "text-emerald-300"
                : "text-red-300"
              : "text-white"
        : notAchieve
          ? "text-red-500"
          : cell.kind === "percent"
            ? "text-emerald-600"
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

      <header className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-extrabold text-[#213c52]">
            Baseline Performance
          </h2>
          <div className="flex items-center gap-1 text-[9px] font-semibold text-blue-500">
            <LuInfo size={12} />
            <span>Site Clear Min 80%</span>
          </div>
        </div>

        <div className="flex shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            onClick={() => setViewTab("map")}
            className={`rounded-md px-2.5 py-1 text-[10px] font-extrabold transition-all cursor-pointer ${
              viewTab === "map"
                ? "bg-blue-500 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setViewTab("detail")}
            className={`rounded-md px-2.5 py-1 text-[10px] font-extrabold transition-all cursor-pointer ${
              viewTab === "detail"
                ? "bg-blue-500 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Detail View
          </button>
        </div>
      </header>

      <div className="relative mt-3 flex-1 rounded-xl border border-slate-200 bg-[#E8F1FC]/30 overflow-hidden min-h-[210px]">
        {viewTab === "map" ? (
          <div ref={containerRef} className="absolute inset-0 animate-fadeIn">
            {MAPBOX_TOKEN && MAPBOX_STYLE_URL ? (
              <Map
                ref={mapRef}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={MAPBOX_STYLE_URL}
                // Framing dihitung dari bounds, bukan zoom tetap: kartunya
                // sekarang pendek, jadi zoom tetap bikin peta terpotong.
                initialViewState={{
                  bounds: INDONESIA_FIT_BOUNDS,
                  fitBoundsOptions: { padding: 2 },
                }}
                onLoad={(event) =>
                  event.target.fitBounds(INDONESIA_FIT_BOUNDS, {
                    padding: 2,
                    duration: 0,
                  })
                }
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

            <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-20">
              <SelectMenu
                value={performanceFilter}
                onChange={setPerformanceFilter}
                options={PERFORMANCE_FILTERS}
                size="xs"
                className="text-[10px] font-semibold"
              />

              <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white/90 px-2 py-1 shadow-xs backdrop-blur-xs text-[9px] font-bold text-slate-600">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span>Achieve</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Not Achieve</span>
                </div>
              </div>
            </div>

            {MAPBOX_TOKEN && MAPBOX_STYLE_URL && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
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
          <div className="absolute inset-0 flex min-h-0 flex-col bg-white animate-fadeIn">
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
              Not achieve = site not clear ≥ {BASELINE_NOT_ACHIEVE_THRESHOLD}%.
              WoW dibanding minggu lalu.
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
