"use client";

import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import { supabase } from "@/lib/supabase";
import RequireAuth from "@/components/RequireAuth";
import NavBar from "@/components/NavBar";
import { AnalyticsDashboard } from "@/components/analytics";

const AnalyticsPage = () => {
  const { user } = useSupabaseAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

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
                      }'s Analytics`
                    : "Welcome to your Analytics!"}
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

              {/* Analytics Dashboard */}
              <AnalyticsDashboard
                applications={applications}
                loading={loading}
              />
            </div>
          </div>
        </RequireAuth>
      )}
    </>
  );
};

export default AnalyticsPage;
