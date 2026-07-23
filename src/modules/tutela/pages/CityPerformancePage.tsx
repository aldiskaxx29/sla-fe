import React, { useEffect, useState, useMemo } from "react";
import { Select, Spin, Empty, Button } from "antd";
import {
  ReloadOutlined,
  TableOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { fetchWithRetry } from "../utils/fetch";

interface TrendItemObject {
  yearweek?: string | number;
  telkomsel?: string | number;
  indosat?: string | number;
  xl?: string | number;
  value?: string | number;
  val?: string | number;
  [key: string]: any;
}

type TrendItem = number | string | TrendItemObject;

interface CityPerformanceItem {
  region: string;
  status_region: string;
  location: string;
  telkomsel: string | number;
  indosat: string | number;
  xl: string | number;
  status: string;
  winner: string;
  gap_to_winner: string | number;
  value_twamp: string | number;
  total_metro: number;
  total_site: number;
  trend?: TrendItem[];
}

const parseTrendData = (trendData?: TrendItem[]) => {
  if (!trendData || !Array.isArray(trendData) || trendData.length === 0) {
    return null;
  }

  const categories: string[] = [];
  const values: number[] = [];

  trendData.forEach((item, index) => {
    if (typeof item === "number") {
      categories.push(`W${index + 1}`);
      values.push(isNaN(item) ? 0 : item);
    } else if (typeof item === "string") {
      categories.push(`W${index + 1}`);
      const parsed = parseFloat(item);
      values.push(isNaN(parsed) ? 0 : parsed);
    } else if (typeof item === "object" && item !== null) {
      const rawYw = item.yearweek ? String(item.yearweek) : `W${index + 1}`;
      let label = rawYw;
      if (rawYw.length === 6 && !isNaN(Number(rawYw))) {
        label = `W${rawYw.slice(4)} (${rawYw.slice(0, 4)})`;
      }
      categories.push(label);

      let rawVal: any = item.telkomsel ?? item.value ?? item.val;
      if (rawVal === undefined || rawVal === null) {
        const valueKey = Object.keys(item).find(
          (k) => k !== "yearweek" && item[k] !== undefined && item[k] !== null
        );
        if (valueKey) {
          rawVal = item[valueKey];
        }
      }

      const num = rawVal !== undefined && rawVal !== null ? parseFloat(String(rawVal)) : 0;
      values.push(isNaN(num) ? 0 : num);
    }
  });

  if (values.length === 0) return null;

  return { categories, values };
};

const TrendSparkline: React.FC<{ trendData?: TrendItem[] }> = ({ trendData }) => {
  const parsed = useMemo(() => parseTrendData(trendData), [trendData]);

  if (!parsed || parsed.values.length === 0) {
    return <span className="text-slate-300 text-xs">-</span>;
  }

  const strokeColor = "#2563eb";
  const areaGradientStart = "rgba(37, 99, 235, 0.35)";
  const areaGradientEnd = "rgba(37, 99, 235, 0.0)";

  const option = {
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#334155",
      borderWidth: 1,
      padding: [4, 8],
      textStyle: {
        color: "#f8fafc",
        fontSize: 11,
        fontFamily: "sans-serif",
      },
      formatter: (params: any) => {
        if (!params || !params.length) return "";
        const p = params[0];
        return `<div style="display:flex; align-items:center; gap:6px;">
          <span style="font-weight:600; color:#cbd5e1;">${p.name}:</span>
          <span style="font-weight:700; color:#60a5fa;">${p.value}</span>
        </div>`;
      },
    },
    xAxis: {
      type: "category",
      data: parsed.categories,
      show: false,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      show: false,
      scale: true,
    },
    grid: {
      top: 4,
      bottom: 4,
      left: 2,
      right: 2,
    },
    series: [
      {
        data: parsed.values,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: strokeColor,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: areaGradientStart },
              { offset: 1, color: areaGradientEnd },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="w-[110px] h-[36px] mx-auto flex items-center justify-center">
      <ReactECharts
        option={option}
        style={{ height: "36px", width: "110px" }}
        opts={{ renderer: "svg" }}
      />
    </div>
  );
};

interface RegionOption {
  region: string;
  label: string;
}

const TYPE_OPTIONS = [
  { value: "packetloss", label: "Packet Loss" },
  { value: "latency", label: "Latency" },
  { value: "throughput", label: "Throughput" },
  { value: "jitter", label: "Jitter" },
];

const CityPerformancePage: React.FC = () => {
  const apiPrefix = import.meta.env.DEV ? "/qosmo/api" : "/api";

  const [yearweeks, setYearweeks] = useState<string[]>([]);
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [selectedYearWeek, setSelectedYearWeek] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("packetloss");

  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [reportData, setReportData] = useState<CityPerformanceItem[]>([]);

  // 1. Load initial filter options (YearWeek & Region)
  const loadFilters = async () => {
    setLoadingFilters(true);
    try {
      const [ywRes, regRes] = await Promise.all([
        fetchWithRetry(`${apiPrefix}/onx-dashboard/yearweek`)
          .then((r) => r.json())
          .catch(() => ({ status: false, data: [] })),
        fetchWithRetry(`${apiPrefix}/onx-dashboard/region`)
          .then((r) => r.json())
          .catch(() => ({ status: false, data: [] })),
      ]);

      let ywList: string[] = [];
      if (ywRes?.status && Array.isArray(ywRes.data)) {
        ywList = ywRes.data;
      } else if (Array.isArray(ywRes)) {
        ywList = ywRes;
      }
      setYearweeks(ywList);

      if (ywList.length > 0) {
        const defaultYw = ywList.includes("202628")
          ? "202628"
          : ywList[ywList.length - 1];
        setSelectedYearWeek(defaultYw);
      }

      let regList: RegionOption[] = [];
      if (regRes?.status && Array.isArray(regRes.data)) {
        regList = regRes.data;
      } else if (Array.isArray(regRes)) {
        regList = regRes;
      }
      setRegions(regList);

      if (regList.length > 0) {
        const defaultReg =
          regList.find((r) => r.region === "JABOTABEK")?.region ||
          regList[0].region;
        setSelectedRegion(defaultReg);
      }
    } catch (err) {
      console.error("Failed to load filter options:", err);
    } finally {
      setLoadingFilters(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  // 2. Fetch City Performance Report data
  const fetchReport = async () => {
    if (!selectedYearWeek || !selectedRegion) return;
    setLoadingReport(true);
    try {
      const res = await fetchWithRetry(
        `${apiPrefix}/onx-dashboard/report?yearweek=${selectedYearWeek}&region=${selectedRegion}&type=${selectedType}`
      );
      const json = await res.json();
      if (json?.status && Array.isArray(json.data)) {
        setReportData(json.data);
      } else {
        setReportData([]);
      }
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      setReportData([]);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (selectedYearWeek && selectedRegion && selectedType) {
      fetchReport();
    }
  }, [selectedYearWeek, selectedRegion, selectedType]);

  // 3. Group data by region for RowSpan mapping
  const groupedRegions = useMemo(() => {
    const map = new Map<string, CityPerformanceItem[]>();
    reportData.forEach((item) => {
      const regKey = item.region || "UNKNOWN";
      if (!map.has(regKey)) {
        map.set(regKey, []);
      }
      map.get(regKey)!.push(item);
    });

    const result: { region: string; items: CityPerformanceItem[] }[] = [];
    map.forEach((items, region) => {
      result.push({ region, items });
    });
    return result;
  }, [reportData]);

  // Summary Metrics
  const totalLocations = reportData.length;
  const winCount = useMemo(
    () =>
      reportData.filter(
        (d) => String(d.status).toLowerCase() === "win"
      ).length,
    [reportData]
  );
  const loseCount = useMemo(
    () =>
      reportData.filter(
        (d) => String(d.status).toLowerCase() === "lose"
      ).length,
    [reportData]
  );
  const totalSites = useMemo(
    () =>
      reportData.reduce(
        (acc, curr) => acc + (Number(curr.total_site) || 0),
        0
      ),
    [reportData]
  );

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto pr-1">
      {/* Header & Filter Controls Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TableOutlined className="text-blue-600" />
              City Performance ONX
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Performance breakdown &amp; TWAMP metrics by City / Location.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* YearWeek Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Year Week
              </label>
              <Select
                value={selectedYearWeek}
                onChange={(val) => setSelectedYearWeek(val)}
                loading={loadingFilters}
                className="w-36"
                placeholder="Select Week"
                options={yearweeks.map((yw) => ({
                  value: yw,
                  label: `Week ${yw.slice(4)} (${yw.slice(0, 4)})`,
                }))}
              />
            </div>

            {/* Region Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Region
              </label>
              <Select
                value={selectedRegion}
                onChange={(val) => setSelectedRegion(val)}
                loading={loadingFilters}
                className="w-44"
                placeholder="Select Region"
                options={regions.map((r) => ({
                  value: r.region,
                  label: r.label || r.region,
                }))}
              />
            </div>

            {/* Metric Type Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Metric Type
              </label>
              <Select
                value={selectedType}
                onChange={(val) => setSelectedType(val)}
                className="w-36"
                options={TYPE_OPTIONS}
              />
            </div>

            {/* Refresh Button */}
            <div className="flex flex-col gap-1 justify-end self-end">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchReport()}
                loading={loadingReport}
                className="!h-8"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Locations</p>
              <p className="text-lg font-bold text-slate-800">{totalLocations}</p>
            </div>
            <EnvironmentOutlined className="text-blue-500 text-xl" />
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-700 font-medium">Win Locations</p>
              <p className="text-lg font-bold text-emerald-800">{winCount}</p>
            </div>
            <CheckCircleOutlined className="text-emerald-500 text-xl" />
          </div>

          <div className="bg-red-50/70 border border-red-200/80 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-red-700 font-medium">Lose Locations</p>
              <p className="text-lg font-bold text-red-800">{loseCount}</p>
            </div>
            <CloseCircleOutlined className="text-red-500 text-xl" />
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">Total Sites</p>
              <p className="text-lg font-bold text-blue-800">{totalSites.toLocaleString()}</p>
            </div>
            <TableOutlined className="text-blue-500 text-xl" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="w-full overflow-auto max-h-[calc(100vh-320px)] bg-white border border-gray-200 shadow-sm rounded-xl mb-6 relative">
        {loadingReport ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-500">
            <Spin size="large" />
            <span className="text-sm font-medium">Loading City Performance Data...</span>
          </div>
        ) : reportData.length === 0 ? (
          <div className="p-12">
            <Empty description="No performance data available for selected filters." />
          </div>
        ) : (
          <table className="w-max min-w-full text-sm border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-gray-100">
              <tr>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Region
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Status Region
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Location
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Telkomsel
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Indosat
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  XL
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Status City
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Winner
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Gap to Winner
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Trend
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Value TWAMP
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Total Metro
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 font-bold border border-gray-300 px-3 py-2 text-center align-middle shadow-xs">
                  Total Site
                </th>
              </tr>
            </thead>

            <tbody>
              {groupedRegions.map((group) =>
                group.items.map((item, index) => {
                  const isFirst = index === 0;

                  return (
                    <tr
                      key={`${group.region}-${item.location}-${index}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Nested Merge Cell (RowSpan) for region & Status Region */}
                      {isFirst && (
                        <>
                          <td
                            rowSpan={group.items.length}
                            className="border border-gray-300 align-middle bg-white font-bold px-3 text-center text-slate-800"
                          >
                            {group.region}
                          </td>
                          <td
                            rowSpan={group.items.length}
                            className="border border-gray-300 align-middle bg-white font-bold px-3 text-center"
                          >
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                                String(item.status_region).toLowerCase() === "win"
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                  : "bg-red-100 text-red-600 border border-red-300"
                              }`}
                            >
                              {item.status_region}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Location */}
                      <td className="border border-gray-200 text-left px-3 py-1.5 font-medium text-slate-800">
                        {item.location}
                      </td>

                      {/* Telkomsel */}
                      <td className="border border-gray-200 text-center px-2 py-1.5 font-medium text-slate-700">
                        {item.telkomsel}
                      </td>

                      {/* Indosat */}
                      <td className="border border-gray-200 text-center px-2 py-1.5 font-medium text-slate-700">
                        {item.indosat}
                      </td>

                      {/* XL */}
                      <td className="border border-gray-200 text-center px-2 py-1.5 font-medium text-slate-700">
                        {item.xl}
                      </td>

                      {/* Status City */}
                      <td className="border border-gray-200 text-center px-2 py-1.5">
                        <span
                          className={`font-semibold text-xs capitalize ${
                            String(item.status).toLowerCase() === "win"
                              ? "text-emerald-600"
                              : "text-red-500 font-medium"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Winner */}
                      <td className="border border-gray-200 text-left px-3 py-1.5 font-medium text-slate-800">
                        {item.winner}
                      </td>

                      {/* Gap to Winner */}
                      <td
                        className={`border border-gray-200 text-center px-2 py-1.5 font-medium ${
                          String(item.status).toLowerCase() === "win"
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {String(item.gap_to_winner ?? "0.00").replace(".", ",")}
                      </td>

                      {/* Trend (Mini Line Chart / Sparkline or Blank) */}
                      <td className="border border-gray-200 text-center px-2 py-1.5 align-middle">
                        <TrendSparkline trendData={item.trend} />
                      </td>

                      {/* Value TWAMP */}
                      <td className="border border-gray-200 text-center px-2 py-1.5 text-slate-700">
                        {item.value_twamp}
                      </td>

                      {/* Total Metro */}
                      <td className="border border-gray-200 text-center px-2 py-1.5 text-slate-700">
                        {item.total_metro}
                      </td>

                      {/* Total Site */}
                      <td className="border border-gray-200 text-center px-2 py-1.5 text-slate-700">
                        {item.total_site}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CityPerformancePage;
