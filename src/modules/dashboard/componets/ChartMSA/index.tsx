import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Image, Slider } from "antd";
import zoomPlugin from "chartjs-plugin-zoom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ArrowDown from "@/assets/arrow_down.svg";
import ArrowUp from "@/assets/arrow_up.svg";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin // 📌 Enable zooming and panning
);

interface ChartMSAProps {
  title: string;
  description: string;
  data: {
    week: string[];
    data: { name: string; data: (number | string)[] }[];
  };
}

const ChartMSA: React.FC<ChartMSAProps> = ({ title, description, data }) => {
  const monthMapping: Record<number, string> = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec",
  };

  // Default range covers full data
  const [range, setRange] = useState<[number, number]>([
    0,
    data.week.length - 1,
  ]);
  const [minMax, setMinMax] = useState([0, 1]);

  const transformChartData = useMemo(() => {
    const transformedLabels = data.week.map((week) => {
      const match = week.match(/ach_(\d+)_(\d+)/);
      if (match) {
        const monthNumber = parseInt(match[1]);
        const weekNumber = parseInt(match[2]);
        return `${monthMapping[monthNumber]} W${weekNumber}`;
      }
      return week;
    });

    // Apply range filtering
    const filteredLabels = transformedLabels.slice(range[0], range[1] + 1);
    const filteredDatasets = data.data.map((item) => ({
      label: item.name.replace(/\b\w/g, (char) => char.toUpperCase()),
      data: item.data
        .slice(range[0], range[1] + 1)
        .map((value) => Number(value)),
      borderColor: item.name.toLowerCase().includes("target")
        ? "rgba(255, 99, 132, 1)"
        : "rgba(75, 192, 192, 1)",
      backgroundColor: item.name.toLowerCase().includes("target")
        ? "rgba(255, 99, 132, 0.2)"
        : "rgba(75, 192, 192, 0.2)",
      borderDash: item.name.toLowerCase().includes("target") ? [5, 5] : [],
    }));

    const dataCounting = filteredDatasets.map((data) => data.data);

    const lowest = Math.min(...dataCounting.flat(1));
    const highest = Math.max(...dataCounting.flat(1));

    setMinMax([lowest, highest]);

    return {
      labels: filteredLabels,
      datasets: filteredDatasets,
    };
  }, [data, range]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          usePointStyle: true,
          generateLabels: (chart) => {
            return chart.data.datasets.map((dataset, i) => {
              return {
                text: dataset.label,
                strokeStyle: dataset.borderColor,
                lineWidth: 3,
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i,
                lineDash: dataset.borderDash || [],
                pointStyle: "line",
              };
            });
          },
        },
      },
      tooltip: { enabled: true },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
      },
    },
    scales: {
      y: {
        min: minMax[0] - (minMax[0] * 1) / 100,
        max: minMax[1] + (minMax[1] * 1) / 100,
      },
      x: {
        ticks: {
          autoSkip: true, // Avoid overcrowding labels
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
  };

  return (
    <div className="w-full p-2">
      <div className="flex justify-between my-2">
        <p className="font-bold text-sm">{title}</p>
        <div className="flex gap-2 items-center">
          {description.includes("Lower") ? (
            <Image className="" src={ArrowDown} alt="logo" width={24} />
          ) : (
            <Image src={ArrowUp} alt="logo" width={24} />
          )}
          <div
            className={`${
              description.includes("Lower") ? "bg-[#FFE7BA]" : "bg-[#BAE7FF]"
            } rounded-md h-fit text-[8px] py-[2px] px-[5px] gap-1 flex items-center`}
          >
            <span>{description}</span>
          </div>
        </div>
      </div>

      {/* Chart with zoom and pan */}
      <div className="h-64">
        <Line data={transformChartData} options={options} />
      </div>

      {/* Custom range slider */}
      <Slider
        range
        min={0}
        max={data.week.length - 1}
        value={range}
        styles={{ track: { background: "#dddddd" } }}
        onChange={setRange}
        tooltip={{ formatter: (value) => data.week[value] }}
      />
    </div>
  );
};

export default ChartMSA;
