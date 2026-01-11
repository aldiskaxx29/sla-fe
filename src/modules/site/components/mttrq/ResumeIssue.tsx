import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface ResumeIssueProps {
  data: Array<{ label: string; value: number; color?: string }>;
}

const ResumeIssue: React.FC<ResumeIssueProps> = ({ data = [] }) => {
  const chartData = useMemo(() => {
    return {
      labels: data.map((d) => d.label),
      datasets: [
        {
          data: data.map((d) => d.value),
          backgroundColor: data.map((d) => d.color || "#888"),
          hoverOffset: 8,
        },
      ],
    };
  }, [data]);

  const options = useMemo(() => {
    return {
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { usePointStyle: true },
        },
        datalabels: {
          color: "#ffffff",
          font: { weight: "bold" as const, size: 12 },
          formatter: (value: number) => {
            return String(value);
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.label}: ${context.parsed}`,
          },
        },
      },
    };
  }, []);

  return (
    <div className="w-full max-w-sm">
      <h3 className="text-red-600 font-bold mb-3">RESUME ISSUE</h3>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ResumeIssue;
