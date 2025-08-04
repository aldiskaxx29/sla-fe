import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { debounce } from "@/plugins/utils/lodash";
import { bbox } from "@turf/turf";
import "./style.css";

import telkomselLogo from "@/assets/mobile-operator/telkomsel.png";
import xlLogo from "@/assets/mobile-operator/xl.png";
import { RegionKPI } from "@/modules/quality-healthiness/pages/QualityHealthinessPage";

const source = {
  region: "region-source",
};

const layer = {
  regionMap: "region-map",
  regionBorder: "region-border",
};

const baseIndonesiaMap = {
  center: [117.84082, -0.972203] as [number, number],
  zoom: 4.1,
  bounds: [
    [95, -11],
    [141, 6],
  ] as [[number, number], [number, number]],
};

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

interface MapMapProps {
  filter: {
    level: "region";
    location: string;
  };
  data: RegionKPI[];
  geojson: {
    region: GeoJSON.FeatureCollection | null;
  };
}

// Create custom DOM flag marker centered on coordinates
function createFlagMarker(logoUrl: string, text: string) {
  const wrapper = document.createElement("div");
  wrapper.className = "flag-marker";

  const flagWrapper = document.createElement("div");
  flagWrapper.className = "flag-wrapper";

  const pole = document.createElement("div");
  pole.className = "flag-pole";

  // --- WRAPPER untuk flag + text ---
  const flagContent = document.createElement("div");
  flagContent.className = "flag-content";

  const flag = document.createElement("div");
  flag.className = "flag-flag";

  const logo = document.createElement("img");
  logo.src = logoUrl;
  logo.className = "flag-logo";
  flag.appendChild(logo);

  const textDiv = document.createElement("div");
  textDiv.className = "flag-text";
  textDiv.textContent = text;

  // gabung flag + text
  flagContent.appendChild(flag);
  flagContent.appendChild(textDiv);

  // gabung ke wrapper utama
  flagWrapper.appendChild(pole);
  flagWrapper.appendChild(flagContent);
  wrapper.appendChild(flagWrapper);

  return wrapper;
}

