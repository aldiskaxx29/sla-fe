import { Select, Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";

import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartData,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

import { TableDetailReportSupport } from "../components/TableDetailReportSupport";
import {
  useLazyGetReportSupportUpgradeCapQuery,
  useLazyGetReportSupportUpgradeNodebQuery,
  useLazyGetReportSupportUpgradeQeQuery,
  useLazyGetReportSupportUpgradeTselQuery,
} from "../rtk/site.rtk";
import { ModalTableBreakRegion } from "../components/ModalTableBreakRegion";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const ReportSupportNeededPage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parameter, setParameter] = useState("packetoss ran to core");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [loading, setLoading] = useState(false);
  const [dataPie, setDataPie] = useState<
    ChartData<"doughnut", number[], string>
  >({
    labels: [],
    datasets: [],
  });
  const [dataBarNode, setDataBarNode] = useState<
    ChartData<"bar", number[], string>
  >({
    labels: [],
    datasets: [],
  });
  const [dataBarQE, setDataBarQE] = useState<
    ChartData<"bar", number[], string>
  >({
    labels: [],
    datasets: [],
  });
  const [dataBarTsel, setDataBarTsel] = useState<
    ChartData<"bar", number[], string>
  >({
    labels: [],
    datasets: [],
  });

  const filterMonth = [
    {
      label: "January",
      value: "1",
    },
    {
      label: "February",
      value: "2",
    },
    {
      label: "March",
      value: "3",
    },
    {
      label: "April",
      value: "4",
    },
    {
      label: "May",
      value: "5",
    },
    {
      label: "June",
      value: "6",
    },
    {
      label: "July",
      value: "7",
    },
    {
      label: "August",
      value: "8",
    },
    {
      label: "September",
      value: "9",
    },
    {
      label: "October",
      value: "10",
    },
    {
      label: "November",
      value: "11",
    },
    {
      label: "December",
      value: "12",
    },
  ];

  const filterParemeter = [
    {
      label: "Packetloss Ran to Core",
      value: "packetloss ran to core",
    },
    {
      label: "Latency Ran to Core",
      value: "latency ran to core",
    },
    {
      label: "Jitter Ran to Core",
      value: "jitter ran to core",
    }
    // {
    //   label: "Packetloss Core to Internet",
    //   value: "packetloss core to internet",
    // },
    // {
    //   label: "Latency Core to Internet",
    //   value: "latency core to internet",
    // },
    // {
    //   label: "Jitter Core to Internet",
    //   value: "jitter core to internet",
    // },
    // {
    //   label: "Mttrq Ran to Core Major",
    //   value: "mttrq ran to core major",
    // },
    // {
    //   label: "Mttrq Ran to Core Minor",
    //   value: "mttrq ran to core minor",
    // },
  ];

  const [getCap, { data: dataCap }] = useLazyGetReportSupportUpgradeCapQuery();
  const [getNode, { data: dataNode }] =
    useLazyGetReportSupportUpgradeNodebQuery();
  const [getQe, { data: dataQe }] = useLazyGetReportSupportUpgradeQeQuery();
  const [getTsel, { data: dataTsel }] =
    useLazyGetReportSupportUpgradeTselQuery();

  const getData = useCallback(async () => {
    setLoading(true);
    const resultCap = await getCap({ query: { month, parameter } }).unwrap();
    const resultNode = await getNode({ query: { month, parameter } }).unwrap();
    const resultQE = await getQe({ query: { month, parameter } }).unwrap();
    const resultTsel = await getTsel({ query: { month, parameter } }).unwrap();
    setDataPie({
      labels: Object.keys(resultCap.upgradeCapacity.percentage),
      datasets: [
        {
          data: Object.values(resultCap.upgradeCapacity.percentage),
          backgroundColor: ["#185E8B", "#EB7035", "#3B7E2D"],
          cutout: "70%",
        },
      ],
    });
    setDataBarNode({
      labels: ["Done", "On Progress", "Open"],
      datasets: [
        {
          data: [
            resultNode.onePortOneNodeB.done,
            resultNode.onePortOneNodeB.onProgress,
            resultNode.onePortOneNodeB.open,
          ],
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const { ctx: g, chartArea } = chart;

            if (!chartArea) return "#0e5774";

            const gradient = g.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, "#0e5774");
            gradient.addColorStop(1, "#0f6e8e");
            return gradient;
          },
          borderRadius: 8,
          barPercentage: 0.5,
        },
      ],
    });
    setDataBarQE({
      labels: ["Done", "On Progress", "Open"],
      datasets: [
        {
          label: "QE",
          data: [resultQE.QE.done, resultQE.QE.onProgress, resultQE.QE.open],
          backgroundColor: "#0e5774",
          borderRadius: 6,
          barThickness: 25,
        },
      ],
    });
    setDataBarTsel({
      labels: ["Done", "On Progress", "Open"],
      datasets: [
        {
          label: "TSEL",
          data: [
            resultTsel.TSEL.done,
            resultTsel.TSEL.onProgress,
            resultTsel.TSEL.open,
          ],
          backgroundColor: "#0A4C66", // warna utama bar
          borderColor: "#083B4E", // warna sisi untuk efek 3D
          borderWidth: 10, // ketebalan sisi "3D"
          borderSkipped: false, // bikin efek kotak 3D
          borderRadius: 2,
        },
      ],
    });
    setLoading(false);
  }, [month, parameter]);

  useEffect(() => {
    getData();
  }, [month, parameter]);

  const optionsD = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
        },
      },
      datalabels: {
        color: "#fff",
        font: { weight: "bold", size: 14 },
        formatter: (value) => `${value}%`,
      },
    },
  };

  const options3DB = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: "#fff",
        anchor: "end",
        align: "start",
        font: { weight: "bold", size: 14 },
        formatter: (v) => v.toLocaleString(),
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 14 } },
        grid: { display: false },
      },
      y: {
        display: false,
        grid: { display: false },
      },
    },
    datasets: {
      bar: {
        shadowOffsetX: 4,
        shadowOffsetY: 12,
        shadowBlur: 20,
        shadowColor: "rgba(0,0,0,0.25)",
      },
    },
  };

  const optionsB = {
    indexAxis: "y", // membuat bar horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: "#000",
        anchor: "end",
        align: "right",
        font: {
          size: 14,
          weight: "bold",
        },
        formatter: (value) => value.toLocaleString(),
      },
    },
    scales: {
      y: {
        ticks: {
          font: { size: 16, weight: "bold" },
          color: "#000",
        },
        grid: { display: false },
      },
      x: {
        ticks: {
          font: { size: 12 },
        },
        grid: {
          color: "#dcdcdc",
        },
        beginAtZero: true,
      },
    },
  };

  const optionsTselB = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0 },
    plugins: {
      legend: {
        display: false,
        labels: {
          color: "#ffffff",
        },
      },
      tooltip: {
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
      },
      datalabels: {
        color: "#ffffff", // warna text di dalam bar
        anchor: "center",
        align: "center",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value) => value,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        offset: false,
        grace: 0,
        ticks: {
          color: "#000000", // ← warna teks sumbu Y
        },
        grid: {
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: "#000000", // ← warna teks sumbu X
        },
      },
    },
  };

  const handleModal = (action, segmentName: string) => {
    setName(segmentName);
    setOpen(action);
  };

  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 m-6">
      {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}
      <div className="flex gap-4">
        <p className="text-xl font-semibold">Periode :</p>
        <Select className="w-42" defaultValue={month} onChange={setMonth}>
          {filterMonth.map((month) => {
            return (
              <Select.Option key={month.value} value={month.value}>
                {month.label}
              </Select.Option>
            );
          })}
        </Select>

        {/* <Select className="w-42" defaultValue={parameter} onChange={setParameter}>
          {filterParemeter.map((parameter) => {
            return (
              <Select.Option key={parameter.value} value={parameter.value}>
                {parameter.label}
              </Select.Option>
            );
          })}
        </Select> */}
      </div>

      <section className="grid grid-cols-4 gap-4 mt-4">
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">Upgrade Capacity</h2>
          <Doughnut
            data={dataPie}
            options={optionsD}
            onClick={() => {
              handleModal(true, "upgrade capacity");
            }}
          />
          <p className="text-lg font-semibold text-center cursor-pointer">
            Total: {dataCap && dataCap?.upgradeCapacity?.totalSite}
          </p>
          <TableDetailReportSupport
            data={dataCap?.data[0].data}
            total={dataCap?.data[0].Total}
            name="upgrade capacity"
            month={month}
            parameter={parameter}
          />
        </div>
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">1 Port 1 Node B</h2>
          <div className="w-full aspect-square">
            <Bar
              data={dataBarNode}
              options={options3DB}
              onClick={() => {
                handleModal(true, "node b");
              }}
            />
          </div>
          <p className="text-lg font-semibold text-center cursor-pointer">
            Total:{" "}
            {(() => {
              if (!dataNode) return 0;
              const values = Object.values(
                (dataNode as any)?.onePortOneNodeB ?? {}
              );
              const nums = values.map((v) => Number(v ?? 0));
              return nums.reduce((sum, val) => sum + val, 0);
            })()}
          </p>
          <TableDetailReportSupport
            data={dataNode?.data[0].data}
            total={dataNode?.data[0].Total}
            name="node b"
            parameter={parameter}
            month={month}
          />
        </div>
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">QE</h2>
          <div className="w-full aspect-square">
            <Bar
              data={dataBarQE}
              options={optionsB}
              onClick={() => {
                handleModal(true, "qe");
              }}
            />
          </div>
          <p className="text-lg font-semibold text-center cursor-pointer">
            Total:{" "}
            {(() => {
              if (!dataQe) return 0;
              const values = Object.values((dataQe as any)?.QE ?? {});
              const nums = values.map((v) => Number(v ?? 0));
              return nums.reduce((sum, val) => sum + val, 0);
            })()}
          </p>
          <TableDetailReportSupport
            data={dataQe?.data[0].data}
            total={dataQe?.data[0].Total}
            name="qe"
            month={month}
            parameter={parameter}
          />
        </div>
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">TSEL</h2>
          <div className="w-full aspect-square">
            <Bar
              data={dataBarTsel}
              options={optionsTselB}
              onClick={() => {
                handleModal(true, "tsel");
              }}
            />
          </div>
          <p className="text-lg font-semibold text-center cursor-pointer">
            Total:{" "}
            {(() => {
              if (!dataTsel) return 0;
              const values = Object.values((dataTsel as any)?.TSEL ?? {});
              const nums = values.map((v) => Number(v ?? 0));
              return nums.reduce((sum, val) => sum + val, 0);
            })()}
          </p>
          <TableDetailReportSupport
            data={dataTsel?.data[0].data}
            total={dataTsel?.data[0].Total}
            name="tsel"
            month={month}
            parameter={parameter}
          />
        </div>
      </section>
      <ModalTableBreakRegion
        open={open}
        onCancel={() => {
          handleModal(false, "");
        }}
        name={name}
        month={month}
        parameter={parameter}
      />
    </div>
  );
};

export default ReportSupportNeededPage;
