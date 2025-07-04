"use client";

import { useState, useEffect, useRef } from "react";

const mainThemes = ["dark", "light"];

const allThemes = [
  "dark",
  "light",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
];

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const longPressTimer = useRef(null);

  useEffect(() => {
    // Get theme from localStorage or default to 'dark'
    const savedTheme = localStorage.getItem("theme") || "dark";
    setCurrentTheme(savedTheme);
    setIsChecked(savedTheme === "light");
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const changeTheme = (theme) => {
    setCurrentTheme(theme);
    setIsChecked(theme === "light");
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  const handleThemeToggle = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    changeTheme(newTheme);
  };

  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setShowAllThemes(true);
    }, 2000);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <>
      <label
        className="swap swap-rotate cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        {/* this hidden checkbox controls the state */}
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleThemeToggle}
        />

        {/* sun icon */}
        <svg
          className="swap-on h-6 w-6 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
        </svg>

        {/* moon icon */}
        <svg
          className="swap-off h-6 w-6 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
        </svg>
      </label>

      {/* Easter egg: All themes modal (hidden by default) */}
      {showAllThemes && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-20 pt-150 ">
          <div className="bg-base-200 border border-primary rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">🎨 Secret Theme Menu</h3>
              <button
                onClick={() => setShowAllThemes(false)}
                className="btn btn-sm btn-ghost"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {allThemes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    changeTheme(theme);
                    setShowAllThemes(false);
                  }}
                  className={`btn btn-sm ${
                    currentTheme === theme ? "btn-primary" : "btn-outline"
                  }`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm text-base-content/70">
              💡 Tip: Hold down the theme switch for 2 seconds to access this
              menu again!
            </div>
          </div>
        </div>
      )}
    </>
  );
}
