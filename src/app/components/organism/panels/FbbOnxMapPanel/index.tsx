import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  Source,
  type LayerProps,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { LuX } from "react-icons/lu";

// Atoms
import { StatusPill } from "@/app/components/atoms";

// Hooks
import { useThrottledEvent } from "@/app/hooks/custom/pacer";

// Types
import type { FbbMapRegionRow } from "@/app/types/fbb/onx.types";

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ??
  import.meta.env.VITE_MAPBOX_TOKEN ??
  "";
const MAPBOX_STYLE_URL =
  import.meta.env.VITE_MAPBOX_STYLE_URL ?? "mapbox://styles/mapbox/light-v11";
const REGION_GEOJSON_URL = "/geojson/region.json";
const REGION_SOURCE_ID = "fbb-onx-region";
const REGION_FILL_LAYER = "fbb-onx-region-fill";

/** Framing awal; nama region di geojson sama persis dengan yang dikirim API. */
const INDONESIA_FIT_BOUNDS: [[number, number], [number, number]] = [
  [94.5, -11.0],
  [141.5, 7.0],
];

const WIN_COLOR = "#21a647";
const LOSE_COLOR = "#c23837";

/** "11/11" -> { value: 11, total: 11 } */
const parseLosePerTotal = (raw?: string) => {
  const [valueRaw, totalRaw] = String(raw ?? "").split("/");
  const value = Number(valueRaw);
  const total = Number(totalRaw);

  if (!Number.isFinite(value) || !Number.isFinite(total)) return null;

  return { value, total };
};

const isWinRow = (benchmark?: string) =>
  String(benchmark ?? "").toLowerCase() === "win";

interface RegionSummary {
  region: string;
  /** Kabupaten yang dimenangkan Indihome (penyebut pada baris benchmark win). */
  win: number;
  /** Total kalah dari seluruh pembanding. */
  lose: number;
  total: number;
  win_status: boolean;
  /** Rincian per provider pembanding, untuk keterangan di popup. */
  rows: FbbMapRegionRow[];
}

/**
 * Respons peta berisi satu baris per pasangan region x winner, jadi angka
 * region dihitung di sini: baris `win` menyumbang jumlah kemenangan Indihome,
 * baris `lose` menyumbang jumlah kalahnya.
 */
const summarizeRegions = (rows: FbbMapRegionRow[]) => {
  const byRegion: Record<string, RegionSummary> = {};

  rows.forEach((row) => {
    const region = String(row.regions ?? "").toUpperCase();
    if (!region) return;

    const summary = (byRegion[region] ??= {
      region: row.regions,
      win: 0,
      lose: 0,
      total: 0,
      win_status: false,
      rows: [],
    });

    const parsed = parseLosePerTotal(row.lose_per_total);
    summary.rows.push(row);

    if (!parsed) return;

    if (isWinRow(row.benchmark)) summary.win += parsed.total;
    else summary.lose += parsed.value;
  });

  Object.values(byRegion).forEach((summary) => {
    summary.total = summary.win + summary.lose;
    summary.win_status = summary.win > summary.lose;
  });

  return byRegion;
};

interface FbbOnxMapPanelProps {
  rows: FbbMapRegionRow[];
  kpi: string;
  loading?: boolean;
  error?: boolean;
}

