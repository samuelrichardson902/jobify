import { useState, useEffect } from "react";
import InputField from "@/components/formComponents/InputField";
import TextAreaField from "@/components/formComponents/TextAreaField";
import ToggleSwitch from "@/components/formComponents/ToggleSwitch";
import DateField from "@/components/formComponents/DateField";
import AutoFillButton from "@/components/formComponents/AutoFillButton";

const AddAppModal = ({ modalId }) => {
  const [hasApplied, setHasApplied] = useState(true);
  const [applyBy, setApplyBy] = useState(null);
  const [link, setLink] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [linkError, setLinkError] = useState("");

  useEffect(() => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const observer = new MutationObserver(() => {
      if (modal.hasAttribute("open")) resetForm();
    });
    observer.observe(modal, { attributes: true });
    return () => observer.disconnect();
  }, [modalId]);

  const resetForm = () => {
    setHasApplied(true);
    setApplyBy(null);
    setLink("");
    setCompany("");
    setLocation("");
    setSalary("");
    setNotes("");
    setIsAutoFilling(false);
    setLinkError("");
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

      const jobData = await res.json();
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

  const handleSave = (e) => {
    e.preventDefault();
    const appData = {
      hasApplied,
      applyBy: hasApplied ? null : applyBy,
      link,
      company,
      location,
      salary,
      notes,
    };
    console.log("Saving application:", appData);
    resetForm();
    document.getElementById(modalId)?.close();
  };

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-xl mb-4">Add Application</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <InputField
                label="Application Link"
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
          <ToggleSwitch
            label="Already Applied?"
            description="Toggle if you've already submitted your application"
            checked={hasApplied}
            onChange={() => {
              setHasApplied((prev) => !prev);
              if (!hasApplied) setApplyBy(null);
            }}
          />
          {!hasApplied && (
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
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Application
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AddAppModal;
