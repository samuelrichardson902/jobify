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

const SalaryDistributionChart = ({ applications }) => {
  // Filter applications with salary data
  const applicationsWithSalary = applications.filter(
    (app) => app.salary && app.salary > 0
  );

  if (applicationsWithSalary.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-base-200 rounded-lg">
        <p className="text-base-content/60">No salary data available</p>
      </div>
    );
  }

  // Group applications by status and calculate salary statistics
  const salaryByStatus = {};

  Object.keys(STATUS_CONFIG).forEach((status) => {
    salaryByStatus[status] = [];
  });

  applicationsWithSalary.forEach((app) => {
    if (salaryByStatus[app.status]) {
      salaryByStatus[app.status].push(app.salary);
    }
  });

  // Calculate average salary for each status
  const averageSalaries = {};
  const statusLabels = [];
  const averageData = [];
  const colors = [];

  Object.entries(salaryByStatus).forEach(([status, salaries]) => {
    if (salaries.length > 0) {
      const average =
        salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length;
      averageSalaries[status] = average;
      statusLabels.push(STATUS_CONFIG[status].text);
      averageData.push(Math.round(average));
      colors.push(STATUS_CONFIG[status].chartColor);
    }
  });

  const chartData = {
    labels: statusLabels,
    datasets: [
      {
        label: "Average Salary (£)",
        data: averageData,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Average Salary by Status",
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
            return `Average: £${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Application Status",
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Salary (£)",
        },
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            return `£${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SalaryDistributionChart;
