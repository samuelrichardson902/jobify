"use client";

import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import RequireAuth from "@/components/RequireAuth";
import NavBar from "@/components/NavBar";

const AnalyticsDashboard = () => {
  const { user } = useSupabaseAuth();

  return (
    <>
      {user && (
        <RequireAuth>
          <NavBar />
          <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-4">
            <div className="max-w-lg w-full space-y-6 bg-base-200 p-8 rounded-lg shadow-xl text-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-base-content">
                  🚧 Under Construction 🚧
                </h1>

                <div className="text-base-content/70">
                  <p className="text-lg">We're building something awesome!</p>
                  <p className="text-sm mt-2">
                    Your analytics dashboard is currently under development.
                    Check back soon for detailed insights about your job
                    applications.
                  </p>
                </div>

                {/* Coming soon features */}
                <div className="mt-8 p-4 bg-base-300 rounded-lg">
                  <h3 className="font-semibold text-base-content mb-3">
                    Coming Soon:
                  </h3>
                  <div className="text-sm text-base-content/70 space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-success">📊</span>
                      <span>Application success rates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-info">📈</span>
                      <span>Response time analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-warning">🎯</span>
                      <span>Location insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-error">📅</span>
                      <span>Application timeline tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RequireAuth>
      )}
    </>
  );
};

export default AnalyticsDashboard;
