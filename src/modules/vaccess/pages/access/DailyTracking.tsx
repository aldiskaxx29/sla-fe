import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { qosmoUrl } from "@/modules/vaccess/utils/qosmoApi";
import { Skeleton } from "antd";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

import { Bar } from "react-chartjs-2";

interface HeaderType {
  headers: {
    Rtoken: string;
  };
}

let HEADER: HeaderType = { headers: { Rtoken: "" } };
try {
  const data = JSON.parse(localStorage.getItem("user_data") ?? "{}");
  HEADER = {
    headers: {
      Rtoken: btoa(data.level_user ?? ""),
    },
  };
} catch (error) {
  // console.log(error)
}

interface StackedBarChartProps {
  POP: () => void;
  MODE: string;
  DATE: string[];
  CLEAR: number[];
  SPIKE: number[];
  CONSC: number[];
}

const StackedBarChart = ({
  POP,
  MODE,
  DATE,
  CLEAR,
  SPIKE,
  CONSC,
}: StackedBarChartProps) => {
  let dataset = [
    {
      label: "CLEAR",
      data: CLEAR,
      backgroundColor: "rgba(142, 217, 115, 1)",
      barThickness: 80,
      stack: "total",
    },
    {
      label: "SPIKE",
      data: SPIKE,
      backgroundColor: "rgba(237, 189, 63, 1)",
      barThickness: 80,
      stack: "total",
    },
    {
      label: "CONSECUTIVE",
      data: CONSC,
      backgroundColor: "rgba(192, 0, 0, 1)",
      barThickness: 80,
      stack: "total",
    },
  ];

  if (MODE !== "PL") {
    dataset = [
      {
        label: "CLEAR",
        data: CLEAR,
        backgroundColor: "rgba(142, 217, 115, 1)",
        barThickness: 80,
        stack: "total",
      },
      {
        label: "NOT CLEAR",
        data: CONSC,
        backgroundColor: "rgba(192, 0, 0, 1)",
        barThickness: 80,
        stack: "total",
      },
    ];
  }

  const data = {
    labels: DATE,
    datasets: dataset,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        bottom: 0,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
          autoSkip: false,
          callback: (value: string | number) => value + "%",
        },
        grid: {
          drawTicks: true,
        },
      },
    },
    onClick: (_event: any, elements: any[]) => {
      if (!elements.length) return;
      POP();
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 15,
        },
      },
      title: {
        display: true,
        text: "",
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
        },
      },
    },
  };

  return (
    <div style={{ height: "88%", width: "100%" }}>
      <Bar data={data} style={{ width: 1000 }} options={options} />
    </div>
  );
};

interface DailyTrackingProps {
  start: string;
  end: string;
  setPOP?: (val: boolean) => void;
  setTITLEPOP?: (val: string) => void;
}

