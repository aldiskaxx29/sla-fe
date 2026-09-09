import { useState, useRef, useEffect } from "react";
import Map, { Layer, Source, type LayerProps, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { LuInfo, LuPlus, LuMinus } from "react-icons/lu";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";
import { useThrottledEvent } from "@/app/hooks/custom/pacer";
import { useRegionPerformanceQuery } from "@/app/hooks/query/monday/ticketQuality";

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

const regionFillLayer: LayerProps = {
  id: "region-performance-fill-ticket",
  type: "fill",
  paint: {
    "fill-color": [
      "match",
      ["get", "REGION"],
      "SUMBAGSEL",
      "#DC3545",
      "SUMBAGTENG",
      "#DC3545",
      "SUMBAGUT",
      "#28A745",
      "INNER JABOTABEK",
      "#28A745",
      "OUTER JABOTABEK",
      "#28A745",
      "JABAR",
      "#28A745",
      "JATENG-DIY",
      "#28A745",
      "JATIM",
      "#28A745",
      "BALI NUSRA",
      "#FFC107",
      "KALIMANTAN",
      "#DC3545",
      "SULAWESI",
      "#DC3545",
      "MALUKU DAN PAPUA",
      "#28A745",
      "rgba(0,0,0,0)",
    ],
    "fill-opacity": 0.4,
  },
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
  const [performanceFilter, setPerformanceFilter] = useState("All Performance");
  const { data: regions = [] } = useRegionPerformanceQuery(performanceFilter);
  const [viewTab, setViewTab] = useState<"map" | "detail">("map");

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
            options={[
              { label: "All Performance", value: "All Performance" },
              { label: "Critical", value: "Critical" },
              { label: "Warning", value: "Warning" },
              { label: "Good", value: "Good" },
            ]}
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
                  <Layer {...regionFillLayer} />
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
              {regions.map((region) => (
                <div
                  key={region.id}
                  className="pointer-events-auto flex-1 max-w-[140px] rounded-xl border border-slate-100 bg-white/95 p-1.5 shadow-md backdrop-blur-xs transition-transform hover:scale-102"
                >
                  <header className="flex items-center justify-between border-b border-slate-100 pb-0.5">
                    <span className="text-[8px] font-extrabold text-[#213c52]">
                      {region.name}
                    </span>
                    <span className="rounded bg-red-50 px-1 py-0.5 text-[7px] font-extrabold text-red-500 uppercase tracking-wider">
                      {region.status}
                    </span>
                  </header>
                  <div className="mt-1 flex flex-col gap-0.5 text-[8px] font-semibold text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Latency :</span>
                      <span className="font-extrabold text-slate-800">
                        {region.latency.value} ({region.latency.percentage})
                      </span>
                      <span className="flex items-center text-emerald-500 font-extrabold">
                        ↓ {region.latency.wowValue} WoW
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>PL :</span>
                      <span className="font-extrabold text-slate-800">
                        {region.packetLoss.value} ({region.packetLoss.percentage})
                      </span>
                      <span className="flex items-center text-red-500 font-extrabold">
                        ↑ {region.packetLoss.wowValue} WoW
                      </span>
                    </div>
                  </div>
                </div>
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
          <div className="p-4 text-xs font-semibold text-slate-500 text-center flex h-full items-center justify-center">
            No detail data available.
          </div>
        )}
      </div>
    </div>
  );
}
