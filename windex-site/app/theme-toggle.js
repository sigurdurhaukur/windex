"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ isDarkMode, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} title="Toggle dark mode">
      {isDarkMode ? "☀️" : "🌙"}
      <style jsx>{`
        .theme-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${isDarkMode ? "#333" : "#ddd"};
          border: 2px solid ${isDarkMode ? "#555" : "#999"};
          cursor: pointer;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .theme-toggle:hover {
          background: ${isDarkMode ? "#444" : "#ccc"};
          transform: scale(1.1);
        }

        .theme-toggle:active {
          transform: scale(0.95);
        }
      `}</style>
    </button>
  );
}
