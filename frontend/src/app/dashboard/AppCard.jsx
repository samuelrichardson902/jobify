const AppCard = ({ jobObj }) => {
  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    const num = parseInt(salary);
    return num >= 1000 ? `$${(num / 1000).toFixed(0)}k` : `$${num}`;
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="card-title text-lg font-bold text-base-content line-clamp-1">
              {jobObj?.company || "Company Name"}
            </h3>
            <p className="text-base-content/70 text-sm">
              {jobObj?.location || "Location"}
            </p>
          </div>

          {/* Status Badge */}
          <div
            className={`badge ${
              jobObj?.hasApplied ? "badge-success" : "badge-warning"
            } badge-sm`}
          >
            {jobObj?.hasApplied ? "Applied" : "Pending"}
          </div>
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
        {!jobObj?.hasApplied && jobObj?.applyBy && (
          <div className="mb-3">
            <span className="text-xs text-base-content/60">Apply by: </span>
            <span className="text-sm font-medium text-warning">
              {formatDate(jobObj.applyBy)}
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
                href={jobObj.link}
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
                <a>Edit</a>
              </li>
              <li>
                <a>Delete</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppCard;
