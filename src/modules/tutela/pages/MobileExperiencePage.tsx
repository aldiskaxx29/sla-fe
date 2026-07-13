import { Spin } from "antd";
import {
  GlobalOutlined,
  AreaChartOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { MobileSidebar } from "../components/MobileSidebar";
import { OperatorMap } from "../components/OperatorMap";
import { useMobileExperience } from "../hooks/useMobileExperience";
import { MobileTrendTab } from "../components/MobileTrendTab";
import { MobileCityLoseTab } from "../components/MobileCityLoseTab";



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





const MobileExperiencePage = () => {
  const {
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
    benchmarkSummary,
  } = useMobileExperience();

  return (
    <div className="flex flex-col md:flex-row gap-6 items-stretch flex-1 h-full overflow-hidden">
      <MobileSidebar
        activeSubTab={activeSubTab}
        mapType={mapType}
        setMapType={setMapType}
        selectedBenchmarks={selectedBenchmarks}
        setSelectedBenchmarks={setSelectedBenchmarks}
        level={level}
        setLevel={setLevel}
        location={location}
        setLocation={setLocation}
        category={category}
        setCategory={(val) => {
          setCategory(val);
          if (val === "location") {
            setSelectedLocations(level === "region" ? regions.slice(0, 5) : cities.slice(0, 5));
          } else {
            setLocation(level === "region" ? regions[0] || "" : cities[0] || "");
          }
        }}
        selectedLocations={selectedLocations}
        setSelectedLocations={setSelectedLocations}
        regions={regions}
        cities={cities}
        kpi={kpi}
        setKpi={setKpi}
        granularity={granularity}
        setGranularity={setGranularity}
        isRangeTime={isRangeTime}
        time={time}
        setTime={setTime}
        weeksList={weeksList}
        timeRangeStart={timeRangeStart}
        setTimeRangeStart={setTimeRangeStart}
        timeRangeEnd={timeRangeEnd}
        setTimeRangeEnd={setTimeRangeEnd}
        selectedOperator={selectedOperator}
        setSelectedOperator={setSelectedOperator}
        selectedOperators={selectedOperators}
        handleOperatorToggle={handleOperatorToggle}
        getOperatorConfig={getOperatorConfig}
        view={view}
        setView={setView}
      />

      {/* Right Side Main Content View */}
      <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto pr-3 pb-6">
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
          <div className="flex-1 flex flex-col gap-3 justify-center items-center min-h-[400px]">
            <Spin size="large" />
            <span className="text-sm text-slate-400">Loading view data...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {activeSubTab === "map" && (
              <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[500px]">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center gap-4 justify-between flex-wrap">
                  <div className="flex items-center gap-2">
                    <GlobalOutlined className="text-slate-500" />
                    <span className="font-bold text-sm text-slate-700">
                      {mapType === "experience" ? "Region Winner Operator Map" : "Benchmark Winner Map"}
                    </span>
                  </div>
                  {mapType === "experience" ? (
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
                  ) : (
                    <div className="flex items-center gap-4 flex-wrap">
                      {[
                        { label: "Win", color: "bg-[#0B8344]" },
                        { label: "Par", color: "bg-[#F0D12C]" },
                        { label: "Lose", color: "bg-[#E42313]" },
                        { label: "Unrecorded", color: "bg-[#8C8C8C]" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <span
                            className={`w-3 h-3 rounded-full ${item.color}`}
                          ></span>
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <OperatorMap
                  activeSubTab={activeSubTab}
                  level={level}
                  location={location}
                  mapType={mapType}
                  kpi={kpi}
                  selectedOperators={selectedOperators}
                  selectedBenchmarks={selectedBenchmarks}
                  mapWinnerColors={mapWinnerColors}
                  mapDataList={mapDataList}
                  getOperatorConfig={getOperatorConfig}
                  benchmarkSummary={benchmarkSummary}
                />
              </div>
            )}

            {activeSubTab === "trend" && (
              <MobileTrendTab
                category={category}
                view={view}
                setView={setView}
                kpi={kpi}
                level={level}
                granularity={granularity}
                selectedOperator={selectedOperator}
                selectedLocations={selectedLocations}
                selectedOperators={selectedOperators}
                trendChartDataList={trendChartDataList}
              />
            )}

            {activeSubTab === "city-lose" && (
              <MobileCityLoseTab
                location={location}
                kpi={kpi}
                level={level}
                timeRangeEnd={timeRangeEnd}
                cityLoseList={cityLoseList}
                cityLoseFlagList={cityLoseFlagList}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileExperiencePage;
