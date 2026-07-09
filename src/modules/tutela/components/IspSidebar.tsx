import React from "react";
import { Select, DatePicker } from "antd";
import { CompassOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { NINE_PROVIDERS } from "../constants/providers";

interface IspSidebarProps {
  activeSubTab: string;
  mapType: "experience" | "benchmark";
  setMapType: (val: "experience" | "benchmark") => void;
  selectedBenchmarks: string[];
  setSelectedBenchmarks: React.Dispatch<React.SetStateAction<string[]>>;
  level: "national" | "region" | "city";
  setLevel: (val: "national" | "region" | "city") => void;
  location: string;
  setLocation: (val: string) => void;
  category: "provider" | "location";
  setCategory: (val: "provider" | "location") => void;
  selectedLocations: string[];
  setSelectedLocations: (val: string[]) => void;
  regions: string[];
  cities: string[];
  kpi: string;
  setKpi: (val: string) => void;
  granularity: string;
  setGranularity: (val: any) => void;
  isRangeTime: boolean;
  time: string;
  setTime: (val: string) => void;
  weeksList: string[];
  timeRangeStart: string;
  setTimeRangeStart: (val: string) => void;
  timeRangeEnd: string;
  setTimeRangeEnd: (val: string) => void;
  selectedProvider: string;
  setSelectedProvider: (val: string) => void;
  selectedProviders: string[];
  handleProviderToggle: (op: string) => void;
  getProviderConfig: (name: string) => any;
  view: "chart" | "table";
  setView: (val: "chart" | "table") => void;
  providerPriority: "nine" | "all";
  setProviderPriority: (val: "nine" | "all") => void;
}

export const IspSidebar: React.FC<IspSidebarProps> = ({
  activeSubTab,
  mapType,
  setMapType,
  selectedBenchmarks,
  setSelectedBenchmarks,
  level,
  setLevel,
  location,
  setLocation,
  category,
  setCategory,
  selectedLocations,
  setSelectedLocations,
  regions,
  cities,
  kpi,
  setKpi,
  granularity,
  setGranularity,
  isRangeTime,
  time,
  setTime,
  weeksList,
  timeRangeStart,
  setTimeRangeStart,
  timeRangeEnd,
  setTimeRangeEnd,
  selectedProvider,
  setSelectedProvider,
  selectedProviders,
  handleProviderToggle,
  getProviderConfig,
  view,
  setView,
  providerPriority,
  setProviderPriority,
}) => {
  return (
    <div className="w-full md:w-80 flex-shrink-0 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-6 h-full overflow-y-auto pr-3 pb-6">
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

      {/* Map Type Filter — only on Map Tab */}
      {activeSubTab === "map" && (
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            Map Type
          </label>
          <Select
            value={mapType}
            onChange={(val) => setMapType(val)}
            className="w-full"
            options={[
              { label: "Experience Map", value: "experience" },
              { label: "Benchmark Map", value: "benchmark" },
            ]}
          />
        </div>
      )}

      {/* Location Selector — hidden when level is national */}
      {level !== "national" && (
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            {level === "region" ? "Region" : "City"}
          </label>
          {activeSubTab === "trend" && category === "location" ? (
            <Select
              mode="multiple"
              placeholder={`Select ${level}`}
              value={selectedLocations}
              onChange={(val) => setSelectedLocations(val)}
              className="w-full"
              maxTagCount="responsive"
              options={
                level === "region"
                  ? regions.map((r) => ({ label: r, value: r }))
                  : cities.map((c) => ({ label: c, value: c }))
              }
            />
          ) : (
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
          )}
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
            ]}
          />
        </div>
      )}

      {/* View Selector (Only on Trend Tab) */}
      {activeSubTab === "trend" && (
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            View
          </label>
          <Select
            value={view}
            onChange={(val) => setView(val)}
            className="w-full"
            options={[
              { label: "Chart", value: "chart" },
              { label: "Table", value: "table" },
            ]}
          />
        </div>
      )}

      {/* Category Selector (Only on Trend Tab) */}
      {activeSubTab === "trend" && (
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            Category (Compare By)
          </label>
          <Select
            value={category}
            onChange={(val) => setCategory(val)}
            className="w-full"
            options={[
              { label: "Compare Providers", value: "provider" },
              { label: "Compare Locations", value: "location" },
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
          onChange={(val: any) => setGranularity(val)}
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

      {/* Benchmark checklist — shown on Map in Benchmark Mode */}
      {activeSubTab === "map" && mapType === "benchmark" && (
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            Benchmark Status
          </label>
          <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
            {[
              { label: "Win", value: "win", bg: "bg-[#0B8344]" },
              { label: "Par", value: "par", bg: "bg-[#F0D12C]" },
              { label: "Lose", value: "lose", bg: "bg-[#E42313]" },
              { label: "Unrecorded", value: "unrecorded", bg: "bg-[#8C8C8C]" },
            ].map((bench) => {
              const checked = selectedBenchmarks.includes(bench.value);
              return (
                <label
                  key={bench.value}
                  className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-600 select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setSelectedBenchmarks((prev) =>
                        prev.includes(bench.value)
                          ? prev.filter((item) => item !== bench.value)
                          : [...prev, bench.value],
                      );
                    }}
                    className="rounded text-sky-600 focus:ring-sky-500 border-slate-300 w-4 h-4 cursor-pointer"
                  />
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${bench.bg}`}
                  ></span>
                  <span>{bench.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Providers selector — hidden on City Lose tab and Map Benchmark mode */}
      {activeSubTab !== "city-lose" && !(activeSubTab === "map" && mapType === "benchmark") && (
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            {activeSubTab === "trend" && category === "location" ? "Provider" : "Providers"}
          </label>
          {activeSubTab === "trend" && category === "location" ? (
            <Select
              value={selectedProvider}
              onChange={(val) => setSelectedProvider(val)}
              className="w-full"
              options={NINE_PROVIDERS.map((prov) => ({
                label: prov.label,
                value: prov.id,
              }))}
            />
          ) : (
            <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {NINE_PROVIDERS.map((prov) => {
                const checked = selectedProviders.includes(prov.id);
                return (
                  <label
                    key={prov.id}
                    className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-600 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleProviderToggle(prov.id)}
                      className="rounded text-sky-600 focus:ring-sky-500 border-slate-300 w-4 h-4 cursor-pointer"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: prov.color }}
                    ></span>
                    <span>{prov.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