/** Peta status menang/kalah per region untuk KPI yang dipilih. */
export function FbbOnxMapPanel({
  rows,
  kpi,
  loading = false,
  error = false,
}: FbbOnxMapPanelProps) {
  const [activeRegionName, setActiveRegionName] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  const handleResize = useThrottledEvent(() => mapRef.current?.resize());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  const summaries = useMemo(() => summarizeRegions(rows), [rows]);

  // Region yang hilang dari respons tidak diwarnai sama sekali.
  const fillLayer = useMemo<LayerProps>(() => {
    const matchPairs: string[] = [];

    Object.entries(summaries).forEach(([region, summary]) => {
      matchPairs.push(region, summary.win_status ? WIN_COLOR : LOSE_COLOR);
    });

    return {
      id: REGION_FILL_LAYER,
      type: "fill",
      paint: {
        "fill-color": matchPairs.length
          ? ["match", ["upcase", ["get", "REGION"]], ...matchPairs, "rgba(0,0,0,0)"]
          : "rgba(0,0,0,0)",
        "fill-opacity": 0.5,
      },
    };
  }, [summaries]);

  const borderLayer: LayerProps = {
    id: "fbb-onx-region-border",
    type: "line",
    paint: { "line-color": "#FFFFFF", "line-width": 0.6 },
  };

  const handleMapClick = useCallback((event: MapMouseEvent) => {
    const feature = event.features?.[0];
    const name = String(feature?.properties?.REGION ?? "").toUpperCase();

    setActiveRegionName(name || null);
  }, []);

  const activeRegion = activeRegionName ? summaries[activeRegionName] : null;

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-[10px] bg-[#f1f5f9]">
      {MAPBOX_TOKEN && MAPBOX_STYLE_URL ? (
        <div ref={containerRef} className="absolute inset-0">
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle={MAPBOX_STYLE_URL}
            initialViewState={{
              bounds: INDONESIA_FIT_BOUNDS,
              fitBoundsOptions: { padding: 8 },
            }}
            onLoad={(event) => {
              const map = event.target;
              map.fitBounds(INDONESIA_FIT_BOUNDS, { padding: 8, duration: 0 });
              // Satu tingkat lebih dekat dari hasil fit; sisanya digeser manual.
              map.setZoom(map.getZoom() + 1);
            }}
            interactiveLayerIds={[REGION_FILL_LAYER]}
            onClick={handleMapClick}
            attributionControl={false}
            dragPan
            dragRotate={false}
            scrollZoom={false}
            style={{ width: "100%", height: "100%" }}
          >
            <Source id={REGION_SOURCE_ID} type="geojson" data={REGION_GEOJSON_URL}>
              <Layer {...fillLayer} />
              <Layer {...borderLayer} />
            </Source>
          </Map>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-slate-400">
          Token Mapbox belum diatur.
        </div>
      )}

      <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
        <span className="rounded-[24px] border border-[#e2e8f0] bg-white px-4 py-2 text-xs font-medium text-[#020617]">
          {loading
            ? "Memuat status region..."
            : error
              ? "Gagal memuat status region."
              : `KPI ${kpi || "-"}`}
        </span>

        <span className="flex items-center gap-4 rounded-[24px] border border-[#e2e8f0] bg-white px-4 py-2 text-xs text-[#020617]">
          <span className="flex items-center gap-1">
            <span
              className="size-3 rounded-full"
              style={{
                backgroundColor: "#21a64733",
                outline: "1px solid #21a647",
                outlineOffset: "-0.5px",
              }}
            />
            Win
          </span>
          <span className="flex items-center gap-1">
            <span
              className="size-3 rounded-full"
              style={{
                backgroundColor: "#c2383733",
                outline: "1px solid #c23837",
                outlineOffset: "-0.5px",
              }}
            />
            Lose
          </span>
        </span>
      </div>

      {activeRegion && (
        <div className="absolute bottom-4 left-4 w-72 rounded-xl bg-white/[0.92] p-3 shadow-[0px_8px_24px_rgba(2,6,23,0.12)] backdrop-blur-[8.75px]">
          <header className="flex items-center justify-between gap-2 pb-2">
            <span className="truncate text-sm leading-5 font-semibold text-[#020617]">
              {activeRegion.region}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <StatusPill
                label={activeRegion.win_status ? "Win" : "Lose"}
                tone={activeRegion.win_status ? "win" : "lose"}
              />
              <button
                type="button"
                onClick={() => setActiveRegionName(null)}
                aria-label="Tutup"
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <LuX size={13} />
              </button>
            </div>
          </header>

          <dl className="flex flex-col gap-1 border-t border-slate-100 pt-2 text-[11px] font-semibold text-slate-500">
            <div className="flex items-center justify-between gap-2">
              <dt>KPI</dt>
              <dd className="font-bold text-navy">{kpi || "-"}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Win</dt>
              <dd className="font-bold text-emerald-600">
                {activeRegion.win} from {activeRegion.total}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Lose</dt>
              <dd className="font-bold text-red-500">
                {activeRegion.lose} from {activeRegion.total}
              </dd>
            </div>
          </dl>

          {/* Keterangan per pembanding, apa adanya dari endpoint. */}
          <div className="mt-2 max-h-40 overflow-auto border-t border-slate-100 pt-2">
            <table className="w-full text-left text-[10.5px]">
              <thead>
                <tr className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400">
                  <th className="pb-1">Winner</th>
                  <th className="pb-1 text-center">Benchmark</th>
                  <th className="pb-1 text-right">Lose/Total</th>
                </tr>
              </thead>
              <tbody>
                {activeRegion.rows.map((row) => {
                  const win = isWinRow(row.benchmark);

                  return (
                    <tr
                      key={`${row.regions}-${row.winner}`}
                      className="border-t border-slate-50"
                    >
                      <td className="py-1 font-bold text-navy">{row.winner}</td>
                      <td
                        className={`py-1 text-center font-bold uppercase ${
                          win ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {row.benchmark}
                      </td>
                      <td className="py-1 text-right font-semibold tabular-nums text-slate-500">
                        {row.lose_per_total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
