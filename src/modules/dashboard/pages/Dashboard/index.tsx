import { useCallback, useEffect, useState } from "react";

// Antd
import { Skeleton, Spin } from "antd";

// Hooks
import { useDashboard } from "../../hooks/dashboard.hooks";
import { useParams } from "react-router-dom";

// Images

import MSAmenu from "./components/MSAmenu";
import CNOPmenu from "./components/CNOPmenu";

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
  const [treg, setTreg] = useState("");
  const [menu, setMenu] = useState({
    label: "Monday Monitoring",
    key: "Monday",
  });
  const [historyType, setHistoryType] = useState("pl 5% ran to core");
  const [type, setType] = useState("msa");
  const [trendData, setTrendData] = useState<Record<string, any>>({});

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
    dataHistoryData,
  } = useDashboard();
  const { menuId } = useParams();

  //// Methods

  /**
   * @description Fetch customer list
   *
   * @return {Promise<void>} Promise<void>
   */
  const fetchDashboard = useCallback(async (): Promise<void> => {
    setLoading(true);

    await getSC({
      query: {
        type: menuId,
        filter,
        treg,
      },
    }).unwrap();
    setLoading(false);
  }, [filter, getSC, menuId, treg]);

  /**
   * @description Fetch customer list
   *
   * @return {Promise<void>} Promise<void>
   */
  const fetchHistory = useCallback(async (): Promise<void> => {
    setLoading(true);
    await getHistoryData({
      query: {
        type: menuId,
        kpi: historyType,
        filter: filter,
      },
    }).unwrap();
    setLoading(false);
  }, [menuId, historyType, filter]);

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
      setLoading(true);
      const trendPromises = trendParameters.map(async (param) => {
        const response = await getTrend({
          query: {
            type: menuId,
            level,
            parameter: param,
          },
        }).unwrap(); // Ensure we're waiting for the correct response

        return { [param]: response }; // Store the correct response
      });

      const results = await Promise.all(trendPromises);

      // Merge all results into a single object
      const trendsMap = Object.assign({}, ...results);
      setTrendData(trendsMap);
    } catch (error) {
      console.error("Error fetching trends:", error);
    } finally {
      setLoading(false);
    }
  }, [menuId, level]);

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

  // Fetch data based on menu selection
  useEffect(() => {
    if (!menu) return;
    const fetchData = async () => {
      await fetchDashboard();
      await fetchTrend();
      await fetchHistory();
    };

    if (menuId === "msa") {
      setTimeout(() => {
        fetchData();
      }, 500);
    } else if (menuId === "cnop") {
      setTimeout(() => {
        fetchData();
      }, 500);
    }
  }, [menu, filter, type, isLoadingSC, dataSC, menuId, treg]);

  useEffect(() => {
    fetchHistory();
  }, [historyType]);

  useEffect(() => {
    fetchTrend();
  }, [level]);

  useEffect(() => {
    setFilter("by ach");
  }, [menuId]);

  return (
    <div className="text-nowrap bg-white">
      {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}

      {menu.key === "msa" && dataSC && dataHistoryData ? (
        <MSAmenu
          treg={treg}
          handletreg={handletreg}
          dataHistoryData={dataHistoryData}
          dataSC={dataSC}
          isLoadingSC={isLoadingSC}
          isSuccessHistoryData={isSuccessHistoryData}
          trendData={trendData}
          level={level}
          setLevel={setLevel}
        />
      ) : (
        menu.key === "msa" && (
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
          src="/mondaymonitoring/"
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
