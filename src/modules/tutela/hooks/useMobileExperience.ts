import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";

const getBenchmarkKpi = (kpiName: string) => {
  const norm = kpiName.toLowerCase();
  if (norm.includes("latency")) return "latency";
  if (norm.includes("jitter")) return "jitter";
  if (norm.includes("loss")) return "packetloss";
  if (norm.includes("download")) return "download";
  if (norm.includes("upload")) return "upload";
  return "latency";
};

const getOperatorConfig = (name: string) => {
  const operatorConfig: Record<string, { color: string; bg: string; text: string; label: string }> = {
    telkomsel: { color: "#EE2E50", bg: "bg-[#EE2E50]", text: "text-[#EE2E50]", label: "T" },
    indosat: { color: "#F7931A", bg: "bg-[#F7931A]", text: "text-[#F7931A]", label: "I" },
    xl: { color: "#5470DE", bg: "bg-[#5470DE]", text: "text-[#5470DE]", label: "X" },
    default: { color: "#999999", bg: "bg-slate-400", text: "text-slate-400", label: "O" },
  };
  const normalized = name?.toLowerCase() || "default";
  if (normalized.includes("telkomsel")) return operatorConfig.telkomsel;
  if (normalized.includes("indosat")) return operatorConfig.indosat;
  if (normalized.includes("xl")) return operatorConfig.xl;
  return operatorConfig.default;
};

