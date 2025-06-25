import React from "react";

const AuthTabs = ({ tab, setTab }) => (
  // Added `tabs` class for better semantic integration with daisyUI
  <div role="tablist" className="tabs relative mb-4 grid grid-cols-2">
    {/* Animated background/indicator */}
    <div
      className="absolute top-0 left-0 h-full w-1/2 transition-transform duration-300 z-0"
      style={{
        // The transform logic remains the same
        transform: tab === "signup" ? "translateX(100%)" : "translateX(0%)",
      }}
    >
      {/* The visible animated element with a softer rounding and shadow */}
      <div className="h-full w-full bg-primary rounded-lg shadow-md"></div>
    </div>

    {/* Login Tab */}
    <a
      role="tab"
      // Using `tab` class and refined hover/active states
      className={`tab relative z-10 text-lg font-semibold rounded-t-lg transition-colors duration-300 ${
        tab === "login"
          ? "text-primary-content" // Active tab text color
          : "text-base-content hover:text-primary" // Inactive tab with a subtle hover
      }`}
      onClick={() => setTab("login")}
    >
      Login
    </a>

    {/* Sign Up Tab */}
    <a
      role="tab"
      className={`tab relative z-10 text-lg font-semibold rounded-t-lg transition-colors duration-300 ${
        tab === "signup"
          ? "text-primary-content" // Active tab text color
          : "text-base-content hover:text-primary" // Inactive tab with a subtle hover
      }`}
      onClick={() => setTab("signup")}
    >
      Sign Up
    </a>
  </div>
);

export default AuthTabs;
