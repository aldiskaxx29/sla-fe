import React, { useEffect, useState } from "react";
import { Select, DatePicker, Spin } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  CompassOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const getOrdinalSuffix = (num: number) => {
  if (num === 0) return "-";
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return num + "st";
  if (j === 2 && k !== 12) return num + "nd";
  if (j === 3 && k !== 13) return num + "rd";
  return num + "th";
};

const operatorConfig: Record<string, { color: string; bg: string; text: string; label: string }> = {
  telkomsel: { color: "#EE2E50", bg: "bg-[#EE2E50]", text: "text-[#EE2E50]", label: "T" },
  indosat: { color: "#F7931A", bg: "bg-[#F7931A]", text: "text-[#F7931A]", label: "I" },
  xl: { color: "#5470DE", bg: "bg-[#5470DE]", text: "text-[#5470DE]", label: "X" },
  smartfren: { color: "#E01A83", bg: "bg-[#E01A83]", text: "text-[#E01A83]", label: "S" },
  three: { color: "#999999", bg: "bg-[#999999]", text: "text-[#999999]", label: "3" },
  tri: { color: "#999999", bg: "bg-[#999999]", text: "text-[#999999]", label: "3" },
  default: { color: "#999999", bg: "bg-slate-400", text: "text-slate-400", label: "O" },
};

const getOperatorConfig = (name: string) => {
  const normalized = name?.toLowerCase() || "default";
  if (normalized.includes("telkomsel")) return operatorConfig.telkomsel;
  if (normalized.includes("indosat")) return operatorConfig.indosat;
  if (normalized.includes("xl")) return operatorConfig.xl;
  if (normalized.includes("smartfren")) return operatorConfig.smartfren;
  if (normalized.includes("three") || normalized.includes("tri")) return operatorConfig.three;
  return operatorConfig.default;
};

interface OperatorData {
  mean: number;
  operator: string;
  label: string;
  yearWeek: number | null;
  date: string | null;
  rank: number;
  previous: {
    mean: number;
    operator: string;
    label: string;
    yearWeek: number | null;
    date: string | null;
    rank: number;
  } | null;
}

interface ChartData {
  latency: OperatorData[];
  jitter: OperatorData[];
  packetloss: OperatorData[];
  availability?: OperatorData[];
  coreConsistentQuality?: OperatorData[];
  excellentConsistentQuality?: OperatorData[];
}

const fetchWithRetry = async (url: string, retries = 3, delay = 1000): Promise<Response> => {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      throw new Error(`HTTP error! status: ${res.status}`);
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(1.5, i)));
    }
  }
  throw new Error("Fetch failed after retries");
};

