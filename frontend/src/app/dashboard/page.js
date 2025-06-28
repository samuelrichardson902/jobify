"use client";

import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import { supabase } from "@/lib/supabase";
import RequireAuth from "@/components/RequireAuth";
import NavBar from "@/components/NavBar";
import AddAppBtn from "./AddAppBtn";
import AppModal from "./AppModal";
import AppCard from "./AppCard";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const Dashboard = () => {
  const { user } = useSupabaseAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appToEdit, setAppToEdit] = useState(null);
  const [appToDelete, setAppToDelete] = useState(null);
  const modalId = "appModal";
  const confirmModalId = "confirmModal";

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

    const appData = {
      user_id: user.id,
      status: jobData.status,
      apply_by: jobData.status === "pending" ? jobData.applyBy : null,
      link: jobData.link.trim() || null,
      company: jobData.company.trim() || null,
      location: jobData.location.trim() || null,
      salary: jobData.salary ? parseInt(jobData.salary) : null,
      notes: jobData.notes.trim() || null,
    };

    let error;

    if (jobData.applicationId) {
      // Update existing application
      const { error: updateError } = await supabase
        .from("applications")
        .update(appData)
        .eq("id", jobData.applicationId)
        .eq("user_id", user.id); // Ensure user can only update their own applications

      error = updateError;
    } else {
      // Create new application
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

  return (
    <>
      {user && (
        <RequireAuth>
          <NavBar />
          <div className="min-h-screen bg-base-100 p-4 pt-20">
            <div className="max-w-6xl mx-auto">
              {/* User Info Section */}
              <div className="flex justify-center mb-8">
                <div className="max-w-md w-full space-y-6 bg-base-200 p-8 rounded-xl shadow-lg text-center">
                  <h1 className="text-3xl font-bold text-base-content">
                    Welcome to your Dashboard!
                  </h1>
                  <div className="space-y-4">
                    <div>
                      <p className="text-base-content/70 mb-2">
                        You are logged in as:
                      </p>
                      <p className="font-semibold text-primary break-words">
                        {user.email || "No Email (Social Login)"}
                      </p>
                    </div>

                    {user.user_metadata?.full_name && (
                      <div>
                        <p className="text-base-content/70 mb-1">Name:</p>
                        <p className="font-medium text-base-content">
                          {user.user_metadata.full_name}
                        </p>
                      </div>
                    )}

                    {user.id && (
                      <div className="pt-2 border-t border-base-300">
                        <p className="text-sm text-base-content/50">
                          User ID:{" "}
                          <span className="font-mono text-xs break-all">
                            {user.id}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Applications Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-base-content">
                    Your Applications ({applications.length})
                  </h2>
                  <div className="text-sm text-base-content/60">
                    Filters here soon
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
                  /* Job Cards Grid */
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {applications.map((job) => (
                      <AppCard
                        key={job.id}
                        jobObj={job}
                        onEdit={handleEditJob}
                        onDelete={handleDeleteJob}
                      />
                    ))}
                  </div>
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
