import React, { useState, useRef, useEffect } from "react";

const AppCard = ({ jobObj, onEdit, onDelete, onStatusChange, dragHandle }) => {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusRef = useRef(null);

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
    if (newStatus !== jobObj.status && onStatusChange) {
      onStatusChange(jobObj.id, newStatus);
    }
  };

  const getStatusConfig = (status) => {
    return (
      statusOptions.find((opt) => opt.value === status) || statusOptions[0]
    );
  };

  const formatSalary = (salary) => {
    return `£${salary.toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const ensureExternalLink = (link) => {
    if (!link) return null;
    // If the link already has a protocol, return as is
    if (link.startsWith("http://") || link.startsWith("https://")) {
      return link;
    }
    // If it starts with //, add https:
    if (link.startsWith("//")) {
      return `https:${link}`;
    }
    // Otherwise, add https://
    return `https://${link}`;
  };

  const isPending = jobObj?.status === "pending";

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow duration-200 relative">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="card-title text-lg font-bold text-base-content line-clamp-1">
              {jobObj?.company || "Company Name"}
            </h3>
            <p className="text-base-content/70 text-sm">{jobObj?.location}</p>
          </div>

          {/* Status Badge as Dropdown */}
          <div className="relative" ref={statusRef}>
            <div
              className={`badge ${
                getStatusConfig(jobObj?.status).color
              } badge-sm cursor-pointer select-none`}
              onClick={handleStatusClick}
              tabIndex={0}
            >
              {getStatusConfig(jobObj?.status).text}
            </div>
            {statusDropdownOpen && (
              <ul className="absolute mt-2 w-40 bg-base-100 rounded shadow z-10 border border-base-300">
                {statusOptions.map((opt) => (
                  <li key={opt.value}>
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2 ${
                        jobObj.status === opt.value ? "font-bold" : ""
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
          {dragHandle && <div className="relative z-10">{dragHandle}</div>}
        </div>

        {/* Salary */}
        {jobObj?.salary && (
          <div className="mb-3">
            <span className="text-primary font-semibold">
              {formatSalary(jobObj.salary)}
            </span>
          </div>
        )}

        {/* Apply By Date */}
        {isPending && jobObj?.apply_by && (
          <div className="mb-3">
            <span className="text-xs text-base-content/60">Apply by: </span>
            <span className="text-sm font-medium text-warning">
              {formatDate(jobObj.apply_by)}
            </span>
          </div>
        )}

        {/* Applied Date */}
        {jobObj?.created_at && (
          <div className="mb-3">
            <span className="text-xs text-base-content/60">Created: </span>
            <span className="text-sm font-medium text-success">
              {formatDate(jobObj.created_at)}
            </span>
          </div>
        )}

        {/* Notes Preview */}
        {jobObj?.notes && (
          <div className="mb-4">
            <p className="text-sm text-base-content/70 line-clamp-2">
              {jobObj.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="card-actions justify-between items-center pt-2 border-t border-base-300">
          <div className="flex gap-2">
            {jobObj?.link && (
              <a
                href={ensureExternalLink(jobObj.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-xs text-primary"
              >
                View Job
              </a>
            )}
          </div>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-sm btn-square"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow"
            >
              <li>
                <button onClick={() => onEdit(jobObj.id)}>Edit</button>
              </li>
              <li>
                <button onClick={() => onDelete(jobObj.id)}>Delete</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppCard;
