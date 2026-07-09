import React, { useEffect, useRef } from "react";
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
}

const getBBox = (geojson: any): [number, number, number, number] => {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const processCoords = (coords: any) => {
    if (Array.isArray(coords) && typeof coords[0] === "number") {
      const [lng, lat] = coords;
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    } else if (Array.isArray(coords)) {
      coords.forEach(processCoords);
    }
  };

  if (geojson.features) {
    geojson.features.forEach((f: any) => {
      processCoords(f.geometry?.coordinates);
    });
  } else if (geojson.geometry) {
    processCoords(geojson.geometry.coordinates);
  } else {
    processCoords(geojson);
  }

  return [minLng, minLat, maxLng, maxLat];
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
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (activeSubTab !== "map" || !mapContainerRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [117.84082, -0.972203],
      zoom: 3.8,
      minZoom: 3.8,
      maxBounds: [
        [90.0, -15.0], // Southwest bounds of Indonesia (padded)
        [145.0, 10.0], // Northeast bounds of Indonesia (padded)
      ],
    });

    mapInstanceRef.current = map;

    map.on("load", () => {
      const isCityBoundaries = level === "city" || mapType === "benchmark";
      const geojsonPath = isCityBoundaries
        ? "/onx/geojson/city2.json"
        : "/onx/geojson/region.json";

      fetch(geojsonPath)
        .then((res) => res.json())
        .then((geojsonData) => {
          if (!mapInstanceRef.current) return;

          let filteredFeatures = geojsonData.features;
          if (location) {
            filteredFeatures = geojsonData.features.filter((f: any) => {
              const fRegion = f.properties.REGION?.toLowerCase() || "";
              const fKab = f.properties.KABUPATEN?.toLowerCase() || "";
              const locLower = location.toLowerCase();

              if (level === "region") {
                return fRegion === locLower;
              } else {
                return fKab === locLower;
              }
            });

            if (filteredFeatures.length > 0) {
              const [minLng, minLat, maxLng, maxLat] = getBBox({
                type: "FeatureCollection",
                features: filteredFeatures,
              });
              if (minLng !== Infinity && minLat !== Infinity) {
                map.fitBounds([minLng, minLat, maxLng, maxLat], { padding: 24 });
              }
            }
          }

          map.addSource("boundaries", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: filteredFeatures,
            },
          });

          let fillColorExpr: any;
          if (mapType === "experience") {
            const matchExpr: any[] = [
              "match",
              ["downcase", ["get", isCityBoundaries ? "KABUPATEN" : "REGION"]],
            ];
            Object.keys(mapWinnerColors).forEach((name) => {
              matchExpr.push(name.toLowerCase(), mapWinnerColors[name]);
            });
            matchExpr.push("#cbd5e1");
            fillColorExpr = matchExpr;
          } else {
            // Benchmark Mode
            const matchExpr: any[] = [
              "match",
              ["downcase", ["get", "KABUPATEN"]],
            ];
            mapDataList.forEach((row) => {
              if (row.location && row.benchmark) {
                const b = row.benchmark.toLowerCase();
                const isSelected = selectedBenchmarks.includes(b);
                let color = "transparent";
                if (isSelected) {
                  if (b === "win") color = "#0B8344";
                  else if (b === "par") color = "#F0D12C";
                  else if (b === "lose") color = "#E42313";
                  else if (b === "unrecorded") color = "#8C8C8C";
                }
                matchExpr.push(row.location.toLowerCase(), color);
              }
            });
            matchExpr.push("transparent");
            fillColorExpr = matchExpr;
          }

          map.addLayer({
            id: "boundaries-fill",
            type: "fill",
            source: "boundaries",
            paint: {
              "fill-color": fillColorExpr,
              "fill-opacity": 0.6,
            },
          });

          map.addLayer({
            id: "boundaries-border",
            type: "line",
            source: "boundaries",
            paint: {
              "line-color": "#475569",
              "line-width": 1,
              "line-opacity": 0.8,
            },
          });

          map.on("click", "boundaries-fill", (e) => {
            const features = e.features;
            if (!features || features.length === 0) return;

            const propName = isCityBoundaries ? "KABUPATEN" : "REGION";
            const locName = features[0].properties?.[propName];
            if (!locName) return;

            const matchingRows = mapDataList.filter(
              (r) => r.location?.toLowerCase() === locName.toLowerCase(),
            );

            let htmlContent = `<div style="padding:8px; font-family: sans-serif;">
              <h4 style="margin:0 0 8px 0; font-weight:bold; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">${locName}</h4>`;

            if (mapType === "experience") {
              const isLowerBetter = [
                "latency",
                "jitter",
                "packetloss",
                "packetLoss",
              ].includes(kpi);

              let bestRow: any = null;
              let bestVal = isLowerBetter ? Infinity : -Infinity;

              matchingRows.forEach((row) => {
                const isSelected = selectedOperators.some(
                  (op) => op.toLowerCase() === row.operator?.toLowerCase(),
                );
                if (isSelected) {
                  const val = row[kpi];
                  if (val !== undefined && val !== null) {
                    if (isLowerBetter) {
                      if (val < bestVal) {
                        bestVal = val;
                        bestRow = row;
                      }
                    } else {
                      if (val > bestVal) {
                        bestVal = val;
                        bestRow = row;
                      }
                    }
                  }
                }
              });

              htmlContent += `<table style="width:100%; border-collapse:collapse; font-size:12px;">`;

              matchingRows.forEach((row) => {
                const isSelected = selectedOperators.some(
                  (op) => op.toLowerCase() === row.operator?.toLowerCase(),
                );
                if (isSelected) {
                  const val = row[kpi];
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
              if (matchingRows.length > 0) {
                const row = matchingRows[0];
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
        })
        .catch((err) => console.error("Error loading map GeoJSON:", err));
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    activeSubTab,
    mapWinnerColors,
    mapDataList,
    kpi,
    mapType,
    level,
    location,
    selectedBenchmarks,
    selectedOperators,
  ]);

  return (
    <div
      ref={mapContainerRef}
      className="flex-1 min-h-[450px] relative w-full"
    />
  );
};
