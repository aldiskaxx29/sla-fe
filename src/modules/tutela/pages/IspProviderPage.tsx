import React, { useEffect, useState, useMemo, useRef } from "react";
import { Select, DatePicker, Spin, Table } from "antd";
import {
  CompassOutlined,
  GlobalOutlined,
  AreaChartOutlined,
  TableOutlined,
  OrderedListOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import mapboxgl from "mapbox-gl";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

// ISP Provider Config
const providerConfig: Record<string, { color: string; bg: string }> = {
  indihome: { color: "#E42313", bg: "bg-[#E42313]" },
  biznet: { color: "#F05422", bg: "bg-[#F05422]" },
  xlhome: { color: "#00B38F", bg: "bg-[#00B38F]" },
  myrepublic: { color: "#922A8F", bg: "bg-[#922A8F]" },
  cbn: { color: "#0066B3", bg: "bg-[#0066B3]" },
  oxygen: { color: "#0B8344", bg: "bg-[#0B8344]" },
  default: { color: "#7F8C8D", bg: "bg-slate-500" },
};

const getProviderConfig = (name: string) => {
  const normalized = name?.toLowerCase() || "default";
  if (normalized.includes("indihome")) return providerConfig.indihome;
  if (normalized.includes("biznet")) return providerConfig.biznet;
  if (normalized.includes("xl")) return providerConfig.xlhome;
  if (normalized.includes("myrepublic")) return providerConfig.myrepublic;
  if (normalized.includes("cbn")) return providerConfig.cbn;
  if (normalized.includes("oxygen")) return providerConfig.oxygen;
  return providerConfig.default;
};

const getApiKpiKey = (kpiName: string) => {
  const norm = kpiName.toLowerCase();
  if (norm.includes("latency")) return "latency";
  if (norm.includes("jitter")) return "jitter";
  if (norm.includes("loss")) return "packet_loss";
  if (norm.includes("download")) return "speed_download";
  if (norm.includes("upload")) return "speed_upload";
  return "latency";
};

const IspProviderPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>("map");

  // Filter states
  const [level, setLevel] = useState<"national" | "region" | "city">("region");
  const [granularity, setGranularity] = useState<
    "daily" | "7 days" | "30 days" | "90 days"
  >("30 days");
  const [time, setTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [kpi, setKpi] = useState<string>("latency");
  const [providerPriority, setProviderPriority] = useState<"nine" | "all">(
    "nine",
  );
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    "Indihome",
    "Biznet",
    "XL Home",
    "MyRepublic",
    "CBN",
    "Oxygen",
  ]);
  const [timeRangeStart, setTimeRangeStart] = useState<string>("");
  const [timeRangeEnd, setTimeRangeEnd] = useState<string>("");

  // References
  const [weeksList, setWeeksList] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [defaultTimes, setDefaultTimes] = useState<Record<string, string>>({});

  // Data states
  const [loading, setLoading] = useState(false);
  const [ispCityLoseList, setIspCityLoseList] = useState<any | null>(null);
  const [ispTrendChartList, setIspTrendChartList] = useState<any | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

  // Load static references
  useEffect(() => {
    fetch("/onx/geojson/treg_region_pairing.json")
      .then((res) => res.json())
      .then((data) => {
        const uniqueRegions = Array.from(
          new Set<string>(data.map((item: any) => item.new_region)),
        ).sort();
        setRegions(uniqueRegions);
      })
      .catch((err) => console.error("Failed to load regions:", err));

    fetch("/onx/geojson/treg_city_pairing.json")
      .then((res) => res.json())
      .then((data) => {
        const uniqueCities = Array.from(
          new Set<string>(data.map((item: any) => item.city)),
        ).sort();
        setCities(uniqueCities);
      })
      .catch((err) => console.error("Failed to load cities:", err));

    fetch("/onx-api/api/v-list-weeks")
      .then((res) => res.json())
      .then((data) => {
        const weeks = data.map((w: any) => String(w.yearweek));
        setWeeksList(weeks);
      })
      .catch((err) => console.error("Failed to load weeks list:", err));

    fetch("/onx-api/api/v2/v-onx-last-period-time")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.statusCode === 200 && resData.data) {
          const defaults: Record<string, string> = {};
          resData.data.forEach((item: any) => {
            if (item.isMobile) {
              defaults[item.granularity] = item.time;
            }
          });
          setDefaultTimes(defaults);
          if (defaults["7 days"]) {
            setTime(defaults["7 days"]);
            setTimeRangeEnd(defaults["7 days"]);
            setTimeRangeStart(String(Number(defaults["7 days"]) - 4));
          }
        }
      })
      .catch((err) => console.error("Failed to load time defaults:", err));
  }, []);

  useEffect(() => {
    if (defaultTimes[granularity]) {
      setTime(defaultTimes[granularity]);
      setTimeRangeEnd(defaultTimes[granularity]);
      if (granularity === "daily") {
        setTimeRangeStart(
          dayjs(defaultTimes[granularity])
            .subtract(7, "day")
            .format("YYYY-MM-DD"),
        );
      } else {
        setTimeRangeStart(String(Number(defaultTimes[granularity]) - 4));
      }
    }
  }, [granularity, defaultTimes]);

  // Fetch ISP Experience City Lose data
  useEffect(() => {
    if (activeSubTab !== "city-lose" || !timeRangeStart || !timeRangeEnd)
      return;

    setLoading(true);
    const params = new URLSearchParams({
      start: timeRangeStart,
      end: timeRangeEnd,
      period: granularity.replace(" ", ""),
      isNineProvider: providerPriority === "nine" ? "true" : "false",
      level: "region",
    });

    fetch(`/onx-api/api/v2/f-onx-benchmark-isp-city-lose?${params.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.statusCode === 200 && resData.data) {
          setIspCityLoseList(resData.data);
        } else {
          setIspCityLoseList(null);
        }
      })
      .catch((err) => console.error("ISP City lose fetch failed:", err))
      .finally(() => setLoading(false));
  }, [
    activeSubTab,
    granularity,
    timeRangeStart,
    timeRangeEnd,
    providerPriority,
  ]);

  // Fetch ISP Experience Trend chart data
  useEffect(() => {
    if (activeSubTab !== "trend" || !timeRangeStart || !timeRangeEnd) return;

    setLoading(true);
    const params = new URLSearchParams({
      start: timeRangeStart,
      end: timeRangeEnd,
      period: granularity.replace(" ", ""),
      isNineProvider: providerPriority === "nine" ? "true" : "false",
      level: level === "city" ? "city" : "region",
    });

    fetch(`/onx-api/api/v2/f-onx-benchmark-isp-city-lose?${params.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.statusCode === 200 && resData.data) {
          setIspTrendChartList(resData.data);
        } else {
          setIspTrendChartList(null);
        }
      })
      .catch((err) => console.error("ISP Trend fetch failed:", err))
      .finally(() => setLoading(false));
  }, [
    activeSubTab,
    granularity,
    timeRangeStart,
    timeRangeEnd,
    providerPriority,
    level,
  ]);

  // Mapbox GL Rendering
  const regionWinnerColors = useMemo(() => {
    const winners: Record<string, string> = {};
    const mockWinners: Record<string, string> = {
      "INNER JABOTABEK": "biznet",
      "OUTER JABOTABEK": "myrepublic",
      JABAR: "biznet",
      "JATENG-DIY": "indihome",
      JATIM: "biznet",
      SUMBAGUT: "indihome",
      SUMBAGTENG: "cbn",
      SUMBAGSEL: "indihome",
      "BALI NUSRA": "biznet",
      KALIMANTAN: "indihome",
      SULAWESI: "oxygen",
      "MALUKU DAN PAPUA": "indihome",
    };

    Object.keys(mockWinners).forEach((regionName) => {
      const provName = mockWinners[regionName];
      if (selectedProviders.some((p) => p.toLowerCase().includes(provName))) {
        const config = getProviderConfig(provName);
        winners[regionName] = config.color;
      } else {
        winners[regionName] = "#cbd5e1";
      }
    });

    return winners;
  }, [selectedProviders]);

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
      fetch("/onx/geojson/region.json")
        .then((res) => res.json())
        .then((geojsonData) => {
          if (!mapInstanceRef.current) return;

          map.addSource("regions", {
            type: "geojson",
            data: geojsonData,
          });

          const matchExpr: any[] = ["match", ["get", "REGION"]];
          Object.keys(regionWinnerColors).forEach((regionName) => {
            matchExpr.push(regionName, regionWinnerColors[regionName]);
          });
          matchExpr.push("#cbd5e1");

          map.addLayer({
            id: "regions-fill",
            type: "fill",
            source: "regions",
            paint: {
              "fill-color": matchExpr,
              "fill-opacity": 0.6,
            },
          });

          map.addLayer({
            id: "regions-border",
            type: "line",
            source: "regions",
            paint: {
              "line-color": "#475569",
              "line-width": 1,
              "line-opacity": 0.8,
            },
          });

          map.on("click", "regions-fill", (e) => {
            const features = e.features;
            if (!features || features.length === 0) return;
            const regionName = features[0].properties?.REGION;

            let htmlContent = `<div style="padding:8px; font-family: sans-serif; min-width: 160px;">
              <h4 style="margin:0 0 8px 0; font-weight:bold; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">${regionName}</h4>
              <table style="width:100%; border-collapse:collapse; font-size:12px;">`;

            const mockIspVals: Record<string, number> = {
              Indihome:
                kpi === "latency"
                  ? 18.5
                  : kpi === "jitter"
                    ? 4.2
                    : kpi === "packetLoss"
                      ? 0.8
                      : kpi === "downloadSpeed"
                        ? 45.2
                        : 12.4,
              Biznet:
                kpi === "latency"
                  ? 12.1
                  : kpi === "jitter"
                    ? 2.8
                    : kpi === "packetLoss"
                      ? 0.3
                      : kpi === "downloadSpeed"
                        ? 85.6
                        : 45.2,
              "XL Home":
                kpi === "latency"
                  ? 16.4
                  : kpi === "jitter"
                    ? 3.5
                    : kpi === "packetLoss"
                      ? 0.6
                      : kpi === "downloadSpeed"
                        ? 62.4
                        : 22.8,
              MyRepublic:
                kpi === "latency"
                  ? 14.2
                  : kpi === "jitter"
                    ? 3.1
                    : kpi === "packetLoss"
                      ? 0.5
                      : kpi === "downloadSpeed"
                        ? 92.1
                        : 38.6,
              CBN:
                kpi === "latency"
                  ? 13.5
                  : kpi === "jitter"
                    ? 2.9
                    : kpi === "packetLoss"
                      ? 0.4
                      : kpi === "downloadSpeed"
                        ? 78.4
                        : 32.1,
              Oxygen:
                kpi === "latency"
                  ? 15.8
                  : kpi === "jitter"
                    ? 3.8
                    : kpi === "packetLoss"
                      ? 0.7
                      : kpi === "downloadSpeed"
                        ? 54.2
                        : 24.5,
            };

            Object.keys(mockIspVals).forEach((provName) => {
              if (selectedProviders.includes(provName)) {
                const provConf = getProviderConfig(provName);
                const val = mockIspVals[provName];
                htmlContent += `
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:4px 0; font-weight:600; color:#475569;">
                      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${provConf.color}; margin-right:6px;"></span>
                      ${provName}
                    </td>
                    <td style="padding:4px 0; text-align:right; font-weight:bold; color:#0f172a;">${val.toFixed(2)}</td>
                  </tr>`;
              }
            });

            htmlContent += `</table></div>`;

            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(htmlContent)
              .addTo(map);
          });

          map.on("mouseenter", "regions-fill", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "regions-fill", () => {
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
  }, [activeSubTab, regionWinnerColors, kpi, selectedProviders]);

  const handleProviderToggle = (prov: string) => {
    setSelectedProviders((prev) =>
      prev.includes(prov)
        ? prev.filter((item) => item !== prov)
        : [...prev, prov],
    );
  };

  const transformedIspCityLoseData = useMemo(() => {
    if (!ispCityLoseList || !ispCityLoseList.series) return [];

    const apiKpiKey = getApiKpiKey(kpi);
    const seriesData = ispCityLoseList.series[apiKpiKey] || [];

    return seriesData
      .map((item: any, idx: number) => {
        const startVal = item.data?.[0] ?? 0;
        const endVal = item.data?.[1] ?? 0;
        const diff = endVal - startVal;

        return {
          key: idx,
          location: item.name,
          startVal,
          endVal,
          diff,
        };
      })
      .sort((a: any, b: any) => b.endVal - a.endVal);
  }, [ispCityLoseList, kpi]);

  const cityLoseChartData = useMemo(() => {
    if (
      !ispCityLoseList ||
      !ispCityLoseList.categories ||
      !ispCityLoseList.series
    ) {
      return { labels: [], datasets: [] };
    }

    const apiKpiKey = getApiKpiKey(kpi);
    const seriesArray = ispCityLoseList.series[apiKpiKey] || [];
    const xAxisLabels = ispCityLoseList.categories.map(
      (c: any) => `W${String(c).slice(4)}`,
    );

    let chartDataPoints: number[] = [];
    let datasetLabel = "NATION";

    if (!location || location === "") {
      if (seriesArray.length > 0) {
        const totalPoints = seriesArray[0].data?.length || 0;
        chartDataPoints = Array(totalPoints).fill(0);
        seriesArray.forEach((reg: any) => {
          for (let i = 0; i < totalPoints; i++) {
            chartDataPoints[i] += reg.data?.[i] || 0;
          }
        });
      }
    } else {
      const selected = seriesArray.find(
        (reg: any) => reg.name?.toLowerCase() === location.toLowerCase(),
      );
      if (selected) {
        chartDataPoints = selected.data || [];
        datasetLabel = selected.name;
      }
    }

    return {
      labels: xAxisLabels,
      datasets: [
        {
          label: datasetLabel,
          data: chartDataPoints,
          borderColor: "#EE2E50",
          backgroundColor: "rgba(238, 46, 80, 0.1)",
          borderWidth: 2.5,
          tension: 0.4,
          pointStyle: "circle",
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
        },
      ],
    };
  }, [ispCityLoseList, kpi, location]);

  // Transformed chart data for ISP Trend Line Chart
  const ispTrendLineChartData = useMemo(() => {
    if (
      !ispTrendChartList ||
      !ispTrendChartList.categories ||
      !ispTrendChartList.series
    ) {
      return { labels: [], datasets: [] };
    }

    const apiKpiKey = getApiKpiKey(kpi);
    const seriesArray = ispTrendChartList.series[apiKpiKey] || [];
    const xAxisLabels = ispTrendChartList.categories.map(
      (c: any) => `W${String(c).slice(4)}`,
    );

    const providerColors: Record<string, string> = {
      Indihome: "#E42313",
      Biznet: "#F05422",
      "XL Home": "#00B38F",
      MyRepublic: "#922A8F",
      CBN: "#0066B3",
      Oxygen: "#0B8344",
    };

    // Each series item is a region. We aggregate or filter by location.
    // If no location selected, sum all regions into one line per provider
    // Since the endpoint returns by region, we plot each region as a line
    const datasets = seriesArray
      .filter((item: any) => {
        if (location) {
          return item.name?.toLowerCase() === location.toLowerCase();
        }
        return true;
      })
      .map((item: any, idx: number) => {
        // Cycle through provider colors by index
        const colorKeys = Object.values(providerColors);
        const color = colorKeys[idx % colorKeys.length];

        return {
          label: item.name,
          data: item.data || [],
          borderColor: color,
          backgroundColor: color + "1A",
          borderWidth: 2.5,
          tension: 0.4,
          pointStyle: "circle",
          pointRadius: 4,
          pointHoverRadius: 6,
          spanGaps: true,
          fill: false,
        };
      });

    return {
      labels: xAxisLabels,
      datasets,
    };
  }, [ispTrendChartList, kpi, location]);

  const ispRanksList = useMemo(() => {
    const baseScores: Record<
      string,
      {
        latency: number;
        jitter: number;
        loss: number;
        dlSpeed: number;
        score: number;
      }
    > = {
      Biznet: {
        latency: 12.1,
        jitter: 2.8,
        loss: 0.3,
        dlSpeed: 85.6,
        score: 94,
      },
      MyRepublic: {
        latency: 14.2,
        jitter: 3.1,
        loss: 0.5,
        dlSpeed: 92.1,
        score: 89,
      },
      CBN: { latency: 13.5, jitter: 2.9, loss: 0.4, dlSpeed: 78.4, score: 87 },
      Indihome: {
        latency: 18.5,
        jitter: 4.2,
        loss: 0.8,
        dlSpeed: 45.2,
        score: 82,
      },
      "XL Home": {
        latency: 16.4,
        jitter: 3.5,
        loss: 0.6,
        dlSpeed: 62.4,
        score: 80,
      },
      Oxygen: {
        latency: 15.8,
        jitter: 3.8,
        loss: 0.7,
        dlSpeed: 54.2,
        score: 76,
      },
    };

    return Object.keys(baseScores)
      .filter((k) => selectedProviders.includes(k))
      .map((name) => ({
        name,
        ...baseScores[name],
      }))
      .sort((a, b) => b.score - a.score);
  }, [selectedProviders]);

  const isTrendTab = activeSubTab === "trend";
  const isCityLoseTab = activeSubTab === "city-lose";
  const isRangeTime = isTrendTab || isCityLoseTab;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-stretch flex-1">
      {/* Left Sidebar Filter Panel */}
      <div className="w-full md:w-80 flex-shrink-0 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-6 h-fit">
        <div>
          <h2 className="text-md font-bold flex items-center gap-2 text-slate-900">
            <CompassOutlined className="text-sky-600" />
            Criteria Filters
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configured for ISP {activeSubTab}
          </p>
        </div>

        {/* Level Filter — shown on all tabs */}
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            Level
          </label>
          <Select
            value={level}
            onChange={(val: any) => {
              setLevel(val);
              setLocation("");
            }}
            className="w-full"
            options={
              activeSubTab === "city-lose"
                ? [
                    { label: "National", value: "national" as any },
                    { label: "Region", value: "region" },
                  ]
                : [
                    { label: "National", value: "national" as any },
                    { label: "Region", value: "region" },
                    { label: "City", value: "city" },
                  ]
            }
          />
        </div>

        {/* Location Selector — hidden when level is national */}
        {level !== "national" && (
          <div className="flex flex-col gap-2">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
              {level === "region" ? "Region" : "City"}
            </label>
            <Select
              showSearch
              placeholder={`Select ${level}`}
              value={location || undefined}
              onChange={(val) => setLocation(val)}
              className="w-full"
              options={
                level === "region"
                  ? regions.map((r) => ({ label: r, value: r }))
                  : cities.map((c) => ({ label: c, value: c }))
              }
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>
        )}

        {/* KPI Selector — hidden on Rank tab */}
        {activeSubTab !== "rank" && (
          <div className="flex flex-col gap-2">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
              KPI Metric
            </label>
            <Select
              value={kpi}
              onChange={(val) => setKpi(val)}
              className="w-full"
              options={[
                { label: "Latency (ms)", value: "latency" },
                { label: "Jitter (ms)", value: "jitter" },
                { label: "Packet Loss (%)", value: "packetLoss" },
                { label: "Download Speed (Mbps)", value: "downloadSpeed" },
                { label: "Upload Speed (Mbps)", value: "uploadSpeed" },
              ]}
            />
          </div>
        )}

        {/* ISP Provider Priority Selector — shown on Map, Rank, City Lose */}
        {(activeSubTab === "map" ||
          activeSubTab === "rank" ||
          activeSubTab === "city-lose") && (
          <div className="flex flex-col gap-2">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
              Provider Priority
            </label>
            <Select
              value={providerPriority}
              onChange={(val: any) => setProviderPriority(val)}
              className="w-full"
              options={[
                { label: "Benchmark (Nine Providers)", value: "nine" },
                { label: "All Providers", value: "all" },
              ]}
            />
          </div>
        )}

        {/* Period Granularity — ISP only supports 30 days and 90 days */}
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            Period Granularity
          </label>
          <Select
            value={granularity}
            onChange={(val) => setGranularity(val)}
            className="w-full"
            options={[
              { label: "30 Days", value: "30 days" },
              { label: "90 Days", value: "90 days" },
            ]}
          />
        </div>

        {/* Time Picker / Time Range Picker */}
        {!isRangeTime ? (
          <div className="flex flex-col gap-2">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
              Time
            </label>
            {granularity === "daily" ? (
              <DatePicker
                value={time ? dayjs(time) : null}
                onChange={(date) =>
                  setTime(date ? date.format("YYYY-MM-DD") : "")
                }
                format="YYYY-MM-DD"
                allowClear={false}
                className="w-full"
              />
            ) : (
              <Select
                placeholder="Select week"
                value={time || undefined}
                onChange={(val) => setTime(val)}
                className="w-full"
                options={weeksList.map((w) => ({
                  label: `W${w.slice(4)} - ${w.slice(0, 4)}`,
                  value: w,
                }))}
              />
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xxs font-bold text-slate-400 tracking-wider uppercase">
                Start Time
              </label>
              {granularity === "daily" ? (
                <DatePicker
                  value={timeRangeStart ? dayjs(timeRangeStart) : null}
                  onChange={(date) =>
                    setTimeRangeStart(date ? date.format("YYYY-MM-DD") : "")
                  }
                  format="YYYY-MM-DD"
                  allowClear={false}
                  className="w-full"
                />
              ) : (
                <Select
                  placeholder="Start week"
                  value={timeRangeStart || undefined}
                  onChange={(val) => setTimeRangeStart(val)}
                  className="w-full"
                  options={weeksList.map((w) => ({
                    label: `W${w.slice(4)} - ${w.slice(0, 4)}`,
                    value: w,
                  }))}
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xxs font-bold text-slate-400 tracking-wider uppercase">
                End Time
              </label>
              {granularity === "daily" ? (
                <DatePicker
                  value={timeRangeEnd ? dayjs(timeRangeEnd) : null}
                  onChange={(date) =>
                    setTimeRangeEnd(date ? date.format("YYYY-MM-DD") : "")
                  }
                  format="YYYY-MM-DD"
                  allowClear={false}
                  className="w-full"
                />
              ) : (
                <Select
                  placeholder="End week"
                  value={timeRangeEnd || undefined}
                  onChange={(val) => setTimeRangeEnd(val)}
                  className="w-full"
                  options={weeksList.map((w) => ({
                    label: `W${w.slice(4)} - ${w.slice(0, 4)}`,
                    value: w,
                  }))}
                />
              )}
            </div>
          </>
        )}

        {/* Providers checklist — shown on Map and Trend only */}
        {(activeSubTab === "map" || activeSubTab === "trend") && (
          <div className="flex flex-col gap-2">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
              Providers
            </label>
            <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {[
                "Indihome",
                "Biznet",
                "XL Home",
                "MyRepublic",
                "CBN",
                "Oxygen",
              ].map((prov) => {
                const checked = selectedProviders.includes(prov);
                const provConf = getProviderConfig(prov);
                return (
                  <label
                    key={prov}
                    className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-600 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleProviderToggle(prov)}
                      className="rounded text-sky-600 focus:ring-sky-500 border-slate-300 w-4 h-4 cursor-pointer"
                    />
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${provConf.bg}`}
                    ></span>
                    <span>{prov}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right Side Main Content View */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveSubTab("map")}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === "map"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <GlobalOutlined className="mr-1" />
            Map View
          </button>
          <button
            onClick={() => setActiveSubTab("trend")}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === "trend"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <AreaChartOutlined className="mr-1" />
            Trend
          </button>
          <button
            onClick={() => setActiveSubTab("rank")}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === "rank"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <OrderedListOutlined className="mr-1" />
            Rank
          </button>
          <button
            onClick={() => setActiveSubTab("city-lose")}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === "city-lose"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <TableOutlined className="mr-1" />
            City Lose
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center min-h-[400px]">
            <Spin size="large" tip="Loading view data..." />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {activeSubTab === "map" && (
              <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[500px]">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center gap-4 justify-between flex-wrap">
                  <div className="flex items-center gap-2">
                    <GlobalOutlined className="text-slate-500" />
                    <span className="font-bold text-sm text-slate-700">
                      ISP Provider Regional Benchmark Map
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {Object.keys(providerConfig)
                      .filter((k) => k !== "default")
                      .map((provName) => {
                        const provConf = providerConfig[provName];
                        return (
                          <div
                            key={provName}
                            className="flex items-center gap-1.5 text-xs font-semibold"
                          >
                            <span
                              className={`w-3 h-3 rounded-full ${provConf.bg}`}
                            ></span>
                            <span className="capitalize">{provName}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div
                  ref={mapContainerRef}
                  className="flex-1 min-h-[450px] relative w-full"
                />
              </div>
            )}

            {activeSubTab === "trend" && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
                <h3 className="font-bold text-md text-slate-900 mb-4 uppercase">
                  ISP Provider Trend Line Chart ({kpi})
                </h3>
                <div className="flex-1 relative min-h-[300px]">
                  {ispTrendChartList ? (
                    <Line
                      data={ispTrendLineChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                          mode: "index",
                          intersect: false,
                        },
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              boxWidth: 10,
                              font: { size: 11, weight: "bold" },
                            },
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context: any) {
                                let label = context.dataset.label || "";
                                if (label) {
                                  label += ": ";
                                }
                                if (context.parsed.y !== null) {
                                  label += context.parsed.y.toFixed(2);
                                }
                                return label;
                              },
                            },
                          },
                        },
                        scales: {
                          x: {
                            grid: { display: false },
                            ticks: { font: { size: 10 } },
                          },
                          y: {
                            grid: { color: "#f1f5f9" },
                            ticks: { font: { size: 10 } },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      Select time range to plot ISP provider trend chart.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSubTab === "rank" && (
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                  <StarOutlined className="text-yellow-500" />
                  ISP Provider Performance Rank Comparison
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ispRanksList.map((prov, index) => {
                    const provConf = getProviderConfig(prov.name);
                    return (
                      <div
                        key={prov.name}
                        className="border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col"
                      >
                        <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-sm font-black text-slate-400">
                            RANK #{index + 1}
                          </span>
                          <span className="text-xs font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-full">
                            Score: {prov.score}
                          </span>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-3.5 h-3.5 rounded-full ${provConf.bg}`}
                            ></span>
                            <span className="text-lg font-black text-slate-900">
                              {prov.name}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-500">
                            <div className="flex justify-between">
                              <span>Latency:</span>
                              <span className="text-slate-900 font-bold">
                                {prov.latency.toFixed(2)} ms
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Jitter:</span>
                              <span className="text-slate-900 font-bold">
                                {prov.jitter.toFixed(2)} ms
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Packet Loss:</span>
                              <span className="text-slate-900 font-bold">
                                {prov.loss.toFixed(2)} %
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Download Speed:</span>
                              <span className="text-slate-900 font-bold">
                                {prov.dlSpeed.toFixed(2)} Mbps
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSubTab === "city-lose" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-fit">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">
                    Benchmark ISP Provider Loses (By Region)
                  </h3>
                  <Table
                    dataSource={transformedIspCityLoseData}
                    columns={[
                      {
                        title: "Location / Region",
                        dataIndex: "location",
                        key: "location",
                        render: (val: string) => (
                          <span className="font-bold">{val}</span>
                        ),
                      },
                      {
                        title: `Start Period (${ispCityLoseList?.categories?.[0] || "Previous"})`,
                        dataIndex: "startVal",
                        key: "startVal",
                        render: (val: number) => val?.toFixed(2) || "0.00",
                      },
                      {
                        title: `End Period (${ispCityLoseList?.categories?.[1] || "Current"})`,
                        dataIndex: "endVal",
                        key: "endVal",
                        render: (val: number) => val?.toFixed(2) || "0.00",
                      },
                      {
                        title: "Change (Loses Count)",
                        dataIndex: "diff",
                        key: "diff",
                        render: (val: number) => {
                          const isBetter = val < 0;
                          return (
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${isBetter ? "text-emerald-600" : val > 0 ? "text-rose-600" : "text-slate-400"}`}
                            >
                              {val > 0 ? "+" : ""}
                              {val.toFixed(2)}
                            </span>
                          );
                        },
                      },
                    ]}
                    rowKey={(record) => record.location}
                    pagination={{ pageSize: 12 }}
                    className="border border-slate-100"
                  />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
                  <h3 className="font-bold text-md text-slate-900 mb-4">
                    Loses Trend Chart
                  </h3>
                  <div className="flex-1 relative min-h-[300px]">
                    {ispCityLoseList ? (
                      <Line
                        data={cityLoseChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            mode: "index",
                            intersect: false,
                          },
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                boxWidth: 10,
                                font: { size: 11, weight: "bold" },
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context: any) {
                                  let label = context.dataset.label || "";
                                  if (label) {
                                    label += ": ";
                                  }
                                  if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(2);
                                  }
                                  return label;
                                },
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: { display: false },
                              ticks: { font: { size: 10 } },
                            },
                            y: {
                              grid: { color: "#f1f5f9" },
                              ticks: { font: { size: 10 } },
                            },
                          },
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        Chart data loading...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IspProviderPage;
