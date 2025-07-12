"use client";

import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import { supabase } from "@/lib/supabase";
import RequireAuth from "@/components/RequireAuth";
import NavBar from "@/components/NavBar";
import AddAppBtn from "./AddAppBtn";
import AppModal from "./AppModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ApplicationsDisplay from "./ApplicationsDisplay";
import Cookies from "js-cookie";

const Dashboard = () => {
  const { user } = useSupabaseAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appToEdit, setAppToEdit] = useState(null);
  const [appToDelete, setAppToDelete] = useState(null);
  const modalId = "appModal";
  const confirmModalId = "confirmModal";
  const [view, setView] = useState(() => {
    // Initialize from cookie, default to "list"
    return Cookies.get("dashboard-view") || "list";
  });

  // Save view preference to cookie whenever it changes
  useEffect(() => {
    Cookies.set("dashboard-view", view, { expires: 365 }); // Expires in 1 year
  }, [view]);

  // Fetch applications on component mount
  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        return;
      }

      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobData) => {
    if (!user) {
      throw new Error("Please log in to save applications");
    }

    let error;

    if (jobData.applicationId) {
      // Update existing application
      const appData = {
        user_id: user.id,
        status: jobData.status,
        deadline: jobData.status === "pending" ? jobData.deadline : null,
        link: jobData.link.trim() || null,
        company: jobData.company.trim() || null,
        location: jobData.location.trim() || null,
        salary: jobData.salary ? parseInt(jobData.salary) : null,
        notes: jobData.notes.trim() || null,
        // Do not change position on edit
      };
      const { error: updateError } = await supabase
        .from("applications")
        .update(appData)
        .eq("id", jobData.applicationId)
        .eq("user_id", user.id); // Ensure user can only update their own applications
      error = updateError;
    } else {
      // Increment position of all existing applications for this user
      if (applications.length > 0) {
        await Promise.all(
          applications.map((app) =>
            supabase
              .from("applications")
              .update({ position: (app.position || 0) + 1 })
              .eq("id", app.id)
              .eq("user_id", user.id)
          )
        );
      }
      // Create new application at position 0
      const appData = {
        user_id: user.id,
        status: jobData.status,
        deadline: jobData.status === "pending" ? jobData.deadline : null,
        link: jobData.link.trim() || null,
        company: jobData.company.trim() || null,
        location: jobData.location.trim() || null,
        salary: jobData.salary ? parseInt(jobData.salary) : null,
        notes: jobData.notes.trim() || null,
        position: 0,
      };
      const { error: insertError } = await supabase
        .from("applications")
        .insert([appData]);
      error = insertError;
    }

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "PGRST116") {
        throw new Error("Please log in to save applications");
      } else {
        throw new Error(error.message || "Failed to save application");
      }
    }

    // Clear editing state and refresh the applications list
    setAppToEdit(null);
    await fetchApplications();
  };

  const handleEditJob = (jobId) => {
    // Find the application by ID
    const application = applications.find((app) => app.id === jobId);
    if (application) {
      setAppToEdit(application);
      handleShowModal();
    }
  };

  const handleDeleteJob = async (jobId) => {
    // Find the application by ID to show in confirmation
    const application = applications.find((app) => app.id === jobId);
    if (application) {
      setAppToDelete(application);
      document.getElementById(confirmModalId)?.showModal();
    }
  };

  const confirmDelete = async () => {
    if (!user || !appToDelete) {
      return;
    }

    try {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", appToDelete.id)
        .eq("user_id", user.id); // Ensure user can only delete their own applications

      if (error) {
        console.error("Supabase error:", error);
        if (error.code === "PGRST116") {
          throw new Error("Please log in to delete applications");
        } else {
          throw new Error(error.message || "Failed to delete application");
        }
      }

      // Close modal and refresh the applications list
      document.getElementById(confirmModalId)?.close();
      setAppToDelete(null);
      await fetchApplications();
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Failed to delete application");
    }
  };

  const cancelDelete = () => {
    document.getElementById(confirmModalId)?.close();
    setAppToDelete(null);
  };

  const handleShowModal = () => {
    document.getElementById(modalId)?.showModal();
  };

  const handleStatusChange = async (jobId, newStatus) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", jobId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating status:", error);
        return;
      }
      // Refresh applications list
      await fetchApplications();
    } catch (err) {
      console.error("Unexpected error updating status:", err);
    }
  };

  const saveNewOrder = async (orderedApps) => {
    // orderedApps: array of app objects in new order
    const updates = orderedApps.map((app, idx) =>
      supabase
        .from("applications")
        .update({ position: idx })
        .eq("id", app.id)
        .eq("user_id", user.id)
    );
    await Promise.all(updates);
  };

  // Split applications into sections
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const urgentApps = applications.filter(
    (app) =>
      app.status === "pending" &&
      app.deadline &&
      new Date(app.deadline) <= oneWeekFromNow
  );
  const rejectedApps = applications.filter((app) => app.status === "rejected");
  const offerApps = applications.filter((app) => app.status === "offer");
  const otherApps = applications.filter(
    (app) =>
      app.status !== "rejected" &&
      app.status !== "offer" &&
      !(
        app.status === "pending" &&
        app.deadline &&
        new Date(app.deadline) <= oneWeekFromNow
      )
  );

  return (
    <>
      {user && (
        <RequireAuth>
          <NavBar />
          <div className="min-h-screen bg-base-100 p-4 pt-20">
            <div className="max-w-6xl mx-auto">
              {/* User Info Section */}
              <div className="flex flex-row items-center justify-between mb-8 bg-base-200 p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-base-content">
                  {user.user_metadata.full_name
                    ? `${
                        user.user_metadata.full_name.split(" ")[0]
                      }'s Dashboard`
                    : "Welcome to your Dashboard!"}
                </h1>
                <div className="flex flex-col items-end text-right">
                  <p className="text-base-content/70 mb-1">
                    You are logged in as:
                  </p>
                  <p className="font-semibold text-primary break-words">
                    {user.email || "No Email"}
                  </p>
                </div>
              </div>

              {/* Job Applications Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-base-content">
                    Your Applications ({applications.length})
                  </h2>
                  <div className="flex items-center gap-4">
                    <button
                      className={`btn btn-xs ${
                        view === "list" ? "btn-primary" : "btn-ghost"
                      }`}
                      onClick={() => setView("list")}
                      aria-label="List view"
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="14"
                          height="3"
                          rx="1"
                          fill="currentColor"
                        />
                        <rect
                          x="3"
                          y="9"
                          width="14"
                          height="3"
                          rx="1"
                          fill="currentColor"
                        />
                        <rect
                          x="3"
                          y="14"
                          width="14"
                          height="3"
                          rx="1"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button
                      className={`btn btn-xs ${
                        view === "grid" ? "btn-primary" : "btn-ghost"
                      }`}
                      onClick={() => setView("grid")}
                      aria-label="Grid view"
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="6"
                          height="6"
                          rx="1"
                          fill="currentColor"
                        />
                        <rect
                          x="11"
                          y="3"
                          width="6"
                          height="6"
                          rx="1"
                          fill="currentColor"
                        />
                        <rect
                          x="3"
                          y="11"
                          width="6"
                          height="6"
                          rx="1"
                          fill="currentColor"
                        />
                        <rect
                          x="11"
                          y="11"
                          width="6"
                          height="6"
                          rx="1"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-base-content/60">
                      No applications yet. Add your first one!
                    </p>
                  </div>
                ) : (
                  <ApplicationsDisplay
                    urgentApps={urgentApps}
                    rejectedApps={rejectedApps}
                    offerApps={offerApps}
                    otherApps={otherApps}
                    setApplications={setApplications}
                    onEdit={handleEditJob}
                    onDelete={handleDeleteJob}
                    onStatusChange={handleStatusChange}
                    saveNewOrder={saveNewOrder}
                    view={view}
                  />
                )}
              </div>
            </div>
          </div>
          <AddAppBtn handleClick={handleShowModal} />
          <AppModal
            modalId={modalId}
            onSaveJob={handleSaveJob}
            setAppToEdit={setAppToEdit}
            appToEdit={appToEdit}
          />
          <ConfirmDeleteModal
            modalId={confirmModalId}
            appToDelete={appToDelete}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        </RequireAuth>
      )}
    </>
  );
};

export default Dashboard;
