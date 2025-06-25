import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiSettings } from "react-icons/fi";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";

const pages = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Analytics", path: "/analytics" },
];

export default function NavBar() {
  const router = useRouter();

  const currentPath = usePathname();

  const { supabase } = useSupabaseAuth();
  const [show, setShow] = useState(true);
  const lastScroll = useRef(0);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      console.log("Logged out successfully. Redirecting...");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll <= 0) {
        setShow(true);
        lastScroll.current = 0;
        return;
      }
      if (currentScroll < lastScroll.current) {
        setShow(true); // Scrolling up
      } else {
        setShow(false); // Scrolling down
      }
      lastScroll.current = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`navbar bg-base-200 shadow-md px-4 fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Left tabs */}
      <div className="flex-1">
        <div className="tabs">
          {pages.map((page) => {
            const isActive = currentPath === page.path;
            return (
              <button
                key={page.path}
                className={`tab ${
                  isActive
                    ? "tab-active !text-white" // CHANGED: Active tab is now pure white
                    : "!text-gray-400" // Inactive tab is your light grey theme color
                }`}
                onClick={() => router.push(page.path)}
              >
                {page.name}
              </button>
            );
          })}
        </div>
      </div>
      {/* Right tabs */}
      <div className="flex items-center gap-2">
        <button
          className="btn bg-error rounded-lg text-white"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
