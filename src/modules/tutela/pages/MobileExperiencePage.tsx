import { useEffect, useState, useMemo, useRef } from "react";
import { Select, DatePicker, Spin, Table } from "antd";
import {
  CompassOutlined,
  GlobalOutlined,
  AreaChartOutlined,
  TableOutlined,
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

const operatorConfig: Record<
  string,
  { color: string; bg: string; text: string; label: string }
> = {
  telkomsel: {
    color: "#E42313",
    bg: "bg-[#E42313]",
    text: "text-[#E42313]",
    label: "T",
  },
  indosat: {
    color: "#F0D12C",
    bg: "bg-[#F0D12C]",
    text: "text-[#F0D12C]",
    label: "I",
  },
  xl: {
    color: "#046CDD",
    bg: "bg-[#046CDD]",
    text: "text-[#046CDD]",
    label: "X",
  },
  smartfren: {
    color: "#7648ba",
    bg: "bg-[#7648ba]",
    text: "text-[#7648ba]",
    label: "S",
  },
  three: {
    color: "#262626",
    bg: "bg-[#262626]",
    text: "text-[#262626]",
    label: "3",
  },
  tri: {
    color: "#262626",
    bg: "bg-[#262626]",
    text: "text-[#262626]",
    label: "3",
  },
  default: {
    color: "#999999",
    bg: "bg-slate-400",
    text: "text-slate-400",
    label: "O",
  },
};

const getOperatorConfig = (name: string) => {
  const normalized = name?.toLowerCase() || "default";
  if (normalized.includes("telkomsel")) return operatorConfig.telkomsel;
  if (normalized.includes("indosat")) return operatorConfig.indosat;
  if (normalized.includes("xl")) return operatorConfig.xl;
  if (normalized.includes("smartfren")) return operatorConfig.smartfren;
  if (normalized.includes("three") || normalized.includes("tri"))
    return operatorConfig.three;
  return operatorConfig.default;
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

const MobileExperiencePage = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>("map");

  // Filter states
  const [level, setLevel] = useState<"national" | "region" | "city">(
    "national",
  );
  const [granularity, setGranularity] = useState<
    "daily" | "7 days" | "30 days" | "90 days"
  >("7 days");
  const [time, setTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [kpi, setKpi] = useState<string>("latency");
  const [selectedOperators, setSelectedOperators] = useState<string[]>([
    "Telkomsel",
    "Indosat",
    "XL",
    "Smartfren",
    "Tri",
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
  const [mapDataList, setMapDataList] = useState<any[]>([]);
  const [trendChartDataList, setTrendChartDataList] = useState<any[]>([]);
  const [cityLoseList, setCityLoseList] = useState<any | null>(null);

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

  // Fetch Map Data
  useEffect(() => {
    if (activeSubTab !== "map" || !time) return;

    setLoading(true);
    const apiGranularity = granularity.replace(" ", "");
    const urlParams = new URLSearchParams();
    if (granularity === "daily") {
      urlParams.append("date", dayjs(time).format("YYYY-MM-DD"));
    } else {
      urlParams.append("yearweek", time);
    }

    fetch(
      `/onx-api/api/v2/quality-experience/map/region/${apiGranularity}?${urlParams.toString()}`,
    )
      .then((res) => res.json())
      .then((resData) => {
        if (resData.statusCode === 200 && resData.data) {
          setMapDataList(resData.data);
        } else {
          setMapDataList([]);
        }
      })
      .catch((err) => console.error("Map data fetch failed:", err))
      .finally(() => setLoading(false));
  }, [activeSubTab, granularity, time]);

  // Fetch Trend and City Lose Data
  useEffect(() => {
    if (activeSubTab === "trend" && timeRangeStart && timeRangeEnd) {
      setLoading(true);
      const apiLevel =
        level === "national"
          ? "nation"
          : level === "city"
            ? "kabupaten"
            : level;
      const apiGranularity = granularity.replace(" ", "");
      const params = new URLSearchParams({
        start_at: timeRangeStart,
        end_at: timeRangeEnd,
      });
      if (location) {
        params.append("inq_location", location);
      }

      fetch(
        `/onx-api/api/v2/quality-experience/chart/${apiLevel}/${apiGranularity}?${params.toString()}`,
      )
        .then((res) => res.json())
        .then((resData) => {
          if (resData.statusCode === 200 && resData.data) {
            setTrendChartDataList(resData.data);
          } else {
            setTrendChartDataList([]);
          }
        })
        .catch((err) => console.error("Trend fetch failed:", err))
        .finally(() => setLoading(false));
    }

    if (activeSubTab === "city-lose" && timeRangeStart && timeRangeEnd) {
      setLoading(true);
      const params = new URLSearchParams({
        start: timeRangeStart,
        end: timeRangeEnd,
        period: granularity.replace(" ", ""),
        isNineProvider: "false",
        level: level === "national" ? "region" : level,
      });

      fetch(`/onx-api/api/v2/f-onx-benchmark-mobile?${params.toString()}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.statusCode === 200 && resData.data) {
            setCityLoseList(resData.data);
          } else {
            setCityLoseList(null);
          }
        })
        .catch((err) => console.error("City lose fetch failed:", err))
        .finally(() => setLoading(false));
    }
  }, [
    activeSubTab,
    granularity,
    timeRangeStart,
    timeRangeEnd,
    level,
    location,
  ]);

  // Mapbox GL Logic
  const regionWinnerColors = useMemo(() => {
    if (mapDataList.length === 0) return {};
    const grouped: Record<string, any[]> = {};
    mapDataList.forEach((row) => {
      if (row.location) {
        if (!grouped[row.location]) grouped[row.location] = [];
        grouped[row.location].push(row);
      }
    });

    const winners: Record<string, string> = {};
    const isLowerBetter = [
      "latency",
      "jitter",
      "packetloss",
      "packetLoss",
    ].includes(kpi);

    Object.keys(grouped).forEach((regionName) => {
      const rows = grouped[regionName];
      let bestVal = isLowerBetter ? Infinity : -Infinity;
      let winnerOp = "default";

      rows.forEach((row) => {
        if (selectedOperators.includes(row.operator)) {
          const val = row[kpi];
          if (val !== undefined && val !== null) {
            if (isLowerBetter) {
              if (val < bestVal) {
                bestVal = val;
                winnerOp = row.operator;
              }
            } else {
              if (val > bestVal) {
                bestVal = val;
                winnerOp = row.operator;
              }
            }
          }
        }
      });

      const config = getOperatorConfig(winnerOp);
      winners[regionName] = config.color;
    });

    return winners;
  }, [mapDataList, kpi, selectedOperators]);

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

            const matchingRows = mapDataList.filter(
              (r) => r.location === regionName,
            );
            let htmlContent = `<div style="padding:8px; font-family: sans-serif;">
              <h4 style="margin:0 0 8px 0; font-weight:bold; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">${regionName}</h4>
              <table style="width:100%; border-collapse:collapse; font-size:12px;">`;

            matchingRows.forEach((row) => {
              const opConf = getOperatorConfig(row.operator);
              const val = row[kpi];
              htmlContent += `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:4px 0; font-weight:600; color:#475569;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${opConf.color}; margin-right:6px;"></span>
                    ${row.operator}
                  </td>
                  <td style="padding:4px 0; text-align:right; font-weight:bold; color:#0f172a;">${val ? val.toFixed(2) : "-"}</td>
                </tr>`;
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
  }, [activeSubTab, regionWinnerColors, mapDataList, kpi]);

  const handleOperatorToggle = (op: string) => {
    setSelectedOperators((prev) =>
      prev.includes(op) ? prev.filter((item) => item !== op) : [...prev, op],
    );
  };

  const lineChartData = useMemo(() => {
    const periods = Array.from(
      new Set(trendChartDataList.map((d) => String(d.yearWeek || d.date))),
    ).sort();
    const groupedByOperator: Record<string, Record<string, number>> = {};

    trendChartDataList.forEach((row) => {
      const op = row.operator;
      const periodKey = String(row.yearWeek || row.date);
      const val = row[kpi];
      if (op && periodKey && val !== undefined && val !== null) {
        if (!groupedByOperator[op]) groupedByOperator[op] = {};
        groupedByOperator[op][periodKey] = val;
      }
    });

    const datasets = Object.keys(groupedByOperator)
      .filter((op) => selectedOperators.includes(op))
      .map((op) => {
        const opConf = getOperatorConfig(op);
        const dataPoints = periods.map((p) => groupedByOperator[op][p] ?? null);

        return {
          label: op,
          data: dataPoints,
          borderColor: opConf.color,
          backgroundColor: opConf.color + "1A",
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
      labels: periods.map((p) => (p.length === 6 ? `W${p.slice(4)}` : p)),
      datasets,
    };
  }, [trendChartDataList, kpi, selectedOperators]);

  const transformedCityLoseData = useMemo(() => {
    if (!cityLoseList || !cityLoseList.series) return [];

    const apiKpiKey = getApiKpiKey(kpi);
    const seriesData = cityLoseList.series[apiKpiKey] || [];

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
  }, [cityLoseList, kpi]);

  const cityLoseChartData = useMemo(() => {
    if (!cityLoseList || !cityLoseList.categories || !cityLoseList.series) {
      return { labels: [], datasets: [] };
    }

    const apiKpiKey = getApiKpiKey(kpi);
    const seriesArray = cityLoseList.series[apiKpiKey] || [];
    const xAxisLabels = cityLoseList.categories.map(
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
  }, [cityLoseList, kpi, location]);

  const trendColumns = [
    {
      title: "Region",
      dataIndex: "location",
      key: "location",
      fontWeight: "bold",
    },
    { title: "Operator", dataIndex: "operator", key: "operator" },
    {
      title: "Latency (ms)",
      dataIndex: "latency",
      key: "latency",
      render: (val: number) => val?.toFixed(2) || "-",
    },
    {
      title: "Jitter (ms)",
      dataIndex: "jitter",
      key: "jitter",
      render: (val: number) => val?.toFixed(2) || "-",
    },
    {
      title: "Packet Loss (%)",
      dataIndex: "packetLoss",
      key: "packetLoss",
      render: (val: number) => val?.toFixed(2) || "-",
    },
    {
      title: "Download Speed (Mbps)",
      dataIndex: "downloadSpeed",
      key: "downloadSpeed",
      render: (val: number) => val?.toFixed(2) || "-",
    },
    {
      title: "Upload Speed (Mbps)",
      dataIndex: "uploadSpeed",
      key: "uploadSpeed",
      render: (val: number) => val?.toFixed(2) || "-",
    },
  ];

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
            Configured for Mobile {activeSubTab}
          </p>
        </div>

        {/* Level Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            Level
          </label>
          <Select
            value={level}
            onChange={(val) => {
              setLevel(val);
              setLocation("");
            }}
            className="w-full"
            options={
              activeSubTab === "map"
                ? [
                    { label: "Region", value: "region" },
                    { label: "City", value: "city" },
                  ]
                : activeSubTab === "city-lose"
                  ? [
                      { label: "National", value: "national" },
                      { label: "Region", value: "region" },
                    ]
                  : [
                      { label: "National", value: "national" },
                      { label: "Region", value: "region" },
                      { label: "City", value: "city" },
                    ]
            }
          />
        </div>

        {/* Location Selector */}
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

        {/* KPI Selector */}
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

        {/* Period Granularity */}
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            Period Granularity
          </label>
          <Select
            value={granularity}
            onChange={(val) => setGranularity(val)}
            className="w-full"
            options={[
              { label: "Daily", value: "daily" },
              { label: "7 Days", value: "7 days" },
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

        {/* Operators checklist — hidden on City Lose tab */}
        {activeSubTab !== "city-lose" && (
          <div className="flex flex-col gap-2">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
              Operators
            </label>
            <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {["Telkomsel", "Indosat", "XL", "Smartfren", "Tri"].map((op) => {
                const checked = selectedOperators.includes(op);
                const opConf = getOperatorConfig(op);
                return (
                  <label
                    key={op}
                    className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-600 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleOperatorToggle(op)}
                      className="rounded text-sky-600 focus:ring-sky-500 border-slate-300 w-4 h-4 cursor-pointer"
                    />
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${opConf.bg}`}
                    ></span>
                    <span>{op}</span>
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
                      Region Winner Operator Map
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {Object.keys(operatorConfig)
                      .filter(
                        (k) => k !== "default" && k !== "tri" && k !== "three",
                      )
                      .map((opName) => {
                        const opConf = operatorConfig[opName];
                        return (
                          <div
                            key={opName}
                            className="flex items-center gap-1.5 text-xs font-semibold"
                          >
                            <span
                              className={`w-3 h-3 rounded-full ${opConf.bg}`}
                            ></span>
                            <span className="capitalize">{opName}</span>
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
              <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
                  <h3 className="font-bold text-md text-slate-900 mb-4 uppercase">
                    Operator Trend Line Chart ({kpi})
                  </h3>
                  <div className="flex-1 relative min-h-[300px]">
                    {trendChartDataList.length > 0 ? (
                      <Line
                        data={lineChartData}
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
                        Select time range and locations to plot trend chart.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                  <h3 className="font-bold text-md text-slate-900 mb-4">
                    Mobile Experience Regional Data Table
                  </h3>
                  <Table
                    dataSource={mapDataList.filter((row) =>
                      selectedOperators.includes(row.operator),
                    )}
                    columns={trendColumns}
                    rowKey={(record) => `${record.location}-${record.operator}`}
                    pagination={{ pageSize: 12 }}
                    className="border border-slate-100"
                  />
                </div>
              </div>
            )}

            {activeSubTab === "city-lose" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-fit">
                  <h3 className="font-bold text-md text-slate-900 mb-4">
                    Benchmark Operator Loses (By Region)
                  </h3>
                  <Table
                    dataSource={transformedCityLoseData}
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
                        title: `Start Period (${cityLoseList?.categories?.[0] || "Previous"})`,
                        dataIndex: "startVal",
                        key: "startVal",
                        render: (val: number) => val?.toFixed(2) || "0.00",
                      },
                      {
                        title: `End Period (${cityLoseList?.categories?.[1] || "Current"})`,
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
                    pagination={{ pageSize: 10 }}
                    className="border border-slate-100"
                  />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
                  <h3 className="font-bold text-md text-slate-900 mb-4">
                    Loses Trend Chart
                  </h3>
                  <div className="flex-1 relative min-h-[300px]">
                    {cityLoseList ? (
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

export default MobileExperiencePage;
