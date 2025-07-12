import { useState, useEffect, useRef } from "react";
import InputField from "@/components/formComponents/InputField";
import TextAreaField from "@/components/formComponents/TextAreaField";
import DateField from "@/components/formComponents/DateField";
import AutoFillButton from "@/components/formComponents/AutoFillButton";
import { supabase } from "@/lib/supabase";

const AppModal = ({ modalId, onSaveJob, setAppToEdit, appToEdit }) => {
  const [deadline, setDeadline] = useState(null);
  const [link, setLink] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("applied");
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusRef = useRef(null);

  const statusOptions = [
    { value: "pending", color: "badge-warning", text: "Pending" },
    { value: "applied", color: "badge-info", text: "Applied" },
    { value: "interviewing", color: "badge-primary", text: "Interviewing" },
    { value: "offer", color: "badge-success", text: "Offer" },
    { value: "rejected", color: "badge-error", text: "Rejected" },
  ];

  // Check if we're in edit mode
  const isEditMode = appToEdit !== null;

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

  useEffect(() => {
    if (appToEdit) {
      // Populate form with existing data for editing
      setDeadline(appToEdit.deadline ? new Date(appToEdit.deadline) : null);
      setLink(appToEdit.link || "");
      setCompany(appToEdit.company || "");
      setLocation(appToEdit.location || "");
      setSalary(appToEdit.salary ? appToEdit.salary.toString() : "");
      setNotes(appToEdit.notes || "");
      setStatus(appToEdit.status || "applied");
    }
  }, [appToEdit]);

  // Reset form when modal opens for new applications
  useEffect(() => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const observer = new MutationObserver(() => {
      if (modal.hasAttribute("open") && !appToEdit) {
        // Only reset if we're not editing (appToEdit is null)
        resetForm();
      }
    });
    observer.observe(modal, { attributes: true });
    return () => observer.disconnect();
  }, [modalId, appToEdit]);

  const resetForm = () => {
    setDeadline(null);
    setLink("");
    setCompany("");
    setLocation("");
    setSalary("");
    setNotes("");
    setStatus("applied");
    setIsAutoFilling(false);
    setIsSaving(false);
    setLinkError("");
    setSaveError("");
    setStatusDropdownOpen(false);
    setAppToEdit(null);
  };

  const handleStatusClick = (e) => {
    e.stopPropagation();
    setStatusDropdownOpen((open) => !open);
  };

  const handleStatusSelect = (newStatus) => {
    setStatusDropdownOpen(false);
    setStatus(newStatus);
    setDeadline(null);
  };

  const getStatusConfig = (status) => {
    return (
      statusOptions.find((opt) => opt.value === status) || statusOptions[0]
    );
  };

  const handleAutoFill = async () => {
    if (!link.trim())
      return setLinkError("Please enter a job posting link first");

    try {
      new URL(link);
    } catch {
      return setLinkError("Please enter a valid URL");
    }

    setIsAutoFilling(true);
    try {
      // Get the current session and access token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        setLinkError("Please log in to use auto-fill feature");
        return;
      }

      const res = await fetch("/api/scrape-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ url: link }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 429) {
          setLinkError("Rate limit exceeded. Please try again later.");
        } else if (res.status === 401) {
          setLinkError("Authentication required. Please log in again.");
        } else {
          setLinkError(errorData.error || "Failed to auto-fill job data");
        }
        return;
      }

      const jobData = (await res.json()).data;
      console.log(jobData);
      if (jobData.company) setCompany(jobData.company);
      if (jobData.location) setLocation(jobData.location);
      if (jobData.salary) setSalary(jobData.salary);
      if (jobData.notes) setNotes(jobData.notes);
      if (jobData.deadline) setDeadline(jobData.deadline);
    } catch (error) {
      console.error("Auto-fill error:", error);
      setLinkError("Failed to auto-fill job data. Please fill manually.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!company.trim() && !link.trim()) {
      setSaveError("Company name or Link is required");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const jobData = {
        deadline,
        link,
        company,
        location,
        salary,
        notes,
        status,
        // Include application ID if we're editing
        ...(isEditMode && { applicationId: appToEdit.id }),
      };

      await onSaveJob(jobData);
      resetForm();
      document.getElementById(modalId)?.close();
    } catch (error) {
      console.error("Save error:", error);
      setSaveError(error.message || "Failed to save application");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-xl mb-4">
          {isEditMode ? "Edit Application" : "Add Application"}
        </h3>
        {saveError && (
          <div className="alert alert-error text-error-content mb-4">
            <span>{saveError}</span>
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <InputField
                label="Job Posting Link"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  if (linkError) setLinkError("");
                }}
                placeholder="https://company.com/careers/job-posting"
                error={linkError}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              />
            </div>
            <AutoFillButton
              onClick={handleAutoFill}
              disabled={isAutoFilling || !link.trim()}
              loading={isAutoFilling}
            />
          </div>
          <InputField
            label="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
            required
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
          <InputField
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Remote or City"
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
          <InputField
            label="Salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="100000"
            type="number"
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
          <TextAreaField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
          {/* Status Dropdown */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <div className="relative" ref={statusRef}>
              <div
                className={`badge ${
                  getStatusConfig(status).color
                } badge-lg cursor-pointer select-none justify-start p-3`}
                onClick={handleStatusClick}
                tabIndex={0}
              >
                {getStatusConfig(status).text}
              </div>
              {statusDropdownOpen && (
                <ul className="absolute top-full left-0 mt-2 w-48 bg-base-100 rounded shadow z-10 border border-base-300">
                  {statusOptions.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2 ${
                          status === opt.value ? "font-bold" : ""
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

          {status === "pending" && (
            <DateField
              label="Deadline"
              helper="Set a deadline reminder (application, assessment, etc.)"
              selected={deadline}
              onChange={setDeadline}
            />
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="btn btn-outline btn-error"
              onClick={() => {
                resetForm();
                document.getElementById(modalId)?.close();
              }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : isEditMode ? (
                "Update Application"
              ) : (
                "Save Application"
              )}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button
          onClick={() => {
            resetForm();
            document.getElementById(modalId)?.close();
          }}
        >
          close
        </button>
      </form>
    </dialog>
  );
};

export default AppModal;
