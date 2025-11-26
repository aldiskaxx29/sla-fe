import { Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";

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
import { TableDetailReportSupport } from "../components/TableDetailReportSupport";
import { useLazyGetReportSupportUpgradeCapQuery, useLazyGetReportSupportUpgradeNodebQuery, useLazyGetReportSupportUpgradeQeQuery, useLazyGetReportSupportUpgradeTselQuery } from "../rtk/site.rtk";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportSupportNeededPage = () => {
  const [loading, setLoading] = useState(false);
  const [dataPie, setDataPie] = useState<ChartData<"pie", number[], string>>({
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
    plugins: {},
    elements: {
      bar: {
        borderWidth: 2,
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

      <section className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">Upgrade Capacity</h2>
          <Pie data={dataPie} />
          <TableDetailReportSupport data={dataCap?.data[0].data} />
        </div>
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">1 Port 1 Node B</h2>
          <Bar data={dataBarNode} options={options3D} />
          <TableDetailReportSupport data={dataNode?.data[0].data} />
        </div>
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">QE</h2>
          <Bar data={dataBarQE} options={options} />
          <TableDetailReportSupport data={dataQe?.data[0].data} />
        </div>
        <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold">TSEL</h2>
          <Bar data={dataBarTsel} options={options3D} />
          <TableDetailReportSupport data={dataTsel?.data[0].data} />
        </div>
      </section>
    </div>
  );
};

export default ReportSupportNeededPage;
