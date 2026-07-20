import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import {
  getProviderConfig,
  winnerProviderList,
  NINE_PROVIDER_IDS,
} from "../constants/providers";

const getApiKpiKey = (kpiName: string) => {
  const norm = kpiName.toLowerCase();
  if (norm.includes("latency")) return "latency";
  if (norm.includes("jitter")) return "jitter";
  if (norm.includes("loss")) return "packetLoss";
  if (norm.includes("download")) return "downloadSpeed";
  if (norm.includes("upload")) return "uploadSpeed";
  return "latency";
};

const ISP_TABS = ["map", "trend", "rank", "city-lose"];
const getTabFromHash = () => {
  if (typeof window === "undefined") return "map";
  const h = window.location.hash.replace(/^#/, "");
  return ISP_TABS.includes(h) ? h : "map";
};

export const useIspProvider = () => {
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
      if (ISP_TABS.includes(h)) setActiveSubTab(h);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // General Filter States
  const [level, setLevel] = useState<"national" | "region" | "city">("region");
  const [granularity, setGranularity] = useState<"daily" | "7 days" | "30 days" | "90 days">("30 days");
  const [time, setTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [kpi, setKpi] = useState<string>("latency");
  const [providerPriority, setProviderPriority] = useState<"nine" | "all">("nine");
  // Canonical provider ids (lowercase) so they match the API `provider` values.
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    ...NINE_PROVIDER_IDS,
  ]);
  const [timeRangeStart, setTimeRangeStart] = useState<string>("");
  const [timeRangeEnd, setTimeRangeEnd] = useState<string>("");

  // References
  const [weeksList, setWeeksList] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Trend specific filter states
  const [category, setCategory] = useState<"provider" | "location">("provider");
  const [view, setView] = useState<"chart" | "table">("chart");
  const [selectedProvider, setSelectedProvider] = useState<string>("indihome");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Map specific filter states
  const [mapType, setMapType] = useState<"experience" | "benchmark">("experience");
  const [mapDataList, setMapDataList] = useState<any[]>([]);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>(["win", "par", "lose", "unrecorded"]);



  useEffect(() => {
    if (regions.length > 0 && selectedLocations.length === 0) {
      setSelectedLocations(regions.slice(0, 5));
    }
  }, [regions]);

  useEffect(() => {
    if (activeSubTab !== "map") {
      setLevel("national");
    }
  }, [activeSubTab]);

  const [defaultTimes, setDefaultTimes] = useState<Record<string, string>>({});

  // Data states
  const [loading, setLoading] = useState(false);
  const [ispCityLoseList, setIspCityLoseList] = useState<any | null>(null);
  const [ispTrendChartList, setIspTrendChartList] = useState<any | null>(null);
  const [ispRankData, setIspRankData] = useState<Record<string, any[]> | null>(null);
  // Total number of kabupaten — used as the denominator for benchmark summary
  // percentages (matches the reference which divides by citySource.features.length).
  const [totalCityCount, setTotalCityCount] = useState<number>(0);
  const [benchmarkSummary, setBenchmarkSummary] = useState<
    {
      benchmark: string;
      value: number;
      percentage: number;
      prevValue: number;
      prevPercentage: number;
    }[]
  >([]);

  // Load static references
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const fetchWithAuth = (url: string) => fetch(url, { headers });

    fetchWithAuth("/onx/geojson/treg_region_pairing.json")
      .then((res) => res.json())
      .then((data) => {
        const uniqueRegions = Array.from(
          new Set<string>(data.map((item: any) => item.new_region)),
        ).sort();
        setRegions(uniqueRegions);
      })
      .catch((err) => console.error("Failed to load regions:", err));

    fetchWithAuth("/onx/geojson/treg_city_pairing.json")
      .then((res) => res.json())
      .then((data) => {
        const uniqueCities = Array.from(
          new Set<string>(data.map((item: any) => item.kabupaten)),
        ).sort();
        setCities(uniqueCities);
        setTotalCityCount(uniqueCities.length);
      })
      .catch((err) => console.error("Failed to load cities:", err));

    fetchWithAuth("/onx-api/api/v-list-weeks")
      .then((res) => res.json())
      .then((data) => {
        const weeks = data.map((w: any) => String(w.yearweek));
        setWeeksList(weeks);
      })
      .catch((err) => console.error("Failed to load weeks list:", err));

    fetchWithAuth("/onx-api/api/v2/v-onx-last-period-time")
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
      isMetro: "false",
      isCityAward: "false",
      isNineProvider: providerPriority === "nine" ? "true" : "false",
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

    const apiLevel = level === "national" ? "nation" : level === "city" ? "kabupaten" : level;
    const apiGranularity = granularity.replace(" ", "-");

    let columns = 'yearweek AS "yearWeek", NULL AS date, start_date::text AS "startDate", end_date::text AS "endDate", provider, level, cq_latency AS latency, cq_jitter AS jitter, cq_pl AS "packetLoss", cq_dl_thp AS "downloadSpeed", cq_ul_thp AS "uploadSpeed", cq_ttfb AS "timeToFirstByte", NULL AS location, NULL AS source, NULL AS platform, bcq AS "consistentQuality", sample AS "sampleAll", cq_denum AS "sampleQualityMatch"';

    if (apiLevel === "nation") {
      columns = columns.replace('cq_ttfb AS "timeToFirstByte"', 'cq_ttfb AS "timeToFirstByte", NULL AS location');
    } else if (apiLevel === "kabupaten") {
      columns = columns.replace('cq_ttfb AS "timeToFirstByte"', 'cq_ttfb AS "timeToFirstByte", kabupaten AS location');
    } else if (apiLevel === "region") {
      columns = columns.replace('cq_ttfb AS "timeToFirstByte"', "cq_ttfb AS \"timeToFirstByte\", CASE WHEN new_region IS NULL OR new_region = ' ' THEN NULL ELSE new_region END AS location");
    }

    const filters = `yearweek >= ${timeRangeStart} AND yearweek <= ${timeRangeEnd}`;

    const params = new URLSearchParams({
      columns,
      filters,
    });

    fetch(`/onx-api/api/v2/onx-isp-${apiGranularity}/${apiLevel}?${params.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.statusCode === 200 && resData.data) {
          const mapped = resData.data.map((d: any) => ({
            ...d,
            yearWeek: d.yearweek ?? d.yearWeek,
            startDate: d.startdate ?? d.startDate,
            endDate: d.enddate ?? d.endDate,
            packetLoss: d.packetloss ?? d.packetLoss,
            downloadSpeed: d.downloadspeed ?? d.downloadSpeed,
            uploadSpeed: d.uploadspeed ?? d.uploadSpeed,
            timeToFirstByte: d.timetofirstbyte ?? d.timeToFirstByte,
            consistentQuality: d.consistentquality ?? d.consistentQuality,
            location: apiLevel === "nation" ? "nation" : d.location,
          }));
          setIspTrendChartList(mapped);
        } else {
          setIspTrendChartList([]);
        }
      })
      .catch((err) => console.error("ISP Trend fetch failed:", err))
      .finally(() => setLoading(false));
  }, [
    activeSubTab,
    granularity,
    timeRangeStart,
    timeRangeEnd,
    level,
  ]);

  // Fetch Map Data for ISP
  useEffect(() => {
    if (activeSubTab !== "map" || !time) return;

    setLoading(true);
    const apiGranularity = granularity.replace(" ", "-");
    const apiLevel = level === "city" ? "kabupaten" : "region";
    const mappedKpi = getApiKpiKey(kpi);

    if (mapType === "experience") {
      const isNine = providerPriority === "nine";
      const baseUrl = isNine
        ? `/onx-api/api/v2/onx-benchmark-isp-${apiGranularity}/${apiLevel}`
        : `/onx-api/api/v2/onx-isp-${apiGranularity}/${apiLevel}`;

      let columns = "";
      if (!isNine) {
        if (apiLevel === "region") {
          columns = 'yearweek AS "yearWeek", NULL AS date, provider, level, null AS region, new_region AS location, cq_latency AS latency, cq_jitter AS jitter, cq_pl AS "packetLoss", cq_dl_thp AS "downloadSpeed", cq_ul_thp AS "uploadSpeed", cq_ttfb AS "timeToFirstByte", bcq AS "consistentQuality"';
        } else {
          columns = 'yearweek AS "yearWeek", NULL AS date, provider, level, CASE WHEN new_region IS NULL OR new_region = \' \' THEN NULL ELSE new_region END AS region, kabupaten AS location, cq_latency AS latency, cq_jitter AS jitter, cq_pl AS "packetLoss", cq_dl_thp AS "downloadSpeed", cq_ul_thp AS "uploadSpeed", cq_ttfb AS "timeToFirstByte", bcq AS "consistentQuality"';
        }
      } else {
        if (apiLevel === "region") {
          columns = 'yearweek AS "yearWeek", new_region AS location, biznet, cbn, iconnets, indihome, indosathifi, megavision, myrepublic, oxygen_id, xlhome, benchmark, winner';
        } else {
          columns = 'yearweek AS "yearWeek", kabupaten AS location, biznet, cbn, iconnets, indihome, indosathifi, megavision, myrepublic, oxygen_id, xlhome, benchmark, winner';
        }
      }

      let filters = `yearweek = ${time}`;
      if (isNine) {
        filters += ` AND kpi = '${mappedKpi}'`;
      }

      const params = new URLSearchParams({
        columns,
        filters,
      });

      fetch(`${baseUrl}?${params.toString()}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.statusCode === 200 && resData.data) {
            const mapped = resData.data.map((d: any) => ({
              ...d,
              yearWeek: d.yearWeek ?? d.yearweek ?? null,
              location: d.location ?? null,
              provider: d.provider ?? null,
              latency: d.latency ?? d.cq_latency ?? null,
              jitter: d.jitter ?? d.cq_jitter ?? null,
              packetLoss: d.packetLoss ?? d.packetloss ?? d.cq_pl ?? null,
              downloadSpeed: d.downloadSpeed ?? d.downloadspeed ?? d.cq_dl_thp ?? null,
              uploadSpeed: d.uploadSpeed ?? d.uploadspeed ?? d.cq_ul_thp ?? null,
              consistentQuality: d.consistentQuality ?? d.consistentquality ?? d.bcq ?? null,
            }));
            setMapDataList(mapped);
          } else {
            setMapDataList([]);
          }
        })
        .catch((err) => console.error("Map data fetch failed:", err))
        .finally(() => setLoading(false));
    } else {
      // Benchmark map is always at kabupaten (city) level — matches reference.
      const isNine = providerPriority === "nine";
      const baseUrl = isNine
        ? `/onx-api/api/v2/onx-benchmark-isp-${apiGranularity}/kabupaten`
        : `/onx-api/api/v2/onx-benchmark-isp-all-provider-${apiGranularity}/kabupaten`;

      let columns = "";
      if (isNine) {
        columns = 'yearweek AS "yearWeek", CASE WHEN new_region IS NULL OR new_region = \' \' THEN NULL ELSE new_region END AS region, kabupaten AS location, benchmark, winner, biznet, cbn, iconnets, indihome, indosathifi, megavision, myrepublic, oxygen_id, xlhome';
      } else {
        columns = 'yearweek AS "yearWeek", CASE WHEN new_region IS NULL OR new_region = \' \' THEN NULL ELSE new_region END AS region, kabupaten AS location, benchmark, winner, biznet, cbn, firstmedia, iconnets, indihome, indosathifi, megavision, mnc, myrepublic, oxygen_id, starlink, telkomsel_wifi, wifi_id, xlhome';
      }

      // Determine the previous period for the summary delta.
      const sortedWeeks = [...weeksList].map(Number).sort((a, b) => b - a);
      const curIdx = sortedWeeks.indexOf(Number(time));
      const prevWeek =
        curIdx >= 0 && curIdx < sortedWeeks.length - 1
          ? sortedWeeks[curIdx + 1]
          : null;

      const buildUrl = (week: number | string) => {
        const params = new URLSearchParams({
          columns,
          filters: `yearweek = ${week} AND kpi = '${mappedKpi}'`,
        });
        return `${baseUrl}?${params.toString()}`;
      };

      const fetchWeek = (week: number | string | null) =>
        week == null
          ? Promise.resolve([] as any[])
          : fetch(buildUrl(week))
              .then((res) => res.json())
              .then((resData) =>
                resData.statusCode === 200 && resData.data ? resData.data : []
              )
              .catch(() => []);

      Promise.all([fetchWeek(time), fetchWeek(prevWeek)])
        .then(([curData, prevData]) => {
          setMapDataList(curData);

          const countByStatus = (rows: any[]) => {
            const counts: Record<string, number> = {};
            rows.forEach((r) => {
              const b = (r.benchmark ?? "").toLowerCase();
              if (b) counts[b] = (counts[b] ?? 0) + 1;
            });
            return counts;
          };

          const curCounts = countByStatus(curData);
          const prevCounts = countByStatus(prevData);
          const denom = totalCityCount || curData.length || 1;

          const summary = ["win", "par", "lose", "unrecorded"]
            .filter((b) => curCounts[b] || prevCounts[b])
            .map((b) => ({
              benchmark: b,
              value: curCounts[b] ?? 0,
              percentage: ((curCounts[b] ?? 0) / denom) * 100,
              prevValue: prevCounts[b] ?? 0,
              prevPercentage: ((prevCounts[b] ?? 0) / denom) * 100,
            }));

          setBenchmarkSummary(summary);
        })
        .catch((err) => console.error("Benchmark map data fetch failed:", err))
        .finally(() => setLoading(false));
    }
  }, [
    activeSubTab,
    granularity,
    time,
    mapType,
    level,
    kpi,
    providerPriority,
    weeksList,
    totalCityCount,
  ]);

  const mapWinnerColors = useMemo(() => {
    if (mapType === "benchmark") return {};
    if (mapDataList.length === 0) return {};

    const winners: Record<string, string> = {};
    const isLowerBetter = [
      "latency",
      "jitter",
      "packetLoss",
      "packetloss",
    ].includes(kpi);
    const selectedSet = new Set(
      selectedProviders.map((p) => p.toLowerCase().trim())
    );

    if (providerPriority === "all") {
      // Group provider rows per location.
      const grouped: Record<string, any[]> = {};
      mapDataList.forEach((row) => {
        const locKey = row.location;
        if (locKey) {
          if (!grouped[locKey]) grouped[locKey] = [];
          grouped[locKey].push(row);
        }
      });

      Object.keys(grouped).forEach((locKey) => {
        const rows = grouped[locKey];
        let bestVal = isLowerBetter ? Infinity : -Infinity;
        let winnerOp = "";

        rows.forEach((row) => {
          const providerId = (row.provider ?? "").toLowerCase().trim();
          if (!selectedSet.has(providerId)) return;
          const val = row[kpi];
          if (val === undefined || val === null) return;
          if (isLowerBetter ? val < bestVal : val > bestVal) {
            bestVal = val;
            winnerOp = row.provider;
          }
        });

        if (winnerOp) {
          winners[locKey] = getProviderConfig(winnerOp).color;
        }
      });
    } else {
      // Nine mode: compute winner from selected providers' column values.
      const COLUMN_TO_PROVIDER: Record<string, string> = {
        biznet: "biznet",
        cbn: "cbn",
        iconnets: "iconnets",
        indihome: "indihome",
        indosathifi: "indosat hifi",
        megavision: "megavision",
        myrepublic: "myrepublic",
        oxygen_id: "oxygen.id",
        xlhome: "xl home",
      };

      mapDataList.forEach((row) => {
        if (!row.location) return;

        let bestVal = isLowerBetter ? Infinity : -Infinity;
        let winnerOp = "";

        Object.entries(COLUMN_TO_PROVIDER).forEach(([col, providerId]) => {
          if (!selectedSet.has(providerId)) return;
          const val = row[col];
          if (val === undefined || val === null) return;
          if (isLowerBetter ? val < bestVal : val > bestVal) {
            bestVal = val;
            winnerOp = providerId;
          }
        });

        if (winnerOp) {
          winners[row.location] = getProviderConfig(winnerOp).color;
        }
      });
    }

    return winners;
  }, [mapDataList, kpi, mapType, providerPriority, selectedProviders]);

  const handleProviderToggle = (prov: string) => {
    setSelectedProviders((prev) =>
      prev.includes(prov) ? prev.filter((item) => item !== prov) : [...prev, prov],
    );
  };

  // Fetch ISP Rank data
  useEffect(() => {
    if (activeSubTab !== "rank" || !time) return;
    setLoading(true);
    const apiGranularity = granularity.replace(/ /g, "-");
    const apiLevel = level === "national" ? "nation" : level === "city" ? "kabupaten" : "region";
    const isNine = providerPriority === "nine";
    const params = new URLSearchParams({ isNineProvider: isNine ? "true" : "false", yearweek: time });
    if (level !== "national" && location) params.append("location", location);

    fetch(`/onx-api/api/v2/onx-isp-${apiGranularity}/rank/${apiLevel}?${params.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.statusCode === 200 && resData.data) {
          setIspRankData(resData.data);
        } else {
          setIspRankData(null);
        }
      })
      .catch((err) => console.error("ISP Rank fetch failed:", err))
      .finally(() => setLoading(false));
  }, [activeSubTab, granularity, time, level, location, providerPriority]);

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
    providerPriority,
    setProviderPriority,
    selectedProviders,
    setSelectedProviders,
    timeRangeStart,
    setTimeRangeStart,
    timeRangeEnd,
    setTimeRangeEnd,
    weeksList,
    regions,
    cities,
    category,
    setCategory,
    view,
    setView,
    selectedProvider,
    setSelectedProvider,
    selectedLocations,
    setSelectedLocations,
    mapType,
    setMapType,
    mapDataList,
    selectedBenchmarks,
    setSelectedBenchmarks,
    benchmarkSummary,
    loading,
    ispCityLoseList,
    ispTrendChartList,
    ispRankData,
    mapWinnerColors,
    handleProviderToggle,
    isTrendTab,
    isCityLoseTab,
    isRangeTime,
  };
};
