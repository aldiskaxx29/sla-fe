import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  Source,
  type LayerProps,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { LuMinus, LuPlus } from "react-icons/lu";

import { Skeleton } from "@/app/components/atoms";

import { SelectMenu } from "@/app/components/molecules/SelectMenu";

import { useThrottledEvent } from "@/app/hooks/custom/pacer";

import { TICKET_SEVERITY_OPTIONS } from "@/app/api/ticket";
import type {
  TicketSeverityFilter,
  TicketSeverityMap,
} from "@/app/types/ticket/ticketQuality.types";
import { getTicketHeatColor } from "@/app/utils/ticketQuality.utils";

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ??
  import.meta.env.VITE_MAPBOX_TOKEN ??
  "";
const MAPBOX_STYLE_URL =
  import.meta.env.VITE_MAPBOX_STYLE_URL ?? "mapbox://styles/mapbox/light-v11";

const REGION_GEOJSON_URL = "/geojson/region.json";
const SOURCE_ID = "ticket-severity-region";
const FILL_LAYER_ID = "ticket-severity-region-fill";

const INDONESIA_FIT_BOUNDS: [[number, number], [number, number]] = [
  [94.5, -11.0],
  [141.5, 7.0],
];

type RegionGeoJson = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  { REGION?: string }
>;

const borderLayer: LayerProps = {
  id: "ticket-severity-region-border",
  type: "line",
  paint: { "line-color": "#ffffff", "line-width": 0.6 },
};

interface TicketSeverityMapPanelProps {
  data: TicketSeverityMap;
  severity: TicketSeverityFilter;
  onSeverityChange: (value: TicketSeverityFilter) => void;
  loading?: boolean;
  error?: boolean;
}

export function TicketSeverityMapPanel({
  data,
  severity,
  onSeverityChange,
  loading = false,
  error = false,
}: TicketSeverityMapPanelProps) {
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

  const [regionGeoJson, setRegionGeoJson] = useState<RegionGeoJson | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(REGION_GEOJSON_URL, { signal: controller.signal })
      .then((response) => response.json() as Promise<RegionGeoJson>)
      .then(setRegionGeoJson)
      .catch(() => {});

    return () => controller.abort();
  }, []);

  /** Warna tiap region dipetakan lewat ekspresi `match` milik Mapbox. */
  const fillLayer = useMemo<LayerProps>(() => {
    const matchPairs: string[] = [];

    data.regions.forEach((region) => {
      const name = region.region.toUpperCase();
      if (!name) return;

      matchPairs.push(
        name,
        getTicketHeatColor(region.ticketOpen, data.min, data.max),
      );
    });

    return {
      id: FILL_LAYER_ID,
      type: "fill",
      paint: {
        "fill-color": matchPairs.length
          ? [
              "match",
              ["upcase", ["get", "REGION"]],
              ...matchPairs,
              "rgba(0,0,0,0)",
            ]
          : "rgba(0,0,0,0)",
        "fill-opacity": 0.75,
      },
    };
  }, [data]);

  const handleZoomIn = useCallback(
    () => mapRef.current?.zoomIn({ duration: 250 }),
    [],
  );
  const handleZoomOut = useCallback(
    () => mapRef.current?.zoomOut({ duration: 250 }),
    [],
  );

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <h3 className="text-sm font-bold text-[#020617]">
          Distribution Severity Map
        </h3>

        <SelectMenu
          value={severity}
          options={[...TICKET_SEVERITY_OPTIONS]}
          onChange={(value) => onSeverityChange(value as TicketSeverityFilter)}
          className="[&_button]:h-9 [&_button]:w-[150px] [&_button]:rounded-lg [&_button]:border-[#e2e8f0] [&_button]:text-xs"
        />
      </header>

      <div className="px-3 pb-3">
        <div className="relative h-[340px] w-full overflow-hidden rounded-xl bg-[#f1f5f9]">
          {loading ? (
            <div className="absolute inset-0 p-3">
              <Skeleton height={316} />
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[#dc2626]">
              Gagal memuat peta severity.
            </div>
          ) : MAPBOX_TOKEN && MAPBOX_STYLE_URL ? (
            <div ref={containerRef} className="absolute inset-0">
              <Map
                ref={mapRef}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={MAPBOX_STYLE_URL}
                initialViewState={{
                  bounds: INDONESIA_FIT_BOUNDS,
                  fitBoundsOptions: { padding: 8 },
                }}
                onLoad={(event) =>
                  event.target.fitBounds(INDONESIA_FIT_BOUNDS, {
                    padding: 8,
                    duration: 0,
                  })
                }
                attributionControl={false}
                dragRotate={false}
                scrollZoom={false}
                style={{ width: "100%", height: "100%" }}
              >
                {regionGeoJson && (
                  <Source id={SOURCE_ID} type="geojson" data={regionGeoJson}>
                    <Layer {...fillLayer} />
                    <Layer {...borderLayer} />
                  </Source>
                )}
              </Map>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[#94a3b8]">
              Token Mapbox belum diatur.
            </div>
          )}

          <div className="pointer-events-none absolute top-3 right-3 left-3 flex flex-wrap items-start justify-between gap-2">
            <span className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#020617]">
              <span className="text-[#64748b]">Low</span>
              <span className="relative flex h-4 w-[120px] items-center justify-between rounded-[4px] bg-[linear-gradient(90deg,#22c55e_0%,#facc15_50%,#ef4444_100%)] px-1.5 text-[10px] font-bold text-white">
                <span>{data.min}</span>
                <span>{data.max}</span>
              </span>
              <span className="text-[#64748b]">High</span>
            </span>

            <span className="flex items-center gap-4 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[11px] text-[#64748b]">
              Total Ticket Open :
              <span className="font-bold text-[#020617]">
                {data.totalTicketOpen}
              </span>
            </span>
          </div>

          <div className="absolute right-3 bottom-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Perbesar peta"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-[#334155] shadow-[0px_4px_10px_rgba(2,6,23,0.12)]"
            >
              <LuPlus size={16} />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Perkecil peta"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-[#334155] shadow-[0px_4px_10px_rgba(2,6,23,0.12)]"
            >
              <LuMinus size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
