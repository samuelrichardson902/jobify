import React from "react";
import { STATUS_CONFIG } from "@/lib/analyticsConstants";

const SummaryStats = ({ applications }) => {
  // Calculate statistics
  const totalApplications = applications.length;
  const applicationsWithSalary = applications.filter(
    (app) => app.salary && app.salary > 0
  );
  const totalSalary = applicationsWithSalary.reduce(
    (sum, app) => sum + app.salary,
    0
  );
  const averageSalary =
    applicationsWithSalary.length > 0
      ? totalSalary / applicationsWithSalary.length
      : 0;

  // Count by status
  const statusCounts = {};
  Object.keys(STATUS_CONFIG).forEach((status) => {
    statusCounts[status] = 0;
  });

  applications.forEach((app) => {
    if (statusCounts.hasOwnProperty(app.status)) {
      statusCounts[app.status]++;
    }
  });

  // Calculate success rate (offers / total applications)
  const successRate =
    totalApplications > 0
      ? ((statusCounts.offer / totalApplications) * 100).toFixed(1)
      : 0;

  // Calculate response rate (interviewing + offers / total)
  const responseRate =
    totalApplications > 0
      ? (
          ((statusCounts.interviewing + statusCounts.offer) /
            totalApplications) *
          100
        ).toFixed(1)
      : 0;

  // Find most recent application
  const mostRecent =
    applications.length > 0
      ? applications.reduce((latest, app) =>
          new Date(app.created_at) > new Date(latest.created_at) ? app : latest
        )
      : null;

  const stats = [
    {
      title: "Total Applications",
      value: totalApplications,
      icon: "📊",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      subtitle: "Offers received",
      icon: "🎯",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Positive Response Rate",
      value: `${responseRate}%`,
      subtitle: "Interviews + Offers",
      icon: "📞",
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Average Salary",
      value:
        averageSalary > 0
          ? `£${Math.round(averageSalary).toLocaleString()}`
          : "N/A",
      subtitle: "For applications with salary",
      icon: "💰",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  const statusCards = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => {
      const config = STATUS_CONFIG[status];
      const percentage =
        totalApplications > 0
          ? ((count / totalApplications) * 100).toFixed(1)
          : 0;

      return (
        <div key={status} className="stat bg-base-200 rounded-lg">
          <div className="stat-figure">
            <div className={`badge ${config.color} badge-lg`}>
              {config.text}
            </div>
          </div>
          <div className="stat-title">{config.text}</div>
          <div className="stat-value text-2xl">{count}</div>
          <div className="stat-desc">{percentage}% of total</div>
        </div>
      );
    });

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`stat bg-base-100 rounded-lg shadow-lg ${stat.bgColor}`}
          >
            <div className="stat-figure text-2xl">{stat.icon}</div>
            <div className={`stat-title ${stat.color}`}>{stat.title}</div>
            <div className={`stat-value ${stat.color} text-2xl`}>
              {stat.value}
            </div>
            {stat.subtitle && (
              <div className="stat-desc text-base-content/70">
                {stat.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      {statusCards.length > 0 && (
        <div className="bg-base-100 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-base-content mb-4">
            Status Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusCards}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryStats;
