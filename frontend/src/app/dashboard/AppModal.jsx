import { useState, useEffect } from "react";
import InputField from "@/components/formComponents/InputField";
import TextAreaField from "@/components/formComponents/TextAreaField";
import DateField from "@/components/formComponents/DateField";
import AutoFillButton from "@/components/formComponents/AutoFillButton";
import Selector from "@/components/formComponents/Selector";

const AppModal = ({ modalId, onSaveJob, setAppToEdit, appToEdit }) => {
  const [applyBy, setApplyBy] = useState(null);
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

  // Check if we're in edit mode
  const isEditMode = appToEdit !== null;

  useEffect(() => {
    if (appToEdit) {
      // Populate form with existing data for editing
      setApplyBy(appToEdit.apply_by ? new Date(appToEdit.apply_by) : null);
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
    setApplyBy(null);
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
    setAppToEdit(null);
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
      const res = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link }),
      });

      const jobData = (await res.json()).data;
      console.log(jobData);
      if (jobData.company) setCompany(jobData.company);
      if (jobData.location) setLocation(jobData.location);
      if (jobData.salary) setSalary(jobData.salary);
      if (jobData.notes) setNotes(jobData.notes);
      if (jobData.applyBy) setApplyBy(jobData.applyBy);
    } catch {
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
        applyBy,
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
          <Selector
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setApplyBy(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            options={[
              { value: "pending", label: "Need to Apply" },
              { value: "applied", label: "Applied" },
              { value: "interviewing", label: "Interviewing" },
              { value: "rejected", label: "Rejected" },
              { value: "offer", label: "Offer" },
            ]}
          />

          {status === "pending" && (
            <DateField
              label="Apply By Date"
              helper="Set a deadline reminder"
              selected={applyBy}
              onChange={setApplyBy}
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