const index: React.FC<MapMapProps> = ({ filter, data, geojson }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapWrapper = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      // style: "mapbox://styles/mapbox/light-v11",
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: "background",
            type: "background",
            paint: {
              "background-color": "#ffffff",
            },
          },
        ],
      },
      center: baseIndonesiaMap.center,
      // zoom: baseIndonesiaMap.zoom,
      trackResize: true,
      attributionControl: false,
      projection: "mercator",
    });

    map.once("load", () => {
      setIsMapLoaded(true);

      map.fitBounds(baseIndonesiaMap.bounds, {
        padding: 30,
        duration: 800,
      });
    });

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;
  }, []);

  // Map Resize Observer
  useEffect(() => {
    if (!isMapLoaded || !mapWrapper.current || !mapRef.current) return;
    const resizer = new ResizeObserver(
      debounce(() => mapRef.current!.resize(), 100)
    );
    resizer.observe(mapWrapper.current);
    return () => resizer.disconnect();
  }, [isMapLoaded]);

  useEffect(() => {
    if (!isMapLoaded || filter.level !== "region" || !geojson.region) return;

    const regionData = geojson.region.features.find(
      (f) =>
        f.properties?.region.toLowerCase() ===
        (filter.location ?? "").toLowerCase()
    );

    if (regionData) {
      const bboxData = bbox(regionData);
      mapRef.current!.fitBounds(
        [bboxData[0], bboxData[1], bboxData[2], bboxData[3]],
        {
          padding: 24,
        }
      );
    } else {
      mapRef.current?.flyTo({
        center: baseIndonesiaMap.center,
        duration: 1000,
        essential: true,
        zoom: baseIndonesiaMap.zoom,
      });
    }
  }, [isMapLoaded, filter.location, filter.level, geojson.region]);

  // Map Region Layer
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !geojson.region) return;

    const map = mapRef.current;

    if (!map.getSource(source.region)) {
      map.addSource(source.region, {
        type: "geojson",
        data: geojson.region,
        promoteId: "region",
      });
    }

    if (!map.getLayer(layer.regionMap)) {
      map.addLayer({
        id: layer.regionMap,
        type: "fill",
        source: source.region,
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            [
              "case",
              ["==", ["get", "region"], "KALIMANTAN"],
              "#d4af00",
              [
                "in",
                ["get", "region"],
                ["literal", ["SUMBAGUT", "MALUKU DAN PAPUA"]],
              ],
              "#990000",
              "#2b7a78",
            ],
            ["==", ["get", "region"], "KALIMANTAN"],
            "#ffff00",
            [
              "in",
              ["get", "region"],
              ["literal", ["SUMBAGUT", "MALUKU DAN PAPUA"]],
            ],
            "#ff0000",
            "#38a6a5",
          ],
          "fill-opacity": 0.65,
        },
      });
    }

    if (!map.getLayer(layer.regionBorder)) {
      map.addLayer({
        id: layer.regionBorder,
        type: "line",
        source: source.region,
        paint: {
          "line-color": "#ffffff",
          "line-width": 1,
        },
      });
    }
  }, [isMapLoaded, geojson.region]);

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !data || !geojson.region) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Wait for map to be fully loaded and idle
    const addMarkers = () => {
      geojson.region?.features.forEach((feature: GeoJSON.Feature) => {
        // ✅ Get centroid using turf (more accurate)
        const center: [number, number] = [
          feature.properties?.longitude as number,
          feature.properties?.latitude as number,
        ];

        const regionName = (feature.properties?.region ?? "").toUpperCase();

        const regionData = data.find(
          (d) => d.region.toUpperCase() === regionName
        );
        if (!regionData) return;

        const winnerOperator = regionData.operator;

        let logoUrl = "";
        if (winnerOperator === "telkomsel") logoUrl = telkomselLogo;
        if (winnerOperator === "xl") logoUrl = xlLogo;

        if (!logoUrl) return;

        const marker = new mapboxgl.Marker({
          element: createFlagMarker(logoUrl, "WINNER"),
          anchor: "bottom-left",
        })
          .setLngLat(center)
          .addTo(map);

        // Store marker for cleanup
        markersRef.current.push(marker);
      });
    };

    // Ensure map is fully loaded before adding markers
    if (map.loaded()) {
      // Small delay to ensure everything is rendered
      setTimeout(addMarkers, 100);
    } else {
      map.once("idle", addMarkers);
    }

    // Cleanup function
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [isMapLoaded, data, geojson.region]);

  useEffect(() => {
    if (!isMapLoaded || !geojson.region) return;

    const newSource = source.region;
    const layerList = [layer.regionMap];

    let hoverFeatureId: string | number | null = null;

    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.pointerEvents = "none";
    // tooltip.style.background = "white";
    // tooltip.style.padding = "4px 8px";
    // tooltip.style.borderRadius = "4px";
    // tooltip.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
    // tooltip.style.fontSize = "12px";
    // tooltip.style.fontWeight = "500";
    tooltip.style.transition = "opacity 0.1s";
    tooltip.style.opacity = "0";
    tooltip.style.zIndex = "1000";
    mapContainer.current?.appendChild(tooltip);

    function onMouseMove(e: mapboxgl.MapMouseEvent) {
      const map = mapRef.current!;
      const features = map.queryRenderedFeatures(e.point, {
        layers: layerList,
      });

      if (features.length > 0) {
        const feature = features[0];
        const id = feature.id;
        if (!id) return;

        if (hoverFeatureId !== id) {
          map.getCanvas().style.cursor = "pointer";
          if (hoverFeatureId !== null) {
            map.setFeatureState(
              {
                source: newSource,
                id: hoverFeatureId,
              } as mapboxgl.FeatureIdentifier,
              { hover: false }
            );
          }
          hoverFeatureId = id as string | number;
          map.setFeatureState(
            {
              source: newSource,
              id: hoverFeatureId,
            } as mapboxgl.FeatureIdentifier,
            { hover: true }
          );
        }

        const hoverName = feature.properties?.region as string;
        if (!hoverName) return;

        tooltip.innerHTML = `
          <div class="tooltip-card">
            <div class="tooltip-title">${hoverName}</div>

            <div class="tooltip-segment">
              <div class="segment-left">
                <span class="segment-label">Access Network</span>
              </div>
              <div class="segment-right">
                <span class="segment-value">99,95%</span>
                <div class="segment-detail">±9,11 K Site</div>
                <div class="segment-bar">
                  <div class="segment-bar-fill" style="width:99%;"></div>
                </div>
              </div>
            </div>

            <div class="tooltip-segment">
              <div class="segment-left">
                <span class="segment-label">Core Network</span>
              </div>
              <div class="segment-right">
                <span class="segment-value">100%</span>
                <div class="segment-detail">6 EBR, 2 PE Transit</div>
                <div class="segment-bar">
                  <div class="segment-bar-fill" style="width:100%;"></div>
                </div>
              </div>
            </div>

            <div class="tooltip-segment">
              <div class="segment-left">
                <span class="segment-label">CDN</span>
              </div>
              <div class="segment-right">
                <span class="segment-value">100%</span>
                <div class="segment-detail">2 CDN (AWS, GCP, OCA)</div>
                <div class="segment-bar">
                  <div class="segment-bar-fill" style="width:100%;"></div>
                </div>
              </div>
            </div>
          </div>
        `;

        tooltip.style.left = `${e.point.x + 12}px`;
        tooltip.style.top = `${e.point.y + 12}px`;
        tooltip.style.opacity = "1";
      } else {
        const map = mapRef.current!;
        map.getCanvas().style.cursor = "";
        if (hoverFeatureId !== null) {
          map.setFeatureState(
            {
              source: newSource,
              id: hoverFeatureId,
            } as mapboxgl.FeatureIdentifier,
            { hover: false }
          );
        }
        hoverFeatureId = null;
        tooltip.style.opacity = "0";
      }
    }

    function onMouseLeave() {
      tooltip.style.opacity = "0";
    }

    const map = mapRef.current!;
    map.on("mousemove", onMouseMove);
    map.on("mouseleave", layer.regionMap, onMouseLeave);

    return () => {
      map.off("mousemove", onMouseMove);
      map.off("mouseleave", layer.regionMap, onMouseLeave);
      tooltip.remove();
    };
  }, [isMapLoaded, filter.level, geojson.region]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div ref={mapWrapper} className="absolute top-0 right-0 left-0 bottom-0">
        <div id="map-area" ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
};

export default index;
