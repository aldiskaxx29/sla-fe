import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

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

  return (
    <div className="w-full max-w-sm">
      <h3 className="text-red-600 font-bold mb-3">RESUME ISSUE</h3>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <Pie data={chartData} />
      </div>
    </div>
  );
};

export default ResumeIssue;
