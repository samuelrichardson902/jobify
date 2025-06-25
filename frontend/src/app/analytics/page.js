"use client";

import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import RequireAuth from "@/components/RequireAuth";
import NavBar from "@/components/NavBar";

const Dashboard = () => {
  const { user } = useSupabaseAuth();

  return (
    <>
      {user && (
        <RequireAuth>
          <NavBar />
          <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl text-center">
              <h1 className="text-3xl font-extrabold text-gray-900">
                Welcome to your Analytics!
              </h1>
              {user && (
                <div className="mt-4 text-gray-700">
                  <p>You are logged in as:</p>
                  <p className="font-semibold text-indigo-600 break-words">
                    {user.email || "No Email (Social Login)"}
                  </p>
                  {user.id && (
                    <p className="text-sm text-gray-500 mt-2">
                      User ID:{" "}
                      <span className="font-mono text-xs">{user.id}</span>
                    </p>
                  )}
                  {user.user_metadata?.full_name && (
                    <p>Name: {user.user_metadata.full_name}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </RequireAuth>
      )}
    </>
  );
};

export default Dashboard;
