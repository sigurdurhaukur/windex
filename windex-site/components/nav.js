"use client";
import Link from "next/link";
import Img from "next/image";
import { useState, useEffect } from "react";

export default function Nav() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setIsDarkMode(saved === "dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.style.colorScheme = "light";
    }
    // Dispatch custom event for other components to sync
    window.dispatchEvent(new CustomEvent("themechange", { detail: { isDarkMode } }));
  }, [isDarkMode]);

  return (
    <nav>
      <ul>
        <li>
          <Link href="/" className="logo">
            <span>Weather Wane 🐓</span>
          </Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <button
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle dark mode"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </li>
      </ul>
    </nav>
  );
}