const TutelaPage = () => {
  // General Filter States
  const [level, setLevel] = useState<"national" | "region" | "city">("national");
  const [granularity, setGranularity] = useState<"daily" | "7 days" | "30 days" | "90 days">("7 days");
  const [time, setTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Reference lists
  const [weeksList, setWeeksList] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [defaultTimes, setDefaultTimes] = useState<Record<string, string>>({});

  // Loading & Data States
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<ChartData | null>(null);

  // Load static resources & default lists on mount
  useEffect(() => {
    fetchWithRetry("/onx/geojson/treg_region_pairing.json")
      .then((res) => res.json())
      .then((data) => {
        const uniqueRegions = Array.from(new Set<string>(data.map((item: any) => item.new_region))).sort();
        setRegions(uniqueRegions);
      })
      .catch((err) => console.error("Failed to load regions:", err));

    fetchWithRetry("/onx/geojson/treg_city_pairing.json")
      .then((res) => res.json())
      .then((data) => {
        const uniqueCities = Array.from(new Set<string>(data.map((item: any) => item.city))).sort();
        setCities(uniqueCities);
      })
      .catch((err) => console.error("Failed to load cities:", err));

    fetchWithRetry("/onx-api/api/v-list-weeks")
      .then((res) => res.json())
      .then((data) => {
        const weeks = data.map((w: any) => String(w.yearweek));
        setWeeksList(weeks);
        // Fallback: if time hasn't been set by defaults yet, set it to the latest week
        setTime((prevTime) => {
          if (!prevTime && weeks.length > 0) {
            return weeks[0];
          }
          return prevTime;
        });
      })
      .catch((err) => console.error("Failed to load weeks list:", err));

    fetchWithRetry("/onx-api/api/v2/v-onx-last-period-time")
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
          }
        }
      })
      .catch((err) => console.error("Failed to load time defaults:", err));
  }, []);

  // Update time when granularity changes
  useEffect(() => {
    if (defaultTimes[granularity]) {
      setTime(defaultTimes[granularity]);
    } else if (weeksList.length > 0) {
      // Fallback: if there is no default time for this granularity, use the latest week
      setTime(weeksList[0]);
    }
  }, [granularity, defaultTimes, weeksList]);

  // Fetch Dashboard / Sub Metric Data
  useEffect(() => {
    if (!time) return;

    setLoading(true);
    const apiLevel = level === "national" ? "nation" : level === "city" ? "kabupaten" : level;
    const apiGranularity = granularity.replace(" ", "");

    const urlParams = new URLSearchParams();
    if (level !== "national" && location) {
      urlParams.append("location", location);
    }
    if (granularity === "daily") {
      urlParams.append("date", dayjs(time).format("YYYY-MM-DD"));
    } else {
      urlParams.append("yearweek", time);
    }

    fetchWithRetry(`/onx-api/api/v2/user-experience/chart/${apiLevel}/${apiGranularity}?${urlParams.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.statusCode === 200 && resData.data) {
          setDashboardData(resData.data);
        } else {
          setDashboardData(null);
        }
      })
      .catch((err) => {
        console.error("Dashboard fetch failed:", err);
        setDashboardData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [level, granularity, time, location]);

  return (
    <div className="flex flex-col md:flex-row gap-6 items-stretch flex-1">
      {/* Left Sidebar Filter Panel */}
      <div className="w-full md:w-80 flex-shrink-0 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-6 h-fit">
        <div>
          <h2 className="text-md font-bold flex items-center gap-2 text-slate-900">
            <CompassOutlined className="text-sky-600" />
            Criteria Filters
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure dashboard parameters</p>
        </div>

        {/* Level Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Level</label>
          <Select
            value={level}
            onChange={(val) => {
              setLevel(val);
              setLocation("");
            }}
            className="w-full"
            options={[
              { label: "National", value: "national" },
              { label: "Region", value: "region" },
              { label: "City", value: "city" },
            ]}
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
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>
        )}

        {/* Period Granularity */}
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Period Granularity</label>
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

        {/* Time Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Time</label>
          {granularity === "daily" ? (
            <DatePicker
              value={time ? dayjs(time) : null}
              onChange={(date) => setTime(date ? date.format("YYYY-MM-DD") : "")}
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
              options={weeksList.map((w) => ({ label: `W${w.slice(4)} - ${w.slice(0, 4)}`, value: w }))}
            />
          )}
        </div>
      </div>

      {/* Right Side Main Content View */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex gap-2 border-b border-slate-200">
          <button className="pb-3 px-4 text-sm font-bold border-b-2 border-slate-900 text-slate-900">
            Sub Metric
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col gap-3 justify-center items-center min-h-[400px]">
            <Spin size="large" />
            <span className="text-sm text-slate-400">Loading view data...</span>
          </div>
        ) : dashboardData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Latency", key: "latency" as const, unit: "ms", reverseColor: true },
              { title: "Jitter", key: "jitter" as const, unit: "ms", reverseColor: true },
              { title: "Packetloss", key: "packetloss" as const, unit: "%", reverseColor: true },
            ].map((card) => {
              const metricList = dashboardData[card.key] || [];
              const telkomselData = metricList.find((item) => item.operator?.toLowerCase().includes("telkomsel"));
              const maxVal = Math.max(...metricList.map((d) => d.mean || 0), 1);

              const prevRank = telkomselData?.previous?.rank ?? 0;
              const currRank = telkomselData?.rank ?? 0;
              const isRankBetter = currRank < prevRank;
              const isRankWorse = currRank > prevRank;
              const hasRankChange = prevRank > 0 && currRank > 0 && prevRank !== currRank;

              const prevMean = telkomselData?.previous?.mean ?? 0;
              const currMean = telkomselData?.mean ?? 0;
              const meanDiff = currMean - prevMean;
              const isMeanBetter = card.reverseColor ? meanDiff < 0 : meanDiff > 0;

              return (
                <div key={card.title} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  {/* Card Header */}
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-md">{card.title}</span>
                    <span className="text-xxs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                      {card.unit}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="p-5 flex justify-between items-start border-b border-slate-100 bg-slate-50/20">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400 font-medium">Rank</span>
                      <span className="text-3xl font-black text-slate-900">
                        {telkomselData ? getOrdinalSuffix(telkomselData.rank) : "-"}
                      </span>
                      {hasRankChange ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isRankBetter ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-rose-700 bg-rose-50 border-rose-200"
                        }`}>
                          {isRankBetter ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                          <span>{getOrdinalSuffix(prevRank)}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-slate-500 bg-slate-50 border border-slate-200">
                          <MinusOutlined />
                          <span>No Change</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-xs text-slate-400 font-medium">{card.unit}</span>
                      <span className="text-3xl font-black text-slate-900">
                        {telkomselData ? telkomselData.mean.toFixed(2) : "-"}
                      </span>
                      {prevMean > 0 && currMean > 0 && Math.abs(meanDiff) > 0.001 ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isMeanBetter ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-rose-700 bg-rose-50 border-rose-200"
                        }`}>
                          {isMeanBetter ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                          <span>{meanDiff > 0 ? "+" : ""}{meanDiff.toFixed(2)}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-slate-500 bg-slate-50 border border-slate-200">
                          <MinusOutlined />
                          <span>Stable</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operator bars */}
                  <div className="p-5 flex flex-col gap-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Operator Comparison</span>
                    <div className="flex flex-col gap-3.5">
                      {[...metricList]
                        .sort((a, b) => (a.rank || 99) - (b.rank || 99))
                        .map((op) => {
                          const opConf = getOperatorConfig(op.operator);
                          const percentage = Math.min((op.mean / maxVal) * 100, 100);

                          return (
                            <div key={op.operator} className="flex items-center gap-3">
                              <span className="w-5 text-sm font-bold text-slate-400 text-center">{op.rank}.</span>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${opConf.bg}`}>
                                {opConf.label}
                              </div>
                              <div className="flex-1 flex flex-col gap-0.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-slate-700">{op.operator}</span>
                                  <span className="text-xs font-bold text-slate-900">{op.mean.toFixed(2)} {card.unit}</span>
                                </div>
                                <div className="bg-slate-100 h-2.5 rounded-full w-full overflow-hidden">
                                  <div
                                    style={{ width: `${percentage}%` }}
                                    className={`h-full rounded-full ${opConf.bg}`}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-3 text-center">
            <InfoCircleOutlined className="text-slate-300 text-4xl" />
            <span className="text-slate-500 font-medium text-lg">No Dashboard Data</span>
            <span className="text-slate-400 text-sm">Please select criteria filters.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutelaPage;
