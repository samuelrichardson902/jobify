import React from "react";

const AuthTabs = ({ tab, handleTabChange }) => (
  <div role="tablist" className="tabs relative mb-4 grid grid-cols-2">
    {/* Animated background/indicator */}
    <div
      className="absolute top-0 left-0 h-full w-1/2 transition-transform duration-300 z-0"
      style={{
        transform: tab === "signup" ? "translateX(100%)" : "translateX(0%)",
      }}
    >
      {/* The visible animated element with a softer rounding and shadow */}
      <div className="h-full w-full bg-primary rounded-lg shadow-md"></div>
    </div>

    {/* Login Tab */}
    <a
      role="tab"
      className={`tab relative z-10 text-md font-semibold rounded-t-lg transition-colors duration-300 ${
        tab === "login"
          ? "" // Remove text-primary-content, force with style
          : "text-base-content hover:text-primary"
      }`}
      style={tab === "login" ? { color: "white" } : {}}
      onClick={() => handleTabChange("login")}
    >
      Login
    </a>

    {/* Sign Up Tab */}
    <a
      role="tab"
      className={`tab relative z-10 text-md font-semibold rounded-t-lg transition-colors duration-300 ${
        tab === "signup"
          ? "" // Remove text-primary-content, force with style
          : "text-base-content hover:text-primary"
      }`}
      style={tab === "signup" ? { color: "white" } : {}}
      onClick={() => handleTabChange("signup")}
    >
      Sign Up
    </a>
  </div>
);

export default AuthTabs;
