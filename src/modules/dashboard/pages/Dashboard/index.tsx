import { useCallback, useEffect, useState } from "react";

// Antd
import { Skeleton, Spin } from "antd";

// Hooks
import { useDashboard } from "../../hooks/dashboard.hooks";
import { useParams } from "react-router-dom";

// Images

import MSAmenu from "./components/MSAmenu";
import CNOPmenu from "./components/CNOPmenu";
import { toast } from "react-toastify";

function Dashboard() {
  const menuOptions = [
    {
      label: "Monday Monitoring",
      key: "monday",
    },
    {
      label: "MSA",
      key: "msa",
    },
    {
      label: "CNOP",
      key: "cnop",
    },
    {
      label: "Rekonsiliasi",
      key: "site",
    },
    {
      label: "One Visibility",
      key: "one",
    },
  ];
  const [level, setLevel] = useState("nation");
  const [loading, setLoading] = useState(false);

  //// State
  const [filter, setFilter] = useState("");
  const [treg, setTreg] = useState("all");
  const [menu, setMenu] = useState({
    label: "Monday Monitoring",
    key: "Monday",
  });
  const [historyType, setHistoryType] = useState("pl 5% ran to core");
  const [type, setType] = useState("msa");
  const [trendData, setTrendData] = useState<Record<string, any>>({});
  const [trendReady, setTrendReady] = useState(false);

  const effectiveTreg = treg === "all" ? "" : treg;

  const handlefilter = (e) => {
    setFilter(e);
  };
  const handletreg = (e) => {
    setTreg(e);
  };
  //// Hooks
  const {
    getSC,
    getTrend,
    getHistoryData,
    isSuccessHistoryData,
    dataSC,
    isLoadingSC,
    isLoadingHistoryData,
    dataHistoryData,
  } = useDashboard();
  const { menuId } = useParams();

  //// Methods

  const isDashboardMenu = menuId === "msa" || menuId === "cnop";
  const isMsaRoute = menuId === "msa";

  const fetchDashboard = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await getSC({
        query: {
          type: menuId,
          filter,
          treg: effectiveTreg,
        },
      }).unwrap();
    } finally {
      setLoading(false);
    }
  }, [effectiveTreg, filter, getSC, menuId]);

  /**
   * @description Fetch customer list
   *
   * @return {Promise<void>} Promise<void>
   */
  const fetchHistory = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await getHistoryData({
        query: {
          type: menuId,
          kpi: historyType,
          filter: filter,
          treg: effectiveTreg,
        },
      }).unwrap();
    } catch (err) {
      toast.error("Gagal memuat data history");
    } finally {
      setLoading(false);
    }
  }, [effectiveTreg, menuId, historyType, filter]);

  /**
   * @description Fetch customer list
   *
   * @return {Promise<void>} Promise<void>
   */
  const fetchTrend = useCallback(async (): Promise<void> => {
    const trendParameters = [
      "packetloss ran to core",
      "latency ran to core",
      "jitter ran to core",
      "packetloss core to internet",
      "latency core to internet",
      "jitter core to internet",
      "mttrq ran to core major",
      "mttrq ran to core minor",
    ];

    try {
      setTrendReady(false);
      setLoading(true);
      const trendPromises = trendParameters.map(async (param) => {
        const response = await getTrend({
          query: {
            type: menuId,
            level,
            parameter: param,
            treg: effectiveTreg,
          },
        }).unwrap(); // Ensure we're waiting for the correct response

        return { [param]: response }; // Store the correct response
      });

      const results = await Promise.all(trendPromises);

      // Merge all results into a single object
      const trendsMap = Object.assign({}, ...results);
      setTrendData(trendsMap);
      setTrendReady(true);
    } catch (error) {
      console.error("Error fetching trends:", error);
      setTrendReady(true);
    } finally {
      setLoading(false);
    }
  }, [effectiveTreg, menuId, level]);

  // Handle menu selection
  const handleHistoryCNOP = (data: string) => {
    setHistoryType(data);
  };

  // Set menu when route param changes
  useEffect(() => {
    if (menuId) {
      const selectedMenu = menuOptions.find((item) => item.key === menuId);
      if (selectedMenu) {
        setMenu(selectedMenu);
        setType(selectedMenu.key);
      }
    }
  }, [menuId]);

  useEffect(() => {
    if (!isDashboardMenu) return;
    fetchDashboard();
  }, [fetchDashboard, isDashboardMenu]);

  useEffect(() => {
    if (!isDashboardMenu) return;
    fetchHistory();
  }, [fetchHistory, historyType, isDashboardMenu]);

  useEffect(() => {
    if (!isDashboardMenu) return;
    fetchTrend();
  }, [fetchTrend, isDashboardMenu, level]);

  useEffect(() => {
    setFilter("by ach");
  }, [menuId]);

  return (
    <div className="text-nowrap bg-white">
      {loading && !isMsaRoute && (
        <Spin fullscreen tip="Sedang Memuat Data..." />
      )}

      {isMsaRoute && (
        <MSAmenu
          handlefilter={handlefilter}
          treg={treg}
          handletreg={handletreg}
          dataHistoryData={dataHistoryData}
          dataSC={dataSC}
          isLoadingSC={isLoadingSC}
          isLoadingHistoryData={isLoadingHistoryData}
          isTrendLoading={loading}
          isTrendReady={trendReady}
          isSuccessHistoryData={isSuccessHistoryData}
          trendData={trendData}
          level={level}
          filter={filter}
          setLevel={setLevel}
        />
      )}

      {menu.key === "cnop" && dataSC ? (
        <CNOPmenu
          treg={treg}
          handlefilter={handlefilter}
          handletreg={handletreg}
          dataHistoryData={dataHistoryData}
          dataSC={dataSC}
          handleHistoryCNOP={handleHistoryCNOP}
          historyType={historyType}
          level={level}
          setLevel={setLevel}
          trendData={trendData}
          filter={filter}
          parameterHistory={historyType}
        />
      ) : (
        menu.key === "cnop" && (
          <div className="flex flex-col gap-4 h-[70vh] w-full justify-center items-center">
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
            <Skeleton.Input active size="large" block />
          </div>
        )
      )}
      {menu.key === "monday" && (
        <iframe
          src="/weeklymonitoring/"
          title="Monday Monitoring Dashboard"
          className="w-full min-h-[100vh]"
        />
      )}
      {menu.key === "one" && (
        <iframe
          src="/one/"
          title="One Visibility Dashboard"
          className="w-full min-h-[100vh]"
        />
      )}
      {menu.key === "ticket" && (
        <iframe
          src="/ticket/"
          title="One Visibility Dashboard"
          className="w-full min-h-[100vh]"
        />
      )}
    </div>
  );
}

export default Dashboard;
