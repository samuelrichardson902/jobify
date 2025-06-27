"use client";

import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import RequireAuth from "@/components/RequireAuth";
import NavBar from "@/components/NavBar";
import AddAppBtn from "./AddAppBtn";
import AppCard from "./AppCard";

const Dashboard = () => {
  const { user } = useSupabaseAuth();

  // Sample job applications data
  const sampleJobs = [
    {
      id: 1,
      company: "TechCorp Inc",
      location: "San Francisco, CA",
      salary: "120000",
      hasApplied: true,
      applyBy: null,
      link: "https://techcorp.com/careers/software-engineer",
      notes:
        "Great company culture, remote-friendly. Applied through their website with referral from John.",
    },
    {
      id: 2,
      company: "StartupXYZ",
      location: "Remote",
      salary: "95000",
      hasApplied: false,
      applyBy: "2025-07-15",
      link: "https://startupxyz.com/jobs/frontend-dev",
      notes:
        "Early stage startup, equity opportunity. Need to prepare portfolio showcase.",
    },
    {
      id: 3,
      company: "MegaCorp Solutions",
      location: "New York, NY",
      salary: "140000",
      hasApplied: true,
      applyBy: null,
      link: "https://megacorp.com/careers/senior-developer",
      notes:
        "Large enterprise company. Completed technical interview, waiting for final round.",
    },
    {
      id: 4,
      company: "Innovation Labs",
      location: "Austin, TX",
      salary: "110000",
      hasApplied: false,
      applyBy: "2025-07-08",
      link: "https://innovationlabs.com/openings",
      notes:
        "Cutting-edge AI company. Role focuses on machine learning applications.",
    },
  ];

  return (
    <>
      {user && (
        <RequireAuth>
          <NavBar />
          <div className="min-h-screen bg-base-100 p-4">
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
                    Your Applications ({sampleJobs.length})
                  </h2>
                  <div className="text-sm text-base-content/60">
                    {sampleJobs.filter((job) => job.hasApplied).length} applied
                    • {sampleJobs.filter((job) => !job.hasApplied).length}{" "}
                    pending
                  </div>
                </div>

                {/* Job Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sampleJobs.map((job) => (
                    <AppCard key={job.id} jobObj={job} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <AddAppBtn />
        </RequireAuth>
      )}
    </>
  );
};

export default Dashboard;