const MOBILE_TABS = ["map", "trend", "city-lose"];
const getTabFromHash = () => {
  if (typeof window === "undefined") return "map";
  const h = window.location.hash.replace(/^#/, "");
  return MOBILE_TABS.includes(h) ? h : "map";
};

export const useMobileExperience = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>(getTabFromHash);

  // Keep the URL hash in sync with the active tab (e.g. #trend).
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.hash = activeSubTab;
    }
  }, [activeSubTab]);

  // React to browser back/forward hash changes.
  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash.replace(/^#/, "");
      if (MOBILE_TABS.includes(h)) setActiveSubTab(h);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Filter states
  const [level, setLevel] = useState<"national" | "region" | "city">("national");
  const [granularity, setGranularity] = useState<"daily" | "7 days" | "30 days" | "90 days">("7 days");
  const [time, setTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [kpi, setKpi] = useState<string>("latency");
  const [selectedOperators, setSelectedOperators] = useState<string[]>(["Telkomsel", "Indosat", "XL"]);
  const [timeRangeStart, setTimeRangeStart] = useState<string>("");
  const [timeRangeEnd, setTimeRangeEnd] = useState<string>("");

  const [mapType, setMapType] = useState<"experience" | "benchmark">("experience");
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>(["win", "par", "lose", "unrecorded"]);

  useEffect(() => {
    if (activeSubTab === "map") {
      if (level === "national") {
        setLevel("region");
      }
    } else {
      setLevel("national");
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (mapType === "benchmark" && granularity !== "7 days" && granularity !== "30 days") {
      setGranularity("7 days");
    }
  }, [mapType, granularity]);

  // References
  const [weeksList, setWeeksList] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [defaultTimes, setDefaultTimes] = useState<Record<string, string>>({});

  // Trend specific filter states
  const [category, setCategory] = useState<"operator" | "location">("operator");
  const [view, setView] = useState<"chart" | "table">("chart");
  const [selectedOperator, setSelectedOperator] = useState<string>("Telkomsel");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  useEffect(() => {
    if (regions.length > 0 && selectedLocations.length === 0) {
      setSelectedLocations(regions.slice(0, 5));
    }
  }, [regions]);

  // Data states
  const [loading, setLoading] = useState(false);
  const [mapDataList, setMapDataList] = useState<any[]>([]);
  const [trendChartDataList, setTrendChartDataList] = useState<any[]>([]);
  const [cityLoseList, setCityLoseList] = useState<any | null>(null);
  const [cityLoseFlagList, setCityLoseFlagList] = useState<any[]>([]);

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
    
    if (mapType === "experience") {
      const apiLevel = level === "city" ? "kabupaten" : "region";
      const urlParams = new URLSearchParams();
      if (granularity === "daily") {
        urlParams.append("date", dayjs(time).format("YYYY-MM-DD"));
      } else {
        urlParams.append("yearweek", time);
      }

      fetch(
        `/onx-api/api/v2/quality-experience/map/${apiLevel}/${apiGranularity}?${urlParams.toString()}`,
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
    } else {
      // Benchmark Mode
      const mappedKpi = getBenchmarkKpi(kpi);
      const params = new URLSearchParams({
        kpi: mappedKpi,
        granularity: apiGranularity,
        level: level,
        columns: 'null as "3", yearweek, region, location, telkomsel, xl, "Indosat Ooredoo" as indosat, null as smartfren, benchmark, case when winner = \'Indosat Ooredoo\' then \'indosat\' else winner end as winner',
        filters: `yearweek = ${time}`
      });

      fetch(`/onx-api/api/v2/onx-benchmark-mobile/${mappedKpi}-${apiGranularity}-kabupaten?${params.toString()}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.statusCode === 200 && resData.data) {
            setMapDataList(resData.data);
          } else {
            setMapDataList([]);
          }
        })
        .catch((err) => console.error("Benchmark map data fetch failed:", err))
        .finally(() => setLoading(false));
    }
  }, [activeSubTab, granularity, time, mapType, level, kpi]);

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
      
      if (category === "operator") {
        if (location) {
          params.append("inq_location", location);
        }
      } else {
        if (level !== "national") {
          selectedLocations.forEach((loc) => {
            params.append("inq_location", loc);
          });
        }
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

      // Fetch city lose flag data for benchmark label comparison
      const flagParams = new URLSearchParams({
        level: level === "national" ? "nation" : level,
        yearweek: timeRangeEnd,
        granularity: granularity,
      });

      fetch(`/onx-api/api/v2/quality-experience/city-lose-flag?${flagParams.toString()}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.statusCode === 200 && resData.data) {
            setCityLoseFlagList(resData.data);
          } else {
            setCityLoseFlagList([]);
          }
        })
        .catch((err) => console.error("Flag fetch failed:", err));
    }
  }, [
    activeSubTab,
    granularity,
    timeRangeStart,
    timeRangeEnd,
    level,
    location,
    category,
    selectedLocations,
  ]);

  // Mapbox GL Logic
  const mapWinnerColors = useMemo(() => {
    if (mapType === "benchmark") return {};
    if (mapDataList.length === 0) return {};
    const grouped: Record<string, any[]> = {};
    mapDataList.forEach((row) => {
      const locKey = row.location;
      if (locKey) {
        if (!grouped[locKey]) grouped[locKey] = [];
        grouped[locKey].push(row);
      }
    });

    const winners: Record<string, string> = {};
    const isLowerBetter = [
      "latency",
      "jitter",
      "packetloss",
      "packetLoss",
    ].includes(kpi);

    Object.keys(grouped).forEach((locKey) => {
      const rows = grouped[locKey];
      let bestVal = isLowerBetter ? Infinity : -Infinity;
      let winnerOp = "default";

      rows.forEach((row) => {
        const isSelected = selectedOperators.some(
          (op) => op.toLowerCase() === row.operator?.toLowerCase()
        );
        if (isSelected) {
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
      winners[locKey] = config.color;
    });

    return winners;
  }, [mapDataList, kpi, selectedOperators, mapType]);

  const handleOperatorToggle = (op: string) => {
    setSelectedOperators((prev) =>
      prev.includes(op) ? prev.filter((item) => item !== op) : [...prev, op],
    );
  };

  const isTrendTab = activeSubTab === "trend";
  const isCityLoseTab = activeSubTab === "city-lose";
  const isRangeTime = isTrendTab || isCityLoseTab;

  return {
    activeSubTab,
    setActiveSubTab,
    level,
    setLevel,
    granularity,
    setGranularity,
    time,
    setTime,
    location,
    setLocation,
    kpi,
    setKpi,
    selectedOperators,
    setSelectedOperators,
    timeRangeStart,
    setTimeRangeStart,
    timeRangeEnd,
    setTimeRangeEnd,
    mapType,
    setMapType,
    selectedBenchmarks,
    setSelectedBenchmarks,
    weeksList,
    regions,
    cities,
    category,
    setCategory,
    view,
    setView,
    selectedOperator,
    setSelectedOperator,
    selectedLocations,
    setSelectedLocations,
    loading,
    mapDataList,
    trendChartDataList,
    cityLoseList,
    cityLoseFlagList,
    mapWinnerColors,
    handleOperatorToggle,
    isRangeTime,
    isTrendTab,
    isCityLoseTab,
  };
};
