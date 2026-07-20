import React, { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

interface IspMapProps {
  activeSubTab: string;
  level: "region" | "city" | "national";
  location: string;
  mapType: "experience" | "benchmark";
  kpi: string;
  selectedProviders: string[];
  selectedBenchmarks: string[];
  mapWinnerColors: Record<string, string>;
  mapDataList: any[];
  benchmarkSummary: {
    benchmark: string;
    value: number;
    percentage: number;
    prevValue: number;
    prevPercentage: number;
  }[];
  getProviderConfig: (name: string) => any;
  providerPriority: "nine" | "all";
}

const BENCHMARK_COLORS: Record<string, string> = {
  win: "#0B8344",
  par: "#F0D12C",
  lose: "#E42313",
  unrecorded: "#8C8C8C",
};

const getBBox = (geojson: any): [number, number, number, number] => {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  const process = (coords: any) => {
    if (Array.isArray(coords) && typeof coords[0] === "number") {
      const [lng, lat] = coords;
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    } else if (Array.isArray(coords)) coords.forEach(process);
  };
  if (geojson.features) geojson.features.forEach((f: any) => process(f.geometry?.coordinates));
  else if (geojson.geometry) process(geojson.geometry.coordinates);
  return [minLng, minLat, maxLng, maxLat];
};

const buildFillColor = (
  mapType: "experience" | "benchmark",
  level: string,
  mapWinnerColors: Record<string, string>,
  mapDataList: any[],
  selectedBenchmarks: string[]
): any => {
  const isCityBoundaries = level === "city" || mapType === "benchmark";
  const propKey = isCityBoundaries ? "KABUPATEN" : "REGION";

  if (mapType === "experience") {
    if (Object.keys(mapWinnerColors).length === 0) return "#cbd5e1";
    const expr: any[] = ["match", ["downcase", ["get", propKey]]];
    Object.entries(mapWinnerColors).forEach(([name, color]) => {
      expr.push(name.toLowerCase(), color);
    });
    expr.push("#cbd5e1");
    return expr;
  } else {
    if (mapDataList.length === 0) return "#e2e8f0";
    const expr: any[] = ["match", ["downcase", ["get", propKey]]];
    const seen = new Set<string>();
    mapDataList.forEach((row) => {
      if (row.location && row.benchmark) {
        const b = row.benchmark.toLowerCase();
        const locKey = row.location.toLowerCase();
        if (selectedBenchmarks.includes(b) && !seen.has(locKey)) {
          seen.add(locKey);
          expr.push(locKey, BENCHMARK_COLORS[b] || "#e2e8f0");
        }
      }
    });
    expr.push("#e2e8f0");
    return expr;
  }
};

export const IspMap: React.FC<IspMapProps> = ({
  activeSubTab,
  level,
  location,
  mapType,
  kpi,
  selectedProviders,
  selectedBenchmarks,
  mapWinnerColors,
  mapDataList,
  benchmarkSummary,
  getProviderConfig,
  providerPriority,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  // Incremented each time the GeoJSON layer is successfully added — triggers color effect
  const [layerVersion, setLayerVersion] = useState(0);

  // Keep latest data accessible inside async callbacks without stale closures
  const mapDataListRef = useRef(mapDataList);
  const mapWinnerColorsRef = useRef(mapWinnerColors);
  const selectedBenchmarksRef = useRef(selectedBenchmarks);
  const kpiRef = useRef(kpi);
  const providerPriorityRef = useRef(providerPriority);
  useEffect(() => { mapDataListRef.current = mapDataList; }, [mapDataList]);
  useEffect(() => { mapWinnerColorsRef.current = mapWinnerColors; }, [mapWinnerColors]);
  useEffect(() => { selectedBenchmarksRef.current = selectedBenchmarks; }, [selectedBenchmarks]);
  useEffect(() => { kpiRef.current = kpi; }, [kpi]);
  useEffect(() => { providerPriorityRef.current = providerPriority; }, [providerPriority]);

  // Benchmark summary cards — current vs previous week, filtered by selection.
  const benchmarkLegend = useMemo(() => {
    if (mapType !== "benchmark") return [];
    return benchmarkSummary.filter((s) =>
      selectedBenchmarks.includes(s.benchmark)
    );
  }, [mapType, benchmarkSummary, selectedBenchmarks]);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeSubTab !== "map") {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapReady(false);
        setLayerVersion(0);
      }
      return;
    }
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [117.84082, -0.972203],
      zoom: 3.8,
      minZoom: 3.0,
      maxBounds: [[90.0, -15.0], [145.0, 10.0]],
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => setIsMapReady(true));

    return () => {
      map.remove();
      mapRef.current = null;
      setIsMapReady(false);
      setLayerVersion(0);
    };
  }, [activeSubTab]);

  // ── Load GeoJSON + add layers ─────────────────────────────────────────────
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    const map = mapRef.current;

    const isCityBoundaries = level === "city" || mapType === "benchmark";
    const geojsonPath = isCityBoundaries ? "/onx/geojson/city2.json" : "/onx/geojson/region.json";

    // Remove existing layers/source before re-adding
    ["boundaries-fill", "boundaries-border"].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource("boundaries")) map.removeSource("boundaries");
    setLayerVersion(0); // reset until new layers are added

    let cancelled = false;

    const token = localStorage.getItem("access_token");
    fetch(geojsonPath, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !mapRef.current) return;

        let features = data.features as any[];

        if (location) {
          features = features.filter((f) => {
            const fRegion = f.properties.REGION?.toLowerCase() || "";
            const fKab = f.properties.KABUPATEN?.toLowerCase() || "";
            return level === "region"
              ? fRegion === location.toLowerCase()
              : fKab === location.toLowerCase();
          });
          if (features.length > 0) {
            const [w, s, e, n] = getBBox({ type: "FeatureCollection", features });
            if (w !== Infinity) map.fitBounds([w, s, e, n], { padding: 24 });
          }
        } else {
          map.flyTo({ center: [117.84082, -0.972203], zoom: 3.8, duration: 600 });
        }

        // Build fill color immediately using latest data refs
        const fillColor = buildFillColor(
          mapType,
          level,
          mapWinnerColorsRef.current,
          mapDataListRef.current,
          selectedBenchmarksRef.current
        );

        map.addSource("boundaries", {
          type: "geojson",
          data: { type: "FeatureCollection", features },
        });

        map.addLayer({
          id: "boundaries-fill",
          type: "fill",
          source: "boundaries",
          paint: {
            "fill-color": fillColor,
            "fill-opacity": 0.72,
          },
        });

        map.addLayer({
          id: "boundaries-border",
          type: "line",
          source: "boundaries",
          paint: { "line-color": "#64748b", "line-width": 0.8, "line-opacity": 0.7 },
        });

        // Build the hover popup HTML for a location — top 3 providers only.
        const buildPopupHTML = (locName: string): string => {
          const curKpi = kpiRef.current;
          const curPriority = providerPriorityRef.current;
          const rows = mapDataListRef.current.filter(
            (r) => r.location?.toLowerCase() === locName.toLowerCase()
          );
          const isLowerBetter = ["latency", "jitter", "packetLoss", "packetloss"].includes(curKpi);

          let html = `<div style="padding:8px;font-family:sans-serif;min-width:170px;">
            <h4 style="margin:0 0 8px;font-weight:bold;color:#1e293b;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">${locName}</h4>`;

          if (mapType === "experience") {
            // Normalize both modes to a { label, value, color, winner } list.
            let items: { label: string; value: number; color: string; isWinner: boolean }[] = [];

            if (curPriority === "all") {
              items = rows
                .filter((row) => row[curKpi] != null)
                .map((row) => {
                  const conf = getProviderConfig(row.provider);
                  return { label: row.provider, value: Number(row[curKpi]), color: conf.color, isWinner: false };
                });
            } else if (rows.length > 0) {
              const row = rows[0];
              const nineProviders: { label: string; key: string }[] = [
                { label: "Indihome", key: "indihome" },
                { label: "Iconnets", key: "iconnets" },
                { label: "Indosat HiFi", key: "indosathifi" },
                { label: "XL Home", key: "xlhome" },
                { label: "CBN", key: "cbn" },
                { label: "MyRepublic", key: "myrepublic" },
                { label: "Biznet", key: "biznet" },
                { label: "Oxygen", key: "oxygen_id" },
                { label: "Megavision", key: "megavision" },
              ];
              const winnerColor = row.winner ? getProviderConfig(row.winner).color : null;
              items = nineProviders
                .filter((p) => row[p.key] != null)
                .map((p) => {
                  const conf = getProviderConfig(p.label);
                  return {
                    label: p.label,
                    value: Number(row[p.key]),
                    color: conf.color,
                    isWinner: !!winnerColor && winnerColor === conf.color,
                  };
                });
            }

            // Sort best-first and keep only the top 3.
            items.sort((a, b) => (isLowerBetter ? a.value - b.value : b.value - a.value));
            const top = items.slice(0, 3);

            html += `<table style="width:100%;border-collapse:collapse;font-size:12px;">`;
            if (top.length === 0) {
              html += `<tr><td style="padding:4px 0;color:#94a3b8;">No data</td></tr>`;
            }
            top.forEach((it, idx) => {
              html += `<tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:4px 0;font-weight:600;color:#475569;">
                  <span style="display:inline-block;width:14px;color:#94a3b8;">${idx + 1}.</span>
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${it.color};margin:0 6px;"></span>
                  ${it.label}${it.isWinner || idx === 0 ? " 🏆" : ""}
                </td>
                <td style="padding:4px 0;text-align:right;font-weight:bold;">${it.value.toFixed(2)}</td>
              </tr>`;
            });
            html += `</table>`;
          } else {
            if (rows.length > 0) {
              const row = rows[0];
              const sc = BENCHMARK_COLORS[row.benchmark?.toLowerCase()] || "#8C8C8C";
              html += `<div style="font-size:12px;margin-bottom:4px;display:flex;justify-content:space-between;">
                <span style="color:#64748b;">Winner:</span>
                <span style="font-weight:bold;">${row.winner || "-"}</span>
              </div>
              <div style="font-size:12px;display:flex;justify-content:space-between;">
                <span style="color:#64748b;">Status:</span>
                <span style="font-weight:bold;color:${sc};text-transform:uppercase;">${row.benchmark || "-"}</span>
              </div>`;
            } else {
              html += `<span style="font-size:12px;color:#94a3b8;">No data</span>`;
            }
          }
          html += `</div>`;
          return html;
        };

        // Hover popup that follows the cursor.
        let hoverPopup: mapboxgl.Popup | null = null;
        let hoverLoc: string | null = null;
        const propName = isCityBoundaries ? "KABUPATEN" : "REGION";

        map.on("mousemove", "boundaries-fill", (e) => {
          const feats = e.features;
          if (!feats?.length) return;
          const locName = feats[0].properties?.[propName];
          if (!locName) return;

          map.getCanvas().style.cursor = "pointer";
          if (!hoverPopup) {
            hoverPopup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 8,
            });
          }
          if (hoverLoc !== locName) {
            hoverLoc = locName;
            hoverPopup.setHTML(buildPopupHTML(locName));
          }
          hoverPopup.setLngLat(e.lngLat).addTo(map);
        });

        map.on("mouseleave", "boundaries-fill", () => {
          map.getCanvas().style.cursor = "";
          hoverLoc = null;
          hoverPopup?.remove();
        });

        // Signal that layers are ready
        setLayerVersion((v) => v + 1);
      })
      .catch((err) => console.error("GeoJSON load error:", err));

    return () => { cancelled = true; };
  }, [isMapReady, level, mapType, location]);

  // ── Reactively update fill color when data or benchmarks change ───────────
  useEffect(() => {
    if (!isMapReady || !mapRef.current || layerVersion === 0) return;
    const map = mapRef.current;
    if (!map.getLayer("boundaries-fill")) return;

    const fillColor = buildFillColor(mapType, level, mapWinnerColors, mapDataList, selectedBenchmarks);
    map.setPaintProperty("boundaries-fill", "fill-color", fillColor);
    map.setPaintProperty("boundaries-fill", "fill-opacity", mapDataList.length > 0 ? 0.72 : 0.4);
  }, [isMapReady, layerVersion, mapWinnerColors, mapDataList, selectedBenchmarks, mapType, level]);

  return (
    <div className="flex-1 relative w-full min-h-[450px]">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Benchmark summary card — top-right (current vs previous week) */}
      {mapType === "benchmark" && benchmarkLegend.length > 0 && (
        <div className="absolute top-3 right-12 z-10 flex flex-col gap-1.5 bg-white rounded-lg border-2 border-slate-200 shadow-lg p-2 min-w-[230px]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Benchmark Summary
          </p>
          {benchmarkLegend.map((b) => {
            const color = BENCHMARK_COLORS[b.benchmark] || "#8C8C8C";
            const surface: Record<string, string> = {
              win: "bg-green-50",
              par: "bg-yellow-50",
              lose: "bg-red-50",
              unrecorded: "bg-slate-100",
            };
            const deltaVal = b.value - b.prevValue;
            const deltaPct = b.percentage - b.prevPercentage;
            const sign = (n: number) => (n > 0 ? "+" : n < 0 ? "-" : "");
            return (
              <div
                key={b.benchmark}
                className={`rounded px-2 pt-1 pb-2 ${surface[b.benchmark] ?? "bg-slate-100"}`}
              >
                <div className="flex items-center gap-1.5 text-xs mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="font-bold capitalize flex-1"
                    style={{ color }}
                  >
                    {b.benchmark}
                  </span>
                  <span className="text-[11px] tabular-nums text-slate-600">
                    {sign(deltaVal)}
                    {Math.abs(deltaVal)}
                  </span>
                  <span className="w-px h-3.5 bg-slate-300" />
                  <span className="text-[11px] tabular-nums text-slate-600">
                    {sign(deltaPct)}
                    {Math.abs(deltaPct).toFixed(2)} %
                  </span>
                </div>
                <div className="flex items-stretch gap-2 text-[11px] text-slate-500">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-center text-slate-400">
                      Previous Week
                    </span>
                    <div className="flex items-center justify-evenly gap-1">
                      <span className="tabular-nums">{b.prevValue}</span>
                      <span className="w-px h-3.5 bg-slate-300" />
                      <span className="tabular-nums">
                        {b.prevPercentage.toFixed(2)} %
                      </span>
                    </div>
                  </div>
                  <span className="w-0.5 bg-slate-300 rounded" />
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-center text-slate-400">
                      Current Week
                    </span>
                    <div className="flex items-center justify-evenly gap-1">
                      <span className="tabular-nums font-semibold text-slate-700">
                        {b.value}
                      </span>
                      <span className="w-px h-3.5 bg-slate-300" />
                      <span className="tabular-nums font-semibold text-slate-700">
                        {b.percentage.toFixed(2)} %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Experience map provider legend — bottom-left */}
      {mapType === "experience" && Object.keys(mapWinnerColors).length > 0 && (
        <div className="absolute bottom-10 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-md p-2.5 max-w-[160px]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Winner</p>
          <div className="flex flex-col gap-1">
            {Array.from(
              new Map(
                Object.entries(mapWinnerColors).map(([loc, color]) => [color, loc])
              ).entries()
            ).map(([color, loc]) => (
              <div key={color} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-slate-600 font-medium capitalize truncate">{loc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
