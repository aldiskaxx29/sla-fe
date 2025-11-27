import { Select, Spin } from "antd";
import { useEffect, useState } from "react";
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
import { useLazyGetReportSupportUpgradeCapQuery, useLazyGetReportSupportUpgradeNodebQuery, useLazyGetReportSupportUpgradeQeQuery, useLazyGetReportSupportUpgradeTselQuery } from "../rtk/site.rtk";

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
  const [loading, setLoading] = useState(false);
  const [dataPie, setDataPie] = useState<ChartData<"doughnut", number[], string>>({
    labels: [],
    datasets: [],
  });
  const [dataBarNode, setDataBarNode] = useState<ChartData<"bar", number[], string>>({
    labels: [],
    datasets: [],
  });
  const [dataBarQE, setDataBarQE] = useState<ChartData<"bar", number[], string>>({
    labels: [],
    datasets: [],
  });
  const [dataBarTsel, setDataBarTsel] = useState<ChartData<"bar", number[], string>>({
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
  const options = {
    indexAxis: "y" as const,
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
      },
    },
  };

  const options3D = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {},
    elements: {
      bar: {
        borderWidth: 2,
        height: 210
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        beginAtZero: true,
      },
    },
  };
  const [getCap, { data: dataCap }] = useLazyGetReportSupportUpgradeCapQuery()
  const [getNode, { data: dataNode }] = useLazyGetReportSupportUpgradeNodebQuery()
  const [getQe, { data: dataQe }] = useLazyGetReportSupportUpgradeQeQuery()
  const [getTsel, { data: dataTsel }] = useLazyGetReportSupportUpgradeTselQuery()

  const getData = async () => {
    setLoading(true)
    const resultCap = await getCap({ query: { month: 11 } }).unwrap()
    const resultNode = await getNode({ query: { month: 11 } }).unwrap()
   const resultQE = await getQe({ query: { month: 11 } }).unwrap()
   const resultTsel = await getTsel({ query: { month: 11 } }).unwrap()
    setDataPie(
      {
        labels: Object.keys(resultCap.upgradeCapacity.percentage),
        datasets: [
          {
            data: Object.values(resultCap.upgradeCapacity.percentage),
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
            ],
          },
        ],
      }
    )
    setDataBarNode(
      {
        labels: ["Progress Status"],
        datasets: [
          {
            label: "Done",
            data: [resultNode.onePortOneNodeB.done],
            backgroundColor: ["rgba(255, 99, 132, 0.2)"],
            borderColor: ["rgba(255, 99, 132, 1)"],
          },
          {
            label: "On Progress",
            data: [resultNode.onePortOneNodeB.onProgress],
            backgroundColor: ["rgba(54, 162, 235, 0.2)"],
            borderColor: ["rgba(54, 162, 235, 1)"],
          },
          {
            label: "Open",
            data: [resultNode.onePortOneNodeB.open],
            backgroundColor: ["rgba(255, 206, 86, 0.2)"],
            borderColor: ["rgba(255, 206, 86, 1)"],
          },
        ],
      }
    )
    setDataBarQE(
      {
        labels: ["Progress Status"],
        datasets: [
          {
            label: "Done",
            data: [resultQE.QE.done],
            backgroundColor: ["rgba(255, 99, 132, 0.2)"],
            borderColor: ["rgba(255, 99, 132, 1)"],
          },
          {
            label: "On Progress",
            data: [resultQE.QE.onProgress],
            backgroundColor: ["rgba(54, 162, 235, 0.2)"],
            borderColor: ["rgba(54, 162, 235, 1)"],
          },
          {
            label: "Open",
            data: [resultQE.QE.open],
            backgroundColor: ["rgba(255, 206, 86, 0.2)"],
            borderColor: ["rgba(255, 206, 86, 1)"],
          },
        ],
      }
    )
    setDataBarTsel(
      {
        labels: ["Progress Status"],
        datasets: [
          {
            label: "Done",
            data: [resultTsel.TSEL.done],
            backgroundColor: ["rgba(255, 99, 132, 0.2)"],
            borderColor: ["rgba(255, 99, 132, 1)"],
          },
          {
            label: "On Progress",
            data: [resultTsel.TSEL.onProgress],
            backgroundColor: ["rgba(54, 162, 235, 0.2)"],
            borderColor: ["rgba(54, 162, 235, 1)"],
          },
          {
            label: "Open",
            data: [resultTsel.TSEL.open],
            backgroundColor: ["rgba(255, 206, 86, 0.2)"],
            borderColor: ["rgba(255, 206, 86, 1)"],
          },
        ],
      }
    )
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, []);

  const total = 8700;
  const dataValues = [34, 52, 14]; // persen

  const dataPieD = {
    labels: ["Done", "On Progress", "Open"],
    datasets: [
      {
        data: dataValues,
        backgroundColor: ["#185E8B", "#EB7035", "#3B7E2D"],
        borderWidth: 0,
        cutout: "70%", //  donut
      },
    ],
  };

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

  const dataBarNodeB = {
    labels: ["Done", "On Progress", "Open"],
    datasets: [
      {
        label: "",
        data: [3000, 4500, 1200],
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: g, chartArea } = chart;
  
          if (!chartArea) return "#0e5774";
  
          const gradient = g.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "#0e5774");
          gradient.addColorStop(1, "#0f6e8e");
          return gradient;
        },
        borderRadius: 8,
        barPercentage: 0.5,
      },
    ],
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
        grid: { display: false }
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
  
  // ChartJS.register({
  //   id: "barShadow",
  //   beforeDraw: (chart) => {
  //     const ctx = chart.ctx;
  //     chart.data.datasets.forEach((dataset, i) => {
  //       const meta = chart.getDatasetMeta(i);
  
  //       meta.data.forEach((bar) => {
  //         ctx.save();
  //         ctx.shadowColor = "rgba(0,0,0,0.25)";
  //         ctx.shadowBlur = 20;
  //         ctx.shadowOffsetX = 4;
  //         ctx.shadowOffsetY = 12;
  //         ctx.fillStyle = bar.options.backgroundColor;
  //         ctx.fillRect(bar.x - bar.width / 2, bar.y, bar.width, bar.base - bar.y);
  //         ctx.restore();
  //       });
  //     });
  //   },
  // });

  const dataBarQEB = {
    labels: ["Done", "On Progress", "Open"],
    datasets: [
      {
        label: "",
        data: [3000, 4500, 1200],
        backgroundColor: "#0e5774",
        borderRadius: 6,
        barThickness: 25,
      },
    ],
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

  const dataBarTselB = {
    labels: ["Done", "On Progress", "Open"],
    datasets: [
      {
        label: "TSEL",
        data: [3000, 4500, 1200],
        backgroundColor: "#0A4C66",        // warna utama bar
        borderColor: "#083B4E",           // warna sisi untuk efek 3D
        borderWidth: 10,                  // ketebalan sisi "3D"
        borderSkipped: false,             // bikin efek kotak 3D
        borderRadius: 2,
      }
    ]
  };

  const optionsTselB = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0 },
    plugins: {
      legend: { 
        display: false,
        labels: {
          color: "#ffffff"
        }
      },
      tooltip: {
        titleColor: "#ffffff",
        bodyColor: "#ffffff"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        offset: false,
        grace: 0,
        ticks: {
          color: "#ffffff"   // ← warna teks sumbu Y
        },
        grid: {
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: "#ffffff"   // ← warna teks sumbu X
        }
      }
    }
  };
  
  
  

  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 m-6">
      {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}
      <div className="flex gap-4">
        <p className="text-xl font-semibold">Periode :</p>
        <Select className="w-42" onChange={() => setLoading(!loading)}>
          {filterMonth.map((month) => {
            return (
              <Select.Option key={month.value} value={month.value}>
                {month.label}
              </Select.Option>
            );
          })}
        </Select>
      </div>

      <section className="grid grid-cols-4 gap-4 mt-4">
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">Upgrade Capacity</h2>

          {/* <Pie data={dataPie} /> */}
          <Doughnut data={dataPieD} options={optionsD} />
          <TableDetailReportSupport data={dataCap?.data[0].data} />
        </div>
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">1 Port 1 Node B</h2>
          <div className="w-full aspect-square">

          {/* <Bar data={dataBarNode} options={options3D} /> */}
          <Bar data={dataBarNodeB} options={options3DB} />
          </div>
          <TableDetailReportSupport data={dataNode?.data[0].data} />
        </div>
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">QE</h2>
          <div className="w-full aspect-square">

          <Bar data={dataBarQEB} options={optionsB} />
          </div>
          <TableDetailReportSupport data={dataQe?.data[0].data} />
        </div>
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">TSEL</h2>
          <div className="w-full aspect-square">

          <Bar data={dataBarTselB} options={optionsTselB} />
          </div>
          <TableDetailReportSupport data={dataTsel?.data[0].data} />
        </div>
      </section>
    </div>
  );
};

export default ReportSupportNeededPage;
