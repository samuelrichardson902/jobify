"use client";

import { useEffect } from "react";
import { useSupabaseAuth } from "../../components/SupabaseAuthProvider";

const Dashboard = () => {
  const { supabase, user, loading: authLoading, session } = useSupabaseAuth();

  useEffect(() => {
    if (!authLoading && !session) {
      console.log(
        "No session found in Dashboard, redirection handled by layout."
      );
    }
  }, [authLoading, session]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      console.log("Logged out successfully. Redirecting...");
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 font-inter">
        <p className="text-xl text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  //failsafe: it wont display dashboard content without a user.
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Access Denied
          </h1>
          <p className="text-gray-700">
            You need to be logged in to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Welcome to your Dashboard!
        </h1>
        {user && (
          <div className="mt-4 text-gray-700">
            <p>You are logged in as:</p>
            <p className="font-semibold text-indigo-600 break-words">
              {user.email || "No Email (Social Login)"}
            </p>
            {user.id && (
              <p className="text-sm text-gray-500 mt-2">
                User ID: <span className="font-mono text-xs">{user.id}</span>
              </p>
            )}
            {user.user_metadata?.full_name && (
              <p>Name: {user.user_metadata.full_name}</p>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="mt-8 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          disabled={authLoading}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
