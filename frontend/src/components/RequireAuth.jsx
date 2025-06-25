"use client";
import { useEffect } from "react";
import { useSupabaseAuth } from "./SupabaseAuthProvider";

export default function RequireAuth({ children }) {
  const { user, loading, session } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !session) {
      console.log(
        "No session found in Dashboard, redirection handled by layout."
      );
    }
  }, [loading, session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-100">
        <p className="text-xl text-white">Loading...</p>
      </div>
    );
  }

  if (!user || !session) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-100">
        <p className="text-xl text-white">Access Denied</p>
        <p className="text-white">
          You need to be logged in to view this page.
        </p>
      </div>
    );
  }

  return children;
}
