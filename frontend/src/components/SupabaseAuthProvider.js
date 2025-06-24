"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

const SupabaseAuthContext = createContext(null);

export const SupabaseAuthProvider = ({ children }) => {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (sessionError || userError) {
        console.info(
          "Error fetching session or user:",
          sessionError || userError
        );
      }
      setSession(session);
      setUser(user);
      setLoading(false);

      const currentPath = window.location.pathname;

      if (session && user) {
        // if logged in and on the auth page, redirect to dashboard
        if (currentPath === "/auth") {
          router.replace("/dashboard");
        }
      } else {
        // if not logged in and on dashboard or protected route, redirect to auth
        if (currentPath === "/dashboard") {
          router.replace("/auth");
        }
      }
    };

    getSessionAndUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);

        if (event === "SIGNED_IN" && currentSession) {
          router.replace("/dashboard");
        } else if (event === "SIGNED_OUT") {
          router.replace("/auth");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // provide session, user, and loading state to children
  const value = {
    session,
    user,
    loading,
    supabase,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {loading ? (
        // Show a loading indicator while auth is being checked
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "24px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Loading authentication...
        </div>
      ) : (
        children
      )}
    </SupabaseAuthContext.Provider>
  );
};

// Custom hook to consume the auth context
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error(
      "useSupabaseAuth must be used within a SupabaseAuthProvider"
    );
  }
  return context;
};
