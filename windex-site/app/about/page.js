"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function About() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setIsDarkMode(saved === "dark");
    }

    const handleThemeChange = (e) => {
      setIsDarkMode(e.detail.isDarkMode);
    };

    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

  return (
    <main className={`about-container ${isDarkMode ? "dark" : "light"}`}>
      <div className="about-content">
        <h1>About Weather Wane</h1>

        <section className="about-section">
          <h2>What is Weather Wane?</h2>
          <p>
            Weather Wane is a specialized weather monitoring application designed for sailors, windsurfers, kitesurfers, and maritime enthusiasts.
            It provides real-time and historical weather data collected directly from Reykjavík Airport (BIRK) in Iceland.
          </p>
          <p>
            The app focuses on wind conditions, pressure trends, and sea state information—critical factors for sailing conditions,
            maritime navigation, and windsports.
          </p>
        </section>

        <section className="about-section">
          <h2>Data Sources</h2>
          <p>
            Data is collected from multiple weather sensors located at BIRK (Reykjavík Airport, Iceland):
          </p>
          <ul>
            <li><strong>Runway Sensor Arrays</strong> — Wind speed and direction from four runway threshold locations</li>
            <li><strong>Temperature & Pressure</strong> — Air temperature and QNH (barometric) pressure</li>
            <li><strong>Sea Level</strong> — Real-time measurements from Harpan Harbour (Reykjavík Old Harbour)</li>
          </ul>
          <p>
            Data is updated every 30 seconds and stored for historical analysis. All measurements use standard meteorological units
            (knots for wind speed, degrees for direction, Celsius for temperature, hPa for pressure).
          </p>
        </section>

        <section className="about-section">
          <h2>Understanding the Visualizations</h2>
          <ul className="feature-list">
            <li>
              <strong>Wind Speed</strong> — Shows average wind speed over time with gust (max) and lull (min) bands.
              Wider bands indicate more variable, gusty conditions.
            </li>
            <li>
              <strong>Wind Chill</strong> — Combines air temperature and wind speed to show how cold it actually feels on exposed skin.
            </li>
            <li>
              <strong>Wind Direction</strong> — Displays wind direction in degrees (0°/360° = North, 90° = East, 180° = South, 270° = West).
              Useful for spotting shifts and backing/veering patterns.
            </li>
            <li>
              <strong>Wind Rose</strong> — A compass plot showing the frequency of wind from each direction and average speed per sector.
            </li>
            <li>
              <strong>Wind Map</strong> — Geographic visualization of wind patterns across the airport&apos;s runway systems.
            </li>
            <li>
              <strong>Pressure Trend</strong> — QNH (barometric) pressure indicates incoming weather. A sustained drop signals deteriorating conditions;
              a rise indicates improvement. Even 3–5 hPa changes over hours are meaningful.
            </li>
            <li>
              <strong>Sea Level</strong> — Real-time measurements at Harpan Harbour showing harbor water height relative to the reference point.
            </li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Time Range Controls</h2>
          <p>
            Use the slider or preset buttons to view data from the last 6 hours, 24 hours, 3 days, or 7 days.
            The app automatically adjusts the chart resolution to show the most relevant details for each time window.
          </p>
        </section>

        <section className="about-section">
          <h2>Who Should Use This?</h2>
          <ul className="feature-list">
            <li><strong>Sailors & Sailors</strong> — Monitor real-time wind conditions for sailing and racing</li>
            <li><strong>Windsports Enthusiasts</strong> — Windsurfers and kitesurfers planning sessions</li>
            <li><strong>Mariners</strong> — Track wind and sea state for safe navigation</li>
            <li><strong>Weather Enthusiasts</strong> — Analyze detailed weather trends and patterns</li>
            <li><strong>Pilots & Aircrew</strong> — Reference for conditions at BIRK</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Features</h2>
          <ul className="feature-list">
            <li>Live data updated every 30 seconds</li>
            <li>Dark mode for reduced eye strain</li>
            <li>Interactive charts with customizable time ranges</li>
            <li>Multi-sensor wind data from runway locations</li>
            <li>Historical data storage and analysis</li>
            <li>Wind rose and directional analysis</li>
            <li>Pressure trend tracking</li>
            <li>Sea level monitoring</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Getting Started</h2>
          <p>
            Head to the <Link href="/">main page</Link> to start exploring live weather data.
            Use the time slider to examine historical trends, or focus on the current conditions with the latest data point.
          </p>
        </section>

        <section className="about-section faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-item">
            <h4>Why only BIRK?</h4>
            <p>BIRK (Reykjavík Airport) has comprehensive weather infrastructure and is strategically located for monitoring Reykjavík&apos;s sailing and maritime conditions. Future versions may expand to other locations.</p>
          </div>
          <div className="faq-item">
            <h4>Is this official BIRK data?</h4>
            <p>This app displays data collected from sensors at BIRK. For official weather reports, consult the Icelandic Meteorological Office.</p>
          </div>
          <div className="faq-item">
            <h4>How accurate is the wind data?</h4>
            <p>Data is sourced directly from BIRK&apos;s automated weather station equipment. Accuracy depends on sensor maintenance and calibration. For mission-critical decisions, always consult official sources.</p>
          </div>
          <div className="faq-item">
            <h4>Can I download the data?</h4>
            <p>Currently, the app displays data in-browser. Contact for information on data export options.</p>
          </div>
        </section>

        <section className="about-section">
          <h2>Contact</h2>
          <p>
            Have questions or feedback? Reach out to <a href="mailto:contact@sigurdurhaukur.com">contact@sigurdurhaukur.com</a>
          </p>
        </section>

        <section className="about-section">
          <h2>Disclaimer</h2>
          <p>
            Weather Wane is provided as-is for informational purposes. While we strive for accuracy,
            we make no guarantees about data completeness or real-time availability. Do not rely solely on this app
            for safety-critical decisions. Always consult official aviation, maritime, and meteorological sources before making important decisions.
          </p>
        </section>
      </div>

      <style jsx>{`
        main.about-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        main.about-container.dark {
          background: #000;
          color: #fff;
        }

        main.about-container.light {
          background: #f5f5f5;
          color: #1a1a1a;
        }

        .about-content {
          background: ${isDarkMode ? "#1a1a1a" : "#fff"};
          border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          border-radius: 8px;
          padding: 40px;
          line-height: 1.8;
        }

        h1 {
          font-size: 32px;
          margin: 0 0 32px 0;
          border-bottom: 2px solid ${isDarkMode ? "#333" : "#ddd"};
          padding-bottom: 16px;
        }

        .about-section {
          margin-bottom: 40px;
        }

        .about-section h2 {
          font-size: 20px;
          margin: 0 0 16px 0;
          color: ${isDarkMode ? "#e0e0e0" : "#333"};
        }

        .about-section h4 {
          font-size: 15px;
          margin: 12px 0 6px 0;
          color: ${isDarkMode ? "#e0e0e0" : "#333"};
        }

        p {
          margin: 0 0 12px 0;
          color: ${isDarkMode ? "#ccc" : "#555"};
        }

        ul {
          margin: 12px 0 12px 20px;
          padding: 0;
        }

        li {
          margin: 8px 0;
          color: ${isDarkMode ? "#ccc" : "#555"};
        }

        .feature-list li {
          margin: 10px 0;
        }

        a {
          color: ${isDarkMode ? "#4da6ff" : "#0066cc"};
          text-decoration: none;
          border-bottom: 1px solid ${isDarkMode ? "#4da6ff" : "#0066cc"};
        }

        a:hover {
          opacity: 0.8;
        }

        .faq {
          background: ${isDarkMode ? "#0a0a0a" : "#f9f9f9"};
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid ${isDarkMode ? "#444" : "#ddd"};
        }

        .faq-item {
          margin-bottom: 16px;
        }

        .faq-item:last-child {
          margin-bottom: 0;
        }

        .faq-item p {
          color: ${isDarkMode ? "#aaa" : "#666"};
          font-size: 14px;
        }
      `}</style>
    </main>
  );
}
