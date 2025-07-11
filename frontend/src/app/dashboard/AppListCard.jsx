import React, { useState, useRef, useEffect } from "react";

const statusColors = {
  pending: "badge-warning",
  applied: "badge-info",
  interviewing: "badge-primary",
  offer: "badge-success",
  rejected: "badge-error",
};

const AppListCard = ({
  job,
  onEdit,
  onDelete,
  onStatusChange,
  expandedId,
  setExpandedId,
  dragHandle,
}) => {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusRef = useRef(null);

  const isExpanded = expandedId === job.id;

  const statusOptions = [
    { value: "pending", color: "badge-warning", text: "Need to Apply" },
    { value: "applied", color: "badge-info", text: "Applied" },
    { value: "interviewing", color: "badge-primary", text: "Interviewing" },
    { value: "offer", color: "badge-success", text: "Offer" },
    { value: "rejected", color: "badge-error", text: "Rejected" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    }
    if (statusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusDropdownOpen]);

  const handleStatusClick = (e) => {
    e.stopPropagation();
    setStatusDropdownOpen((open) => !open);
  };

  const handleStatusSelect = (newStatus) => {
    setStatusDropdownOpen(false);
    if (newStatus !== job.status && onStatusChange) {
      onStatusChange(job.id, newStatus);
    }
  };

  const getStatusConfig = (status) => {
    return (
      statusOptions.find((opt) => opt.value === status) || statusOptions[0]
    );
  };

  const formatSalary = (salary) => {
    if (!salary) return null;
    return `£${salary.toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={` rounded-lg bg-base-200 px-4 py-2 mb-1 transition-all duration-200 ${
        isExpanded ? "shadow-lg" : "shadow"
      }`}
      style={{ position: "relative" }}
      data-list-item="true"
    >
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setExpandedId(isExpanded ? null : job.id)}
      >
        <span className="font-semibold text-base-content line-clamp-1 flex-1">
          {job.company || "Company Name"}
        </span>
        <div className="w-[400px] flex items-center gap-2 min-h-[40px]">
          {/* Apply by section - conditional width */}
          <div className="w-32 flex justify-center items-center">
            {job.status === "pending" && job.apply_by && (
              <span className="text-xs text-warning font-medium whitespace-nowrap text-center">
                Apply by: {formatDate(job.apply_by)}
              </span>
            )}
          </div>

          {/* Location section */}
          <div className="w-24 flex justify-center items-center">
            <span className="text-xs text-base-content/60 text-center">
              {job.location}
            </span>
          </div>

          {/* Status section */}
          <div className="w-24 flex justify-center items-center">
            <div className="relative" ref={statusRef}>
              <div
                className={`badge ${
                  getStatusConfig(job?.status).color
                } badge-xs cursor-pointer select-none`}
                onClick={handleStatusClick}
                tabIndex={0}
              >
                {getStatusConfig(job?.status).text}
              </div>
              {statusDropdownOpen && (
                <ul className="absolute right-0 mt-2 w-40 bg-base-100 rounded shadow z-10 border border-base-300">
                  {statusOptions.map((opt) => (
                    <li key={opt.value}>
                      <button
                        className={`w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2 ${
                          job.status === opt.value ? "font-bold" : ""
                        }`}
                        onClick={() => handleStatusSelect(opt.value)}
                      >
                        <span className={`badge ${opt.color} badge-xs`}></span>
                        {opt.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Salary section */}
          <div className="w-24 flex justify-center items-center">
            <span className="text-xs text-base-content/60 text-center">
              {formatSalary(job.salary)}
            </span>
          </div>

          {/* Drag handle section */}
          {dragHandle && (
            <div className="w-8 flex justify-center items-center">
              <div className="relative z-10">{dragHandle}</div>
            </div>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-2 pl-2 border-l border-base-300 text-sm text-base-content/80 flex flex-col min-h-[60px]">
          {job.notes && (
            <div className="mb-1">
              <span className="font-medium">Notes:</span> {job.notes}
            </div>
          )}
          <div className="flex flex-row items-end justify-end mt-auto gap-4 flex-wrap w-full">
            {job.created_at && (
              <div>
                <span className="font-medium">Created:</span>{" "}
                <span className="text-success">
                  {formatDate(job.created_at)}
                </span>
              </div>
            )}
            {job.link && (
              <div>
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  View Job
                </a>
              </div>
            )}
            <div className="flex gap-2">
              <button
                className="btn btn-ghost btn-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(job.id);
                }}
                aria-label="Edit"
              >
                ✏️
              </button>
              <button
                className="btn btn-ghost btn-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(job.id);
                }}
                aria-label="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppListCard;
