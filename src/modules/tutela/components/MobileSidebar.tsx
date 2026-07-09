import React from "react";
import { Select, DatePicker } from "antd";
import { CompassOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface MobileSidebarProps {
  activeSubTab: string;
  mapType: "experience" | "benchmark";
  setMapType: (val: "experience" | "benchmark") => void;
  selectedBenchmarks: string[];
  setSelectedBenchmarks: React.Dispatch<React.SetStateAction<string[]>>;
  level: "national" | "region" | "city";
  setLevel: (val: "national" | "region" | "city") => void;
  location: string;
  setLocation: (val: string) => void;
  category: "operator" | "location";
  setCategory: (val: "operator" | "location") => void;
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
  selectedOperator: string;
  setSelectedOperator: (val: string) => void;
  selectedOperators: string[];
  handleOperatorToggle: (op: string) => void;
  getOperatorConfig: (name: string) => any;
  view: "chart" | "table";
  setView: (val: "chart" | "table") => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
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
  selectedOperator,
  setSelectedOperator,
  selectedOperators,
  handleOperatorToggle,
  getOperatorConfig,
  view,
  setView,
}) => {
  return (
    <div className="w-full md:w-80 flex-shrink-0 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-6 h-full overflow-y-auto pr-3 pb-6">
      <div>
        <h2 className="text-md font-bold flex items-center gap-2 text-slate-900">
          <CompassOutlined className="text-sky-600" />
          Criteria Filters
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configured for Mobile {activeSubTab}
        </p>
      </div>

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
              { label: "Compare Operators", value: "operator" },
              { label: "Compare Locations", value: "location" },
            ]}
          />
        </div>
      )}

      {/* Map Type Filter (Only on Map Tab) */}
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
              { label: "Experience", value: "experience" },
              { label: "Benchmark", value: "benchmark" },
            ]}
          />
        </div>
      )}

      {/* Benchmark Checklist (Only on Map Tab and Benchmark Type) */}
      {activeSubTab === "map" && mapType === "benchmark" && (
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            Benchmark
          </label>
          <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
            {[
              { value: "win", label: "Win", color: "bg-[#0B8344]" },
              { value: "par", label: "Par", color: "bg-[#F0D12C]" },
              { value: "lose", label: "Lose", color: "bg-[#E42313]" },
              { value: "unrecorded", label: "Unrecorded", color: "bg-[#8C8C8C]" },
            ].map((item) => {
              const checked = selectedBenchmarks.includes(item.value);
              return (
                <label
                  key={item.value}
                  className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-600 select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setSelectedBenchmarks((prev) =>
                        prev.includes(item.value)
                          ? prev.filter((val) => val !== item.value)
                          : [...prev, item.value],
                      );
                    }}
                    className="rounded text-sky-600 focus:ring-sky-500 border-slate-300 w-4 h-4 cursor-pointer"
                  />
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

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
          {activeSubTab === "trend" && category === "location" ? (
            <Select
              mode="multiple"
              showSearch
              placeholder={`Select ${level}s`}
              value={selectedLocations}
              onChange={(val) => setSelectedLocations(val)}
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
          options={
            activeSubTab === "map" && mapType === "benchmark"
              ? [
                  { label: "7 Days", value: "7 days" },
                  { label: "30 Days", value: "30 days" },
                ]
              : [
                  { label: "Daily", value: "daily" },
                  { label: "7 Days", value: "7 days" },
                  { label: "30 Days", value: "30 days" },
                  { label: "90 Days", value: "90 days" },
                ]
          }
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

      {/* Operators checklist or single select — hidden on City Lose tab and Benchmark map */}
      {activeSubTab !== "city-lose" && (activeSubTab !== "map" || mapType === "experience") && (
        <div className="flex flex-col gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            {activeSubTab === "trend" && category === "location" ? "Operator" : "Operators"}
          </label>
          {activeSubTab === "trend" && category === "location" ? (
            <Select
              value={selectedOperator}
              onChange={(val) => setSelectedOperator(val)}
              className="w-full"
              options={["Telkomsel", "Indosat", "XL"].map((op) => ({
                label: op,
                value: op,
              }))}
            />
          ) : (
            <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {["Telkomsel", "Indosat", "XL"].map((op) => {
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
          )}
        </div>
      )}
    </div>
  );
};
