import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { STATUS_CONFIG } from "@/lib/analyticsConstants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ApplicationsTimelineChart = ({ applications }) => {
  // Group applications by month
  const monthlyData = {};

  applications.forEach((app) => {
    const date = new Date(app.created_at);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        total: 0,
        byStatus: {},
      };
    }

    monthlyData[monthKey].total++;
    monthlyData[monthKey].byStatus[app.status] =
      (monthlyData[monthKey].byStatus[app.status] || 0) + 1;
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort();

  // Create a complete 6-month timeline (last 6 months)
  const now = new Date();
  const last6Months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    last6Months.push(monthKey);
  }

  // Calculate cumulative totals for last 6 months
  let cumulativeTotal = 0;
  const cumulativeData = last6Months.map((month) => {
    const monthData = monthlyData[month] || { total: 0, byStatus: {} };
    cumulativeTotal += monthData.total;
    return {
      month,
      total: cumulativeTotal,
      byStatus: monthData.byStatus,
    };
  });

  // Format month labels
  const labels = cumulativeData.map((item) => {
    const [year, month] = item.month.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  });

  // Create datasets for each status
  const datasets = Object.keys(STATUS_CONFIG).map((status) => {
    const statusConfig = STATUS_CONFIG[status];
    const data = cumulativeData.map((item) => {
      return item.byStatus[status] || 0;
    });

    return {
      label: statusConfig.text,
      data,
      backgroundColor: statusConfig.chartColor,
      borderColor: statusConfig.chartColor,
      borderWidth: 1,
      borderRadius: 2,
      borderSkipped: false,
    };
  });

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    barThickness: "flex",
    maxBarThickness: 50,
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
        text: "Applications - Last 6 Months",
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
        mode: "index",
        intersect: false,
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: false,
          text: "Month",
        },
        grid: {
          display: false,
        },
        stacked: true,
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Number of Applications",
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        stacked: true,
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
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
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ApplicationsTimelineChart;
