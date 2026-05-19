"use client";

import { useState, useEffect } from "react";

export default function Header({ data, isDarkMode, selectedStation, onStationChange }) {
  if (!data) return <header>Loading...</header>;

  const _data = Object.values(data.data);
  const cloud_data = _data[0];
  const weather_stations = _data.slice(1, -1);
  const station_keys = Object.keys(data.data).slice(1, -1);
  const snow_tam = _data[-1];

  return (
    <header className="header-main">
      <div className="station-selector">
        <label htmlFor="weather_stations">Weather Station:</label>
        <select
          name="weather_stations"
          id="weather_stations"
          value={selectedStation}
          onChange={(e) => onStationChange(parseInt(e.target.value))}
        >
          {station_keys.map((key, index) => (
            <option key={index} value={index}>
              {key}
            </option>
          ))}
        </select>
        {weather_stations[selectedStation] && (
          <div className="station-data">
            {weather_stations[selectedStation].windDirection && (
              <p>
                Wind direction{" "}
                {weather_stations[selectedStation].windDirection.value}
                {weather_stations[selectedStation].windDirection.unit}
              </p>
            )}
            {weather_stations[selectedStation].windSpeed && (
              <p>
                Wind speed {weather_stations[selectedStation].windSpeed.value}
                {weather_stations[selectedStation].windSpeed.unit}
              </p>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .header-main {
          background: ${isDarkMode ? "#1a1a1a" : "#fff"};
          border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .station-selector {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        label {
          font-weight: 600;
          color: ${isDarkMode ? "#fff" : "#1a1a1a"};
        }

        select {
          padding: 8px 12px;
          background: ${isDarkMode ? "#000" : "#f5f5f5"};
          color: ${isDarkMode ? "#fff" : "#1a1a1a"};
          border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        }

        select:hover {
          border-color: ${isDarkMode ? "#555" : "#999"};
        }

        select:focus {
          outline: none;
          border-color: ${isDarkMode ? "#fff" : "#1a1a1a"};
        }

        .station-data {
          flex: 1;
          display: flex;
          gap: 24px;
          min-width: 300px;
        }

        .station-data p {
          margin: 0;
          color: ${isDarkMode ? "#ddd" : "#333"};
          font-size: 14px;
        }
      `}</style>
    </header>
  );
}
