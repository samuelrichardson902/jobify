"use client";

import { useEffect } from "react";
import { useSupabaseAuth } from "../components/SupabaseAuthProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, session, loading } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (session) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth");
    }
  }, [session, loading, router]);

  // page determines users auth status and redirects
  return null;
}
