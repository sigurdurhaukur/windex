"use client";
import { getData, getHistoricData } from "./api";
import { useState, useEffect } from "react";
import Header from "./header";
import formatTimestamp from "./utils";
import Plot from "./plot";

export default function Home() {
  const [historicData, setHistoricData] = useState({
    windDirection: [],
    timestamp: [],
    airTemperature: [],
    tempTimestamp: [],
    windSpeed: [],
    windSpeedTimestamp: [],
  });
  const [allData, setAllData] = useState(null);

  async function fetchLiveData() {
    try {
      const data = await getData();
      if (data?.data?.rwyTdz31?.windDirection) {
        updateHistoricData(
          data.data.rwyTdz31.windDirection.value,
          data.data.rwyTdz31.windDirection.timestamp,
          data.data.rwyTdz01.tempAir.value,
          data.data.rwyTdz01.tempAir.timestamp,
          data.data.rwyTdz31.windSpeed.value,
          data.data.rwyTdz31.windSpeed.timestamp
        );
        setAllData(data);
      } else {
        console.error("Missing expected wind direction data");
      }
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  }

  function updateHistoricData(
    windDir,
    windTs,
    airTemp,
    tempTs,
    windSpeed,
    windSpeedTs
  ) {
    setHistoricData((prev) => ({
      windDirection: [...prev.windDirection, windDir],
      timestamp: [...prev.timestamp, windTs],
      airTemperature: [...prev.airTemperature, airTemp],
      tempTimestamp: [...prev.tempTimestamp, tempTs],
      windSpeed: [...prev.windSpeed, windSpeed],
      windSpeedTimestamp: [...prev.windSpeedTimestamp, windSpeedTs],
    }));
  }

  async function fetchHistoricData() {
    try {
      const data = await getHistoricData();
      const initialHistoricData = {
        windDirection: data.map((d) => d.windDirection),
        timestamp: data.map((d) => d.timestamp),
        airTemperature: historicData.airTemperature,
        tempTimestamp: historicData.tempTimestamp,
        windSpeed: historicData.windSpeed,
        windSpeedTimestamp: historicData.windSpeedTimestamp,
      };
      setHistoricData(initialHistoricData);
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

  // Render plots only if historic data is available
  function renderPlots() {
    return (
      <>
        <Plot
          data={{ x: historicData.timestamp, y: historicData.windDirection }}
          options={{
            label: "Wind direction",
            title: "Wind direction vs. time",
            xLabel: "Time",
            yLabel: "Wind direction (°)",
            range: { min: 0, max: 360 },
            color: "blue",
            rgba: "rgba(0, 0, 255, 0.2)",
          }}
        />
        <Plot
          data={{
            x: historicData.tempTimestamp,
            y: historicData.airTemperature,
          }}
          options={{
            label: "Air temperature",
            title: "Air temperature vs. time",
            xLabel: "Time",
            yLabel: "Temperature (°C)",
            range: { min: -30, max: 30 },
            color: "red",
            rgba: "rgba(255, 0, 0, 0.2)",
          }}
        />
        <Plot
          data={{
            x: historicData.windSpeedTimestamp,
            y: historicData.windSpeed,
          }}
          options={{
            label: "Wind speed",
            title: "Wind speed vs. time",
            xLabel: "Time",
            yLabel: "Wind speed (m/s)",
            range: { min: 0, max: 30 },
            color: "green",
            rgba: "rgba(0, 255, 0, 0.2)",
          }}
        />
      </>
    );
  }

  return (
    <main>
      <h1>Windex</h1>
      <Header data={allData} />
      <h2>Historic data</h2>
      {allData && <p>last updated {formatTimestamp(allData.timestamp)}</p>}
      {historicData && renderPlots()}
    </main>
  );
}
