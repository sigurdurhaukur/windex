"use client";

import { useState, useEffect } from "react";

export default function Header({ data }) {
  const [selectedStation, setSelectedStation] = useState(1);

  if (!data) return <header>Loading...</header>;

  const _data = Object.values(data.data);
  const cloud_data = _data[0];
  const weather_stations = _data.slice(1, -1);
  const station_keys = Object.keys(data.data).slice(1, -1);
  const snow_tam = _data[-1];

  return (
    <header>
      <div>
        {/* drop down for weather_stations */}
        <label htmlFor="weather_stations">Weather Stations:</label>
        <select
          name="weather_stations"
          id="weather_stations"
          onChange={(e) => setSelectedStation(e.target.value)}
        >
          {station_keys.map((key, index) => (
            <option key={index} value={index}>
              {key}
            </option>
          ))}
        </select>
        {weather_stations[selectedStation] && (
          <>
            <p>
              Wind direction{" "}
              {weather_stations[selectedStation].windDirection.value}
              {weather_stations[selectedStation].windDirection.unit}
            </p>
            <p>
              Wind speed {weather_stations[selectedStation].windSpeed.value}
              {weather_stations[selectedStation].windSpeed.unit}
            </p>
          </>
        )}
      </div>
    </header>
  );
}