const DailyTracking = ({ start, end, setPOP, setTITLEPOP }: DailyTrackingProps) => {
  const [_DAILYTRACKING, setDailyTracking] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [DAILYMODE, setDailyMode] = useState("PL");
  const [DDate, setDDate] = useState<string[]>([]);
  const [DCLEAR, setDCLEAR] = useState<number[]>([]);
  const [DSPIKE, setDSPIKE] = useState<number[]>([]);
  const [DCONSC, setDCONSC] = useState<number[]>([]);
  const [DRegion, setDRegion] = useState("NATIONWIDE");

  const [TB] = useState<Record<string, any>>({
    SUMBAGUT: { total_site: 0, t_pl5: 13, t_pl15: 42, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
    SUMBAGSEL: { total_site: 0, t_pl5: 13, t_pl15: 57, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
    JABOTABEK_INNER: { total_site: 0, t_pl5: 0, t_pl15: 3, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
    JAWA_BARAT: { total_site: 0, t_pl5: 0, t_pl15: 2, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
    JAWA_TENGAH: { total_site: 0, t_pl5: 0, t_pl15: 2, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
    JAWA_TIMUR: { total_site: 0, t_pl5: 0, t_pl15: 2, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
    BALINUSRA: { total_site: 0, t_pl5: 12, t_pl15: 21, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
    KALIMANTAN: { total_site: 0, t_pl5: 13, t_pl15: 57, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
    SULAWESI: { total_site: 0, t_pl5: 13, t_pl15: 28, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
    SUMBAGTENG: { total_site: 0, t_pl5: 13, t_pl15: 39, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
    PUMA: { total_site: 0, t_pl5: 12, t_pl15: 22, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
    JABOTABEK_OUTER: { total_site: 0, t_pl5: 0, t_pl15: 2, t_lat: 25, t_jit: 25, r_pl5: 0, r_pl15: 0, r_lat: 0, r_jit: 0 },
  });

  function PopDailyTracking() {
    if (setPOP) setPOP(true);
    if (setTITLEPOP) setTITLEPOP("SITE DAILY TRACKING PACKET LOSS - CLEAR");
  }

  async function fetchDailyTracking() {
    setLoading(true);
    try {
      const res = await fetch(
        qosmoUrl(
          `/baseapi/vaccess.php?cmd=daily-tracking-${DAILYMODE.toLowerCase()}&region=${DRegion}&start=${start}&end=${end}`
        ),
        HEADER
      );
      const { data } = await res.json();
      setDailyTracking({ ...data });
      const clear: number[] = [];
      const spike: number[] = [];
      const consc: number[] = [];
      const date: string[] = [];

      Object.keys(data).forEach((a) => {
        const total = Number(data[a][0] || 0) + Number(data[a][1] || 0) + Number(data[a][2] || 0);
        const d = new Date(a)
          .toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
          })
          .toUpperCase();
        date.push(d.replace(" ", "-"));

        if (data[a][0] && total > 0) {
          clear.push(Number(((Number(data[a][0]) / total) * 100).toFixed(2)));
        } else {
          clear.push(0);
        }

        if (data[a][2] && total > 0) {
          spike.push(Number(((Number(data[a][2]) / total) * 100).toFixed(2)));
        } else {
          spike.push(0);
        }

        if (data[a][1] && total > 0) {
          consc.push(Number(((Number(data[a][1]) / total) * 100).toFixed(2)));
        } else {
          consc.push(0);
        }
      });
      setDDate([...date]);
      setDCLEAR([...clear]);
      setDSPIKE([...spike]);
      setDCONSC([...consc]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDailyTracking();
  }, [DAILYMODE, DRegion]);

  return (
    <div className="flex flex-col gap-1 mt-2">
      <div className="text-md font-bold text-red-700 flex justify-between mt-1 items-center">
        <div className="flex gap-4">
          <div className="whitespace-nowrap">DAILY TRACKING</div>
          <div className="flex gap-2" style={{ fontSize: "0.6em", fontWeight: "400" }}>
            <div
              onClick={() => setDailyMode("PL")}
              className={
                (DAILYMODE === "PL" ? "bg-sky-700" : "bg-gray-800") +
                ` text-white rounded-full p-1 h-fit w-20 text-center cursor-pointer`
              }
            >
              PL
            </div>
            <div
              onClick={() => setDailyMode("LAT")}
              className={
                (DAILYMODE === "LAT" ? "bg-sky-700" : "bg-gray-800") +
                ` text-white rounded-full p-1 h-fit w-20 text-center cursor-pointer`
              }
            >
              LAT
            </div>
            <div
              onClick={() => setDailyMode("JIT")}
              className={
                (DAILYMODE === "JIT" ? "bg-sky-700" : "bg-gray-800") +
                ` text-white rounded-full p-1 h-fit w-20 text-center cursor-pointer`
              }
            >
              JIT
            </div>
          </div>
        </div>
        <div className="flex justify-end w-full">
          <select
            onChange={(e) => setDRegion(e.target.value)}
            value={DRegion}
            className="bg-white text-gray-800 px-2 text-sm font-normal rounded-sm border border-gray-800"
          >
            <option value={"NATIONWIDE"}>NATIONWIDE</option>
            {Object.keys(TB).map((a) => {
              return (
                <option value={a.replace("_", " ")} key={a}>
                  {a.replace("_", " ")}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="relative px-10" style={{ height: "35vh" }}>
        {loading && (
          <div className="absolute inset-0 z-10 rounded-lg bg-white/95 p-2">
            <Skeleton active title={false} paragraph={{ rows: 8 }} />
          </div>
        )}
        <StackedBarChart
          POP={PopDailyTracking}
          DATE={DDate}
          MODE={DAILYMODE}
          CLEAR={DCLEAR}
          SPIKE={DSPIKE}
          CONSC={DCONSC}
        ></StackedBarChart>
      </div>
    </div>
  );
};

export default DailyTracking;
