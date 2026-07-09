import { Spin } from "antd";
import {
  GlobalOutlined,
  AreaChartOutlined,
  TableOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import { IspSidebar } from "../components/IspSidebar";
import { IspMap } from "../components/IspMap";
import { useIspProvider } from "../hooks/useIspProvider";
import { IspTrendTab } from "../components/IspTrendTab";
import { IspRankTab } from "../components/IspRankTab";
import { IspCityLoseTab } from "../components/IspCityLoseTab";
import {
  getProviderConfig,
  winnerProviderList,
} from "../constants/providers";

const IspProviderPage = () => {
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
    providerPriority,
    setProviderPriority,
    selectedProviders,
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
    isRangeTime,
  } = useIspProvider();

  return (
    <div className="flex flex-col md:flex-row gap-6 items-stretch flex-1 h-full overflow-hidden">
      {/* Left Sidebar Filter Panel */}
      <IspSidebar
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
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        selectedProviders={selectedProviders}
        handleProviderToggle={handleProviderToggle}
        getProviderConfig={getProviderConfig}
        view={view}
        setView={setView}
        providerPriority={providerPriority}
        setProviderPriority={setProviderPriority}
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
                      ISP Provider Regional Benchmark Map
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {winnerProviderList(providerPriority).map((prov) => (
                      <div
                        key={prov.id}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: prov.color }}
                        ></span>
                        <span>{prov.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <IspMap
                  activeSubTab={activeSubTab}
                  level={level}
                  location={location}
                  mapType={mapType}
                  kpi={kpi}
                  selectedProviders={selectedProviders}
                  selectedBenchmarks={selectedBenchmarks}
                  mapWinnerColors={mapWinnerColors}
                  mapDataList={mapDataList}
                  benchmarkSummary={benchmarkSummary}
                  getProviderConfig={getProviderConfig}
                  providerPriority={providerPriority}
                />
              </div>
            )}

            {activeSubTab === "trend" && (
              <IspTrendTab
                category={category}
                view={view}
                setView={setView}
                kpi={kpi}
                granularity={granularity}
                level={level}
                selectedProvider={selectedProvider}
                selectedLocations={selectedLocations}
                selectedProviders={selectedProviders}
                ispTrendChartList={ispTrendChartList}
              />
            )}

            {activeSubTab === "rank" && (
              <IspRankTab
                ispRankData={ispRankData}
                providerPriority={providerPriority}
                granularity={granularity}
                level={level}
                location={location}
              />
            )}

            {activeSubTab === "city-lose" && (
              <IspCityLoseTab
                kpi={kpi}
                level={level}
                location={location}
                ispCityLoseList={ispCityLoseList}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IspProviderPage;
