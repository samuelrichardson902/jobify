import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import ThemeSwitcher from "./ThemeSwitcher";

const pages = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Analytics", path: "/analytics" },
];

export default function NavBar() {
  const router = useRouter();
  const currentPath = usePathname();
  const { supabase, user } = useSupabaseAuth();
  const [show, setShow] = useState(true);
  const lastScroll = useRef(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      console.log("Logged out successfully. Redirecting...");
    }
  };

  // Account deletion handler
  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteAccountError("");
    try {
      // Get the current session and access token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Not authenticated");
      // Call API route to delete user (secure)
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");
      // Sign out user after deletion
      await supabase.auth.signOut();
      router.replace("/auth");
    } catch (err) {
      setDeleteAccountError(err.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
      setShowDeleteAccountModal(false);
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <>
      <div
        className={`navbar bg-base-200 shadow-md px-4 fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
          show ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Left tabs */}
        <div className="flex-1 flex items-center">
          {/* Logo */}
          <button
            className="mr-4 p-0 bg-transparent border-none hover:bg-transparent focus:outline-none"
            onClick={() => router.push("/dashboard")}
            aria-label="Home"
          >
            <img src="/jobify_logo.png" alt="Logo" className="h-8" />
          </button>
          <div className="tabs">
            {pages.map((page) => {
              const isActive = currentPath === page.path;
              return (
                <button
                  key={page.path}
                  className={`tab ${isActive ? "tab-active" : ""}`}
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
          <ThemeSwitcher />
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                className="btn btn-ghost btn-circle"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-label="Settings"
              >
                {/* Gear icon */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="primary-content"
                  stroke="currentColor"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M12.9046 3.06005C12.6988 3 12.4659 3 12 3C11.5341 3 11.3012 3 11.0954 3.06005C10.7942 3.14794 10.5281 3.32808 10.3346 3.57511C10.2024 3.74388 10.1159 3.96016 9.94291 4.39272C9.69419 5.01452 9.00393 5.33471 8.36857 5.123L7.79779 4.93281C7.3929 4.79785 7.19045 4.73036 6.99196 4.7188C6.70039 4.70181 6.4102 4.77032 6.15701 4.9159C5.98465 5.01501 5.83376 5.16591 5.53197 5.4677C5.21122 5.78845 5.05084 5.94882 4.94896 6.13189C4.79927 6.40084 4.73595 6.70934 4.76759 7.01551C4.78912 7.2239 4.87335 7.43449 5.04182 7.85566C5.30565 8.51523 5.05184 9.26878 4.44272 9.63433L4.16521 9.80087C3.74031 10.0558 3.52786 10.1833 3.37354 10.3588C3.23698 10.5141 3.13401 10.696 3.07109 10.893C3 11.1156 3 11.3658 3 11.8663C3 12.4589 3 12.7551 3.09462 13.0088C3.17823 13.2329 3.31422 13.4337 3.49124 13.5946C3.69158 13.7766 3.96395 13.8856 4.50866 14.1035C5.06534 14.3261 5.35196 14.9441 5.16236 15.5129L4.94721 16.1584C4.79819 16.6054 4.72367 16.829 4.7169 17.0486C4.70875 17.3127 4.77049 17.5742 4.89587 17.8067C5.00015 18.0002 5.16678 18.1668 5.5 18.5C5.83323 18.8332 5.99985 18.9998 6.19325 19.1041C6.4258 19.2295 6.68733 19.2913 6.9514 19.2831C7.17102 19.2763 7.39456 19.2018 7.84164 19.0528L8.36862 18.8771C9.00393 18.6654 9.6942 18.9855 9.94291 19.6073C10.1159 20.0398 10.2024 20.2561 10.3346 20.4249C10.5281 20.6719 10.7942 20.8521 11.0954 20.94C11.3012 21 11.5341 21 12 21C12.4659 21 12.6988 21 12.9046 20.94C13.2058 20.8521 13.4719 20.6719 13.6654 20.4249C13.7976 20.2561 13.8841 20.0398 14.0571 19.6073C14.3058 18.9855 14.9961 18.6654 15.6313 18.8773L16.1579 19.0529C16.605 19.2019 16.8286 19.2764 17.0482 19.2832C17.3123 19.2913 17.5738 19.2296 17.8063 19.1042C17.9997 18.9999 18.1664 18.8333 18.4996 18.5001C18.8328 18.1669 18.9994 18.0002 19.1037 17.8068C19.2291 17.5743 19.2908 17.3127 19.2827 17.0487C19.2759 16.8291 19.2014 16.6055 19.0524 16.1584L18.8374 15.5134C18.6477 14.9444 18.9344 14.3262 19.4913 14.1035C20.036 13.8856 20.3084 13.7766 20.5088 13.5946C20.6858 13.4337 20.8218 13.2329 20.9054 13.0088C21 12.7551 21 12.4589 21 11.8663C21 11.3658 21 11.1156 20.9289 10.893C20.866 10.696 20.763 10.5141 20.6265 10.3588C20.4721 10.1833 20.2597 10.0558 19.8348 9.80087L19.5569 9.63416C18.9478 9.26867 18.6939 8.51514 18.9578 7.85558C19.1262 7.43443 19.2105 7.22383 19.232 7.01543C19.2636 6.70926 19.2003 6.40077 19.0506 6.13181C18.9487 5.94875 18.7884 5.78837 18.4676 5.46762C18.1658 5.16584 18.0149 5.01494 17.8426 4.91583C17.5894 4.77024 17.2992 4.70174 17.0076 4.71872C16.8091 4.73029 16.6067 4.79777 16.2018 4.93273L15.6314 5.12287C14.9961 5.33464 14.3058 5.0145 14.0571 4.39272C13.8841 3.96016 13.7976 3.74388 13.6654 3.57511C13.4719 3.32808 13.2058 3.14794 12.9046 3.06005Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                  </g>
                </svg>
              </button>
              {dropdownOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-base-100 rounded shadow z-10 border border-base-300 menu p-2">
                  <li>
                    <button onClick={handleLogout} className="w-full text-left">
                      Logout
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowDeleteAccountModal(true);
                      }}
                      className="w-full text-left text-error"
                    >
                      Delete Account
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 text-error">
              Delete Account
            </h3>
            <p className="mb-4">
              Are you sure you want to delete your account? This action cannot
              be undone and all your data will be permanently removed.
            </p>
            {deleteAccountError && (
              <div className="alert alert-error mb-2">
                <span>{deleteAccountError}</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteAccountModal(false)}
                disabled={deletingAccount}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
