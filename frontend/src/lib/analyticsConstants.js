// Status configuration for analytics
export const STATUS_CONFIG = {
  pending: {
    value: "pending",
    color: "badge-warning",
    text: "Need to Apply",
    chartColor: "#fbbf24", // amber-400
    backgroundColor: "rgba(251, 191, 36, 0.8)",
    borderColor: "#fbbf24",
  },
  applied: {
    value: "applied",
    color: "badge-info",
    text: "Applied",
    chartColor: "#60a5fa", // blue-400
    backgroundColor: "rgba(96, 165, 250, 0.8)",
    borderColor: "#60a5fa",
  },
  interviewing: {
    value: "interviewing",
    color: "badge-primary",
    text: "Interviewing",
    chartColor: "#8b5cf6", // violet-500
    backgroundColor: "rgba(139, 92, 246, 0.8)",
    borderColor: "#8b5cf6",
  },
  offer: {
    value: "offer",
    color: "badge-success",
    text: "Offer",
    chartColor: "#10b981", // emerald-500
    backgroundColor: "rgba(16, 185, 129, 0.8)",
    borderColor: "#10b981",
  },
  rejected: {
    value: "rejected",
    color: "badge-error",
    text: "Rejected",
    chartColor: "#ef4444", // red-500
    backgroundColor: "rgba(239, 68, 68, 0.8)",
    borderColor: "#ef4444",
  },
};

export const STATUS_OPTIONS = Object.values(STATUS_CONFIG);

// Helper function to get status config
export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.applied;
};

// Helper function to get chart colors for all statuses
export const getChartColors = () => {
  return STATUS_OPTIONS.map((status) => status.chartColor);
};

// Helper function to get background colors for all statuses
export const getBackgroundColors = () => {
  return STATUS_OPTIONS.map((status) => status.backgroundColor);
};

// Helper function to get border colors for all statuses
export const getBorderColors = () => {
  return STATUS_OPTIONS.map((status) => status.borderColor);
};
