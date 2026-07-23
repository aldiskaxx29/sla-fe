import React, { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

interface OperatorMapProps {
  activeSubTab: string;
  level: "region" | "city" | "national";
  location: string;
  mapType: "experience" | "benchmark";
  kpi: string;
  selectedOperators: string[];
  selectedBenchmarks: string[];
  mapWinnerColors: Record<string, string>;
  mapDataList: any[];
  getOperatorConfig: (name: string) => any;
  benchmarkSummary: {
    benchmark: string;
    value: number;
    percentage: number;
    prevValue: number;
    prevPercentage: number;
  }[];
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

const getFeatureLocName = (properties: any, isCityBoundaries: boolean): string => {
  if (!properties) return "";
  if (isCityBoundaries) {
    return (
      properties.KABUPATEN ||
      properties.kabupaten ||
      properties.Kabupaten ||
      properties.city ||
      properties.CITY ||
      properties.City ||
      ""
    );
  }
  return (
    properties.REGION ||
    properties.region ||
    properties.Region ||
    properties.new_region ||
    properties.NEW_REGION ||
    ""
  );
};

const buildFillColor = (
  mapType: "experience" | "benchmark",
  level: string,
  mapWinnerColors: Record<string, string>,
  mapDataList: any[],
  selectedBenchmarks: string[]
): any => {
  const isCityBoundaries = level === "city" || mapType === "benchmark";
  const propGetter = isCityBoundaries
    ? ["coalesce", ["get", "KABUPATEN"], ["get", "kabupaten"], ["get", "Kabupaten"], ["get", "city"], ["get", "CITY"], ["get", "City"], ""]
    : ["coalesce", ["get", "REGION"], ["get", "region"], ["get", "Region"], ["get", "new_region"], ["get", "NEW_REGION"], ""];

  if (mapType === "experience") {
    if (Object.keys(mapWinnerColors).length === 0) return "#cbd5e1";
    const expr: any[] = ["match", ["downcase", propGetter]];
    Object.entries(mapWinnerColors).forEach(([name, color]) => {
      expr.push(name.toLowerCase(), color);
    });
    expr.push("#cbd5e1");
    return expr;
  } else {
    if (mapDataList.length === 0) return "#e2e8f0";
    const expr: any[] = ["match", ["downcase", propGetter]];
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

const geojsonCache = new Map<string, Promise<any>>();

const getGeoJSONData = (url: string, token?: string): Promise<any> => {
  if (geojsonCache.has(url)) {
    return geojsonCache.get(url)!;
  }
  const promise = fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
      return r.json();
    })
    .catch((err) => {
      geojsonCache.delete(url);
      throw err;
    });

  geojsonCache.set(url, promise);
  return promise;
};

export const OperatorMap: React.FC<OperatorMapProps> = ({
  activeSubTab,
  level,
  location,
  mapType,
  kpi,
  selectedOperators,
  selectedBenchmarks,
  mapWinnerColors,
  mapDataList,
  getOperatorConfig,
  benchmarkSummary,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [layerVersion, setLayerVersion] = useState(0);

  // Keep latest data refs for async callbacks (like click events)
  const mapDataListRef = useRef(mapDataList);
  const mapWinnerColorsRef = useRef(mapWinnerColors);
  const selectedBenchmarksRef = useRef(selectedBenchmarks);
  const selectedOperatorsRef = useRef(selectedOperators);
  const kpiRef = useRef(kpi);

  useEffect(() => { mapDataListRef.current = mapDataList; }, [mapDataList]);
  useEffect(() => { mapWinnerColorsRef.current = mapWinnerColors; }, [mapWinnerColors]);
  useEffect(() => { selectedBenchmarksRef.current = selectedBenchmarks; }, [selectedBenchmarks]);
  useEffect(() => { selectedOperatorsRef.current = selectedOperators; }, [selectedOperators]);
  useEffect(() => { kpiRef.current = kpi; }, [kpi]);

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
    const apiPrefix = import.meta.env.DEV ? "/qosmo/api" : "/api";
    const geojsonPath = isCityBoundaries ? `${apiPrefix}/geojson/city` : `${apiPrefix}/geojson/region`;

    // Remove existing layers/source before re-adding
    ["boundaries-fill", "boundaries-border"].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource("boundaries")) map.removeSource("boundaries");
    setLayerVersion(0);

    let cancelled = false;

    const token =
      localStorage.getItem("access_token") ||
      import.meta.env.VITE_DAILY_MONITORING_TOKEN;

    getGeoJSONData(geojsonPath, token)
      .then((data) => {
        if (cancelled || !mapRef.current) return;

        if (!data || !Array.isArray(data.features)) {
          console.warn("GeoJSON response invalid or missing features:", data);
          return;
        }

        let features = data.features as any[];

        if (location) {
          features = features.filter((f) => {
            const locName = getFeatureLocName(f.properties, isCityBoundaries);
            return locName.toLowerCase() === location.toLowerCase();
          });
          if (features.length > 0) {
            const [w, s, e, n] = getBBox({ type: "FeatureCollection", features });
            if (w !== Infinity) map.fitBounds([w, s, e, n], { padding: 24 });
          }
        } else {
          map.flyTo({ center: [117.84082, -0.972203], zoom: 3.8, duration: 600 });
        }

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
            "fill-opacity": 0.6,
          },
        });

        map.addLayer({
          id: "boundaries-border",
          type: "line",
          source: "boundaries",
          paint: { "line-color": "#475569", "line-width": 1, "line-opacity": 0.8 },
        });

        // Click popup handler
        map.on("click", "boundaries-fill", (e) => {
          const feats = e.features;
          if (!feats || feats.length === 0) return;
          const locName = getFeatureLocName(feats[0].properties, isCityBoundaries);
          if (!locName) return;

          const rows = mapDataListRef.current.filter(
            (r) => r.location?.toLowerCase() === locName.toLowerCase()
          );

          let htmlContent = `<div style="padding:8px; font-family: sans-serif;">
            <h4 style="margin:0 0 8px 0; font-weight:bold; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">${locName}</h4>`;

          if (mapType === "experience") {
            const curKpi = kpiRef.current;
            const curOps = selectedOperatorsRef.current;
            const isLowerBetter = ["latency", "jitter", "packetloss", "packetLoss"].includes(curKpi);

            let bestRow: any = null;
            let bestVal = isLowerBetter ? Infinity : -Infinity;

            rows.forEach((row) => {
              const isSelected = curOps.some(
                (op) => op.toLowerCase() === row.operator?.toLowerCase()
              );
              if (isSelected) {
                const val = row[curKpi];
                if (val !== undefined && val !== null) {
                  if (
                    (isLowerBetter && val < bestVal) ||
                    (!isLowerBetter && val > bestVal)
                  ) {
                    bestVal = val;
                    bestRow = row;
                  }
                }
              }
            });

            htmlContent += `<table style="width:100%; border-collapse:collapse; font-size:12px;">`;
            rows.forEach((row) => {
              const isSelected = curOps.some(
                (op) => op.toLowerCase() === row.operator?.toLowerCase()
              );
              if (isSelected) {
                const val = row[curKpi];
                const opConf = getOperatorConfig(row.operator);
                const isWinner = bestRow && bestRow.operator === row.operator;
                if (val !== undefined && val !== null) {
                  htmlContent += `
                    <tr style="border-bottom:1px solid #f1f5f9; ${
                      isWinner ? "background-color:#f8fafc; font-weight:bold;" : ""
                    }">
                      <td style="padding:4px 0; color:#475569;">
                        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${
                          opConf.color
                        }; margin-right:6px;"></span>
                        ${row.operator}
                      </td>
                      <td style="padding:4px 0; text-align:right; color:#0f172a;">${val.toFixed(
                        2,
                      )}</td>
                    </tr>`;
                }
              }
            });
            htmlContent += `</table>`;
          } else {
            // Benchmark Mode
            if (rows.length > 0) {
              const row = rows[0];
              const statusColor =
                row.benchmark?.toLowerCase() === "win"
                  ? "#0B8344"
                  : row.benchmark?.toLowerCase() === "par"
                  ? "#F0D12C"
                  : row.benchmark?.toLowerCase() === "lose"
                  ? "#E42313"
                  : "#8C8C8C";

              htmlContent += `
                <div style="font-size:12px; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
                  <span style="color:#64748b;">Winner:</span>
                  <span style="font-weight:bold; color:#0f172a;">${row.winner || "-"}</span>
                </div>
                <div style="font-size:12px; display:flex; justify-content:space-between; align-items:center;">
                  <span style="color:#64748b;">Status:</span>
                  <span style="font-weight:bold; color:${statusColor}; text-transform:uppercase;">${
                row.benchmark || "-"
              }</span>
                </div>
              `;
            } else {
              htmlContent += `<div style="font-size:12px; color:#94a3b8;">No benchmark data available</div>`;
            }
          }

          htmlContent += `</div>`;

          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(htmlContent)
            .addTo(map);
        });

        map.on("mouseenter", "boundaries-fill", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "boundaries-fill", () => {
          map.getCanvas().style.cursor = "";
        });

        setLayerVersion((v) => v + 1);
      })
      .catch((err) => console.error("Error loading map GeoJSON:", err));

    return () => { cancelled = true; };
  }, [isMapReady, level, mapType, location]);

  // ── Reactively update fill color when data or benchmarks change ───────────
  useEffect(() => {
    if (!isMapReady || !mapRef.current || layerVersion === 0) return;
    const map = mapRef.current;
    if (!map.getLayer("boundaries-fill")) return;

    const fillColor = buildFillColor(mapType, level, mapWinnerColors, mapDataList, selectedBenchmarks);
    map.setPaintProperty("boundaries-fill", "fill-color", fillColor);
  }, [isMapReady, layerVersion, mapWinnerColors, mapDataList, selectedBenchmarks, mapType, level]);

  return (
    <div className="flex-1 relative w-full min-h-[450px]">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Benchmark Summary Card — absolute layout top-right */}
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
    </div>
  );
};
