import React from "react";
import {
  SummaryStats,
  StatusDonutChart,
  ApplicationsTimelineChart,
  SalaryDistributionChart,
} from "./index";

const AnalyticsDashboard = ({ applications, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-base-content mb-2">
            No Analytics Available
          </h3>
          <p className="text-base-content/60 mb-4">
            Start adding applications to see your analytics and insights.
          </p>
          <div className="text-sm text-base-content/50">
            Your analytics will include:
          </div>
          <ul className="text-sm text-base-content/50 mt-2 space-y-1">
            <li>• Application status distribution</li>
            <li>• Timeline of your job search</li>
            <li>• Salary insights by status</li>
            <li>• Success and response rates</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <SummaryStats applications={applications} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Donut Chart */}
        <div className="lg:col-span-1">
          <StatusDonutChart applications={applications} />
        </div>

        {/* Applications Timeline */}
        <div className="lg:col-span-1">
          <ApplicationsTimelineChart applications={applications} />
        </div>

        {/* Salary Distribution */}
        <div className="lg:col-span-2">
          <SalaryDistributionChart applications={applications} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
