import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  Source,
  type LayerProps,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { LuMinus, LuPlus, LuX } from "react-icons/lu";

import { StatusPill } from "@/app/components/atoms";

import { useThrottledEvent } from "@/app/hooks/custom/pacer";

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
const REGION_LABEL_SOURCE_ID = "fbb-onx-region-label";

type RegionGeoJson = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  { REGION?: string; LONGITUDE?: number; LATITUDE?: number }
>;

const toLabelPoints = (
  geojson: RegionGeoJson,
): GeoJSON.FeatureCollection<GeoJSON.Point, { REGION: string }> => ({
  type: "FeatureCollection",
  features: geojson.features.flatMap((feature) => {
    const { REGION, LONGITUDE, LATITUDE } = feature.properties ?? {};
    if (!REGION || !Number.isFinite(LONGITUDE) || !Number.isFinite(LATITUDE)) {
      return [];
    }

    return [
      {
        type: "Feature",
        properties: { REGION },
        geometry: {
          type: "Point",
          coordinates: [Number(LONGITUDE), Number(LATITUDE)],
        },
      },
    ];
  }),
});

const labelLayer: LayerProps = {
  id: "fbb-onx-region-label-text",
  type: "symbol",
  layout: {
    "text-field": ["get", "REGION"],
    "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
    "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 7, 13],
    "text-transform": "uppercase",
    "text-letter-spacing": 0.04,
    "text-max-width": 8,
    "text-variable-anchor": ["center", "top", "bottom", "left", "right"],
    "text-radial-offset": 0.6,
    "text-justify": "auto",
  },
  paint: {
    "text-color": "#0f172a",
    "text-halo-color": "#ffffff",
    "text-halo-width": 1.4,
  },
};

const INDONESIA_FIT_BOUNDS: [[number, number], [number, number]] = [
  [94.5, -11.0],
  [141.5, 7.0],
];

const WIN_COLOR = "#21a647";
const LOSE_COLOR = "#c23837";

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
  win: number;
  lose: number;
  total: number;
  win_status: boolean;
  winner: string;
  winnerScore: number;
}

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
      winner: "-",
      winnerScore: -1,
    });

    const parsed = parseLosePerTotal(row.lose_per_total);
    if (!parsed) return;

    const won = isWinRow(row.benchmark) ? parsed.total : parsed.value;

    if (isWinRow(row.benchmark)) summary.win += parsed.total;
    else summary.lose += parsed.value;

    if (won > summary.winnerScore) {
      summary.winner = row.winner || "-";
      summary.winnerScore = won;
    }
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

  const [regionGeoJson, setRegionGeoJson] = useState<RegionGeoJson | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    fetch(REGION_GEOJSON_URL, { signal: controller.signal })
      .then((response) => response.json() as Promise<RegionGeoJson>)
      .then(setRegionGeoJson)
      .catch(() => {});

    return () => controller.abort();
  }, []);

  const labelPoints = useMemo(
    () => (regionGeoJson ? toLabelPoints(regionGeoJson) : null),
    [regionGeoJson],
  );

  const summaries = useMemo(() => summarizeRegions(rows), [rows]);

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

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 250 });
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 250 });
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
            {regionGeoJson && (
              <Source id={REGION_SOURCE_ID} type="geojson" data={regionGeoJson}>
                <Layer {...fillLayer} />
                <Layer {...borderLayer} />
              </Source>
            )}
            {labelPoints && (
              <Source
                id={REGION_LABEL_SOURCE_ID}
                type="geojson"
                data={labelPoints}
              >
                <Layer {...labelLayer} />
              </Source>
            )}
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
              <dt>Winner</dt>
              <dd className="truncate font-bold text-navy">
                {activeRegion.winner}
              </dd>
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
        </div>
      )}

      <div className="absolute right-4 bottom-4 z-10 flex flex-col overflow-hidden rounded-lg border border-[#e2e8f0] bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.1)]">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={handleZoomIn}
          className="flex size-8 cursor-pointer items-center justify-center border-b border-[#e2e8f0] text-[#334155] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
        >
          <LuPlus size={16} />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={handleZoomOut}
          className="flex size-8 cursor-pointer items-center justify-center text-[#334155] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
        >
          <LuMinus size={16} />
        </button>
      </div>
    </div>
  );
}
