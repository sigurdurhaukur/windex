"use client";
import { getData, getHistoricData, getAllSensorData, getSeaLevel } from "./api";
import { useState, useEffect } from "react";
import Header from "./header";
import formatTimestamp from "./utils";
import dynamic from "next/dynamic";
import Plot from "./plot";
import WindRose from "./wind-rose";

const WindMap = dynamic(() => import("./wind-map"), { ssr: false });

const SENSORS = ["rwyTdz01", "rwyTdz13", "rwyTdz19", "rwyTdz31"];

export default function Home() {
  const [historicData, setHistoricData] = useState({
    windDirection: [],
    airTemperature: [],
    windSpeed: [],
    airPressure: [],
    seaLevel: [],
    sensorData: {}, // per-sensor data structure
  });
  const [allData, setAllData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoursToShow, setHoursToShow] = useState(24);
  const [selectedStation, setSelectedStation] = useState(0);

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

  async function fetchLiveData() {
    try {
      const data = await getData();
      console.log("[fetchLiveData] Received data:", data?.timestamp);
      if (!data?.data?.rwyTdz31?.windDirection) {
        console.error("[fetchLiveData] Error parsing data from server", data);
        return;
      }

      const allSensorData = await getAllSensorData();
      console.log("[fetchLiveData] Received sensor data:", Object.keys(allSensorData).length, "sensors");
      const seaLevelData = await getSeaLevel();
      console.log("[fetchLiveData] Received sea level data:", seaLevelData?.Sjavarhaed);

      // Extract data from all sensors for time series
      const wd = {
        timestamp: data.data.rwyTdz31.windDirection.timestamp,
        windDirection: data.data.rwyTdz31.windDirection.value,
      };
      const at = {
        timestamp: data.data.rwyTdz01.tempAir?.timestamp || data.timestamp,
        airTemperature: data.data.rwyTdz01.tempAir?.value,
      };
      const ws = {
        timestamp: data.data.rwyTdz31.windSpeed.timestamp,
        windSpeed: data.data.rwyTdz31.windSpeed.value,
      };
      const ap = {
        timestamp: data.data.rwyTdz31.qnh.timestamp,
        airPressure: data.data.rwyTdz31.qnh.value,
      };
      const sl = seaLevelData ? {
        timestamp: Math.floor(Date.now() / 1000),
        seaLevel: seaLevelData.Sjavarhaed,
      } : null;

      setAllData(data);
      console.log("[fetchLiveData] Data set to state");
      setHistoricData((prev) => {
        const append = (arr, point, key) => {
          const last = arr[arr.length - 1];
          if (last && last.timestamp === point.timestamp && last[key] === point[key]) {
            return arr;
          }
          return [...arr, point];
        };

        // Update sensor-specific data
        const newSensorData = { ...prev.sensorData };
        SENSORS.forEach((sensor) => {
          if (!newSensorData[sensor]) {
            newSensorData[sensor] = { windDirection: [], windSpeed: [] };
          }
          if (allSensorData[sensor]) {
            const sensorWd = {
              timestamp: allSensorData[sensor].timestamp,
              windDirection: allSensorData[sensor].windDirection,
            };
            const sensorWs = {
              timestamp: allSensorData[sensor].timestamp,
              windSpeed: allSensorData[sensor].windSpeed,
            };
            newSensorData[sensor].windDirection = append(
              newSensorData[sensor].windDirection,
              sensorWd,
              "windDirection"
            );
            newSensorData[sensor].windSpeed = append(
              newSensorData[sensor].windSpeed,
              sensorWs,
              "windSpeed"
            );
          }
        });

        return {
          windDirection: append(prev.windDirection, wd, "windDirection"),
          airTemperature: append(prev.airTemperature, at, "airTemperature"),
          windSpeed: append(prev.windSpeed, ws, "windSpeed"),
          airPressure: append(prev.airPressure, ap, "airPressure"),
          seaLevel: sl ? append(prev.seaLevel, sl, "seaLevel") : prev.seaLevel,
          sensorData: newSensorData,
        };
      });
    } catch (error) {
      console.error("[fetchLiveData] Error:", error?.message || error);
    }
  }

  async function fetchHistoricData() {
    try {
      const data = await getHistoricData();
      // Migrate legacy flat-array format (windDirection only) to per-series shape
      if (Array.isArray(data)) {
        setHistoricData({
          windDirection: data,
          airTemperature: [],
          windSpeed: [],
          airPressure: [],
          seaLevel: [],
          sensorData: {},
        });
      } else {
        setHistoricData({
          windDirection: data.windDirection || [],
          airTemperature: data.airTemperature || [],
          windSpeed: data.windSpeed || [],
          airPressure: data.airPressure || [],
          seaLevel: data.seaLevel || [],
          sensorData: data.sensorData || {},
        });
      }
    } catch (error) {
      console.error("Error fetching historic data:", error);
    }
  }

  useEffect(() => {
    // Load historic data and set interval for live data fetching
    fetchHistoricData();
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  function calculateDataPointsFromHours(data, hours) {
    if (!data || data.length < 2) return Math.max(10, Math.ceil(hours * 120));

    const timespan = data[data.length - 1].timestamp - data[0].timestamp;
    const avgInterval = timespan / (data.length - 1);
    const secondsNeeded = hours * 3600;
    return Math.max(10, Math.ceil(secondsNeeded / avgInterval));
  }

  function rollingMinMax(data, windowSize = 24) {
    if (!data?.length) return { minSeries: [], maxSeries: [] };
    const valueKey = Object.keys(data[0]).find((k) => k !== "timestamp");
    const minSeries = [];
    const maxSeries = [];
    for (let i = 0; i < data.length; i++) {
      const window = data.slice(Math.max(0, i - windowSize + 1), i + 1);
      const vals = window.map((p) => p[valueKey]);
      minSeries.push({ timestamp: data[i].timestamp, windSpeedMin: Math.min(...vals) });
      maxSeries.push({ timestamp: data[i].timestamp, windSpeedMax: Math.max(...vals) });
    }
    return { minSeries, maxSeries };
  }

  function calculateWindChill(tempPoints, speedPoints) {
    if (!tempPoints?.length || !speedPoints?.length) return [];
    return speedPoints.map((sp) => {
      const nearest = tempPoints.reduce((prev, curr) =>
        Math.abs(curr.timestamp - sp.timestamp) < Math.abs(prev.timestamp - sp.timestamp) ? curr : prev
      );
      const T = nearest.airTemperature;
      const V = sp.windSpeed * 1.852;
      if (V < 4.8 || T > 10) return { timestamp: sp.timestamp, windChill: parseFloat(T.toFixed(1)) };
      const wc = 13.12 + 0.6215 * T - 11.37 * Math.pow(V, 0.16) + 0.3965 * T * Math.pow(V, 0.16);
      return { timestamp: sp.timestamp, windChill: parseFloat(wc.toFixed(1)) };
    });
  }

  // Get the selected sensor's data
  const selectedSensor = SENSORS[selectedStation];
  const selectedSensorData = historicData.sensorData[selectedSensor] || { windDirection: [], windSpeed: [] };

  // Get station name from allData
  let stationName = selectedSensor;
  if (allData && allData.data) {
    const stationKeys = Object.keys(allData.data).slice(1, -1);
    if (stationKeys[selectedStation]) {
      stationName = stationKeys[selectedStation];
    }
  }

  const windDirPoints = calculateDataPointsFromHours(historicData.windDirection, hoursToShow);
  const tempPoints = calculateDataPointsFromHours(historicData.airTemperature, hoursToShow);
  const windSpeedPoints = calculateDataPointsFromHours(selectedSensorData.windSpeed, hoursToShow);
  const pressurePoints = calculateDataPointsFromHours(historicData.airPressure, hoursToShow);
  const seaLevelPoints = calculateDataPointsFromHours(historicData.seaLevel, hoursToShow);

  const { minSeries, maxSeries } = rollingMinMax(selectedSensorData.windSpeed);
  const windChillData = calculateWindChill(historicData.airTemperature, selectedSensorData.windSpeed);

  function renderPlots() {
    return (
      <>
        <Plot
          data={selectedSensorData.windSpeed}
          minData={minSeries}
          maxData={maxSeries}
          isDarkMode={isDarkMode}
          dataPointsToShow={windSpeedPoints}
          description="Average wind speed over time. Dashed lines show the 2-minute gust (max) and lull (min) — the wider the band, the more variable the conditions."
          options={{
            label: "Wind speed (avg)",
            title: `Wind speed — ${stationName}`,
            xLabel: "Time",
            yLabel: "Wind speed (kt)",
            color: "rgba(0, 200, 100, 1)",
            rgba: "rgba(0, 200, 100, 0.2)",
          }}
        />
        <Plot
          data={selectedSensorData.windDirection}
          isDarkMode={isDarkMode}
          dataPointsToShow={windDirPoints}
          description="Wind direction deviation from rolling mean (center). Y-axis shows degrees off the recent wind direction. Rolling mean (tan dashed line) shows the smoothed direction trend."
          options={{
            label: "Wind direction",
            title: `Wind direction — ${stationName}`,
            xLabel: "Time",
            yLabel: "Direction (°)",
            range: { min: 0, max: 360 },
            color: "rgba(0, 120, 255, 1)",
            rgba: "rgba(0, 120, 255, 0.2)",
          }}
        />
        <Plot
          data={windChillData}
          isDarkMode={isDarkMode}
          dataPointsToShow={windSpeedPoints}
          description="How cold it actually feels on exposed skin, combining air temperature and wind speed. Matches air temperature when wind is light or air is above 10°C."
          options={{
            label: "Wind chill",
            title: "Wind chill",
            xLabel: "Time",
            yLabel: "Feels like (°C)",
            color: "rgba(255, 100, 50, 1)",
            rgba: "rgba(255, 100, 50, 0.2)",
          }}
        />
        <Plot
          data={historicData.airPressure}
          isDarkMode={isDarkMode}
          dataPointsToShow={pressurePoints}
          description="Atmospheric pressure (QNH). A sustained drop signals incoming weather; a rise indicates improving conditions. Even a slow 3–5 hPa change over a few hours is meaningful."
          options={{
            label: "QNH pressure",
            title: "Pressure trend",
            xLabel: "Time",
            yLabel: "Pressure (hPa)",
            color: "rgba(120, 80, 255, 1)",
            rgba: "rgba(120, 80, 255, 0.2)",
          }}
        />
        <Plot
          data={historicData.seaLevel}
          isDarkMode={isDarkMode}
          dataPointsToShow={seaLevelPoints}
          description="Sea level height at Harpan harbour (Reykjavík Old Harbour). Measurements are in meters relative to the reference point."
          options={{
            label: "Sea level",
            title: "Sea Level — Harpan Harbour",
            xLabel: "Time",
            yLabel: "Sea level (m)",
            color: "rgba(0, 150, 200, 1)",
            rgba: "rgba(0, 150, 200, 0.2)",
          }}
        />
        <WindMap
          sensorData={historicData.sensorData}
          windDirectionData={historicData.windDirection}
          windSpeedData={historicData.windSpeed}
          isDarkMode={isDarkMode}
          dataPointsToShow={windDirPoints}
        />
        <WindRose
          windDirectionData={historicData.windDirection}
          windSpeedData={historicData.windSpeed}
          isDarkMode={isDarkMode}
          dataPointsToShow={windDirPoints}
          description="Frequency of wind directions over the selected period. Sector size shows how often wind came from that direction; color shows the average speed in that sector."
        />
        <Plot
          data={historicData.airTemperature}
          isDarkMode={isDarkMode}
          dataPointsToShow={tempPoints}
          description="Air temperature at the BIRK runway sensor. Combined with wind chill, gives a complete picture of on-the-water thermal comfort."
          options={{
            label: "Air temperature",
            title: "Air temperature",
            xLabel: "Time",
            yLabel: "Temperature (°C)",
            color: "rgba(255, 60, 60, 1)",
            rgba: "rgba(255, 60, 60, 0.2)",
          }}
        />
      </>
    );
  }

  return (
    <main className={`container ${isDarkMode ? "dark" : "light"}`}>
      <div className="header-section">
        <Header data={allData} isDarkMode={isDarkMode} selectedStation={selectedStation} onStationChange={setSelectedStation} />
      </div>

      <div className="controls-section">
        <div className="controls-header">
          <label htmlFor="hoursSlider">
            Showing last{" "}
            <strong>
              {hoursToShow < 24
                ? `${hoursToShow}h`
                : hoursToShow % 24 === 0
                ? `${hoursToShow / 24}d`
                : `${Math.floor(hoursToShow / 24)}d ${hoursToShow % 24}h`}
            </strong>
          </label>
          <div className="preset-buttons">
            {[{ label: "6h", hours: 6 }, { label: "24h", hours: 24 }, { label: "3d", hours: 72 }, { label: "7d", hours: 168 }].map(({ label, hours }) => (
              <button
                key={hours}
                className={`preset-btn ${hoursToShow === hours ? "active" : ""}`}
                onClick={() => setHoursToShow(hours)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <input
          id="hoursSlider"
          type="range"
          min="1"
          max="168"
          step="1"
          value={hoursToShow}
          onChange={(e) => setHoursToShow(parseInt(e.target.value))}
          className="slider"
        />
      </div>

      <div className="data-section">
        <div className="section-header">
          <h2>Weather data — BIRK</h2>
          {allData && <p className="timestamp">updated {formatTimestamp(allData.timestamp)}</p>}
        </div>
        {historicData && renderPlots()}
      </div>

      <style jsx>{`
        main.container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        @media (max-width: 767px) {
          main.container {
            max-width: 95%;
          }
        }

        main.container.dark {
          background: #000;
          color: #fff;
        }

        main.container.light {
          background: #f5f5f5;
          color: #1a1a1a;
        }

        .header-section {
          margin-bottom: 32px;
        }

        .logo {
          width: 100%;
          height: 60px;
          background: ${isDarkMode
            ? "linear-gradient(135deg, #fff, #999)"
            : "linear-gradient(135deg, #333, #666)"};
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .controls-section {
          margin: 32px 0;
          padding: 16px;
          background: ${isDarkMode ? "#1a1a1a" : "#fff"};
          border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          border-radius: 8px;
        }

        .controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .controls-section label {
          font-size: 14px;
          font-weight: 500;
        }

        .preset-buttons {
          display: flex;
          gap: 6px;
        }

        .preset-btn {
          padding: 4px 12px;
          border-radius: 4px;
          border: 1px solid ${isDarkMode ? "#444" : "#ccc"};
          background: transparent;
          color: ${isDarkMode ? "#ccc" : "#555"};
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .preset-btn:hover {
          background: ${isDarkMode ? "#333" : "#eee"};
          border-color: ${isDarkMode ? "#666" : "#aaa"};
        }

        .preset-btn.active {
          background: ${isDarkMode ? "#444" : "#1a1a1a"};
          color: ${isDarkMode ? "#fff" : "#fff"};
          border-color: ${isDarkMode ? "#666" : "#1a1a1a"};
        }

        .slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: ${isDarkMode ? "#333" : "#ddd"};
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${isDarkMode ? "#666" : "#999"};
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${isDarkMode ? "#666" : "#999"};
          cursor: pointer;
          border: none;
        }

        .data-section {
          margin-top: 32px;
        }

        .section-header {
          display: flex;
          align-items: baseline;
          gap: 16px;
          border-bottom: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          padding-bottom: 10px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .section-header h2 {
          font-size: 20px;
          margin: 0;
          border: none;
          padding: 0;
        }

        .timestamp {
          color: ${isDarkMode ? "#666" : "#999"};
          font-size: 13px;
          margin: 0;
        }
      `}</style>
    </main>
  );
}
