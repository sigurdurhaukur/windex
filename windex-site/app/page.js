"use client";
import { getData, getHistoricData } from "./api";
import { useState, useEffect } from "react";
import Header from "./header";
import Reccomendation from "./reccomendation";
import formatTimestamp from "./utils";
import Plot from "./plot";

export default function Home() {
  const [historicData, setHistoricData] = useState({
    windDirection: [],
    airTemperature: [],
    windSpeed: [],
  });
  const [allData, setAllData] = useState(null);

  async function fetchLiveData() {
    try {
      const data = await getData();
      if (data?.data?.rwyTdz31?.windDirection) {
        const new_data = historicData;

        new_data.windDirection.push(
          (data.data.rwyTdz31.windDirection.timestamp,
          data.data.rwyTdz31.windDirection.value),
        );
        new_data.airTemperature.push({
          timestamp: data.data.rwyTdz01.tempAir.timestamp,
          airTemperature: data.data.rwyTdz01.tempAir.value,
        });

        new_data.windSpeed.push({
          timestamp: data.data.rwyTdz31.windSpeed.timestamp,
          windSpeed: data.data.rwyTdz31.windSpeed.value,
        });

        setAllData(data);
        setHistoricData(new_data);
      } else {
        console.error("Error parsing data from server");
      }
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  }

  async function fetchHistoricData() {
    try {
      const data = await getHistoricData();
      const initialHistoricData = historicData;
      initialHistoricData.windDirection = data;
      setHistoricData(initialHistoricData);
    } catch (error) {
      console.error("Error fetching historic data:", error);
    }
  }

  useEffect(() => {
    // Load historic data and set interval for live data fetching
    fetchHistoricData();
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Render plots only if historic data is available
  function renderPlots() {
    return (
      <>
        <Plot
          data={historicData.windDirection}
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
          data={historicData.airTemperature}
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
          data={historicData.windSpeed}
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
      <div className="logo">
        <h1>Windex</h1>
        <img src="/logo.png" alt="Windex logo" />
      </div>
      <Header data={allData} />
      {allData && <Reccomendation data={allData} />}
      <h2>Historic data</h2>
      {allData && <p>last updated {formatTimestamp(allData.timestamp)}</p>}
      {historicData && renderPlots()}
    </main>
  );
}
