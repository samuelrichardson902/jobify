import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import {
  STATUS_CONFIG,
  getChartColors,
  getBackgroundColors,
} from "@/lib/analyticsConstants";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const StatusDonutChart = ({ applications }) => {
  // Count applications by status
  const statusCounts = {};

  Object.keys(STATUS_CONFIG).forEach((status) => {
    statusCounts[status] = 0;
  });

  applications.forEach((app) => {
    if (statusCounts.hasOwnProperty(app.status)) {
      statusCounts[app.status]++;
    }
  });

  // Filter out statuses with 0 applications
  const filteredData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]); // Sort by count descending

  const labels = filteredData.map(([status, _]) => STATUS_CONFIG[status].text);
  const data = filteredData.map(([_, count]) => count);
  const colors = filteredData.map(
    ([status, _]) => STATUS_CONFIG[status].chartColor
  );
  const backgroundColors = filteredData.map(
    ([status, _]) => STATUS_CONFIG[status].backgroundColor
  );

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderColor: colors,
        borderWidth: 2,
        hoverBackgroundColor: colors,
        hoverBorderColor: colors,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Applications by Status",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  if (applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-base-200 rounded-lg">
        <p className="text-base-content/60">No applications to display</p>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StatusDonutChart;
