"use client";
import { getData, getHistoricData } from "./api";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  scales,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [historicData, setHistoricData] = useState({
    windDirection: [],
    timestamp: [],
  });
  const [result, setResult] = useState(null);
  const [allData, setAllData] = useState();

  // Function to convert timestamp to H:M:S format
  function formatTimestamp(ts) {
    const date = new Date(ts * 1000); // Assuming timestamps are in seconds
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  // Log messages to identify data issues
  useEffect(() => {
    let collectedHistoricData = { windDirection: [], timestamp: [] };
    getHistoricData().then((data) => {
      console.log("Historic data:", data);

      data.forEach((d) => {
        let windDir = d.windDirection;
        let ts = d.timestamp;

        collectedHistoricData.windDirection.push(windDir);
        collectedHistoricData.timestamp.push(formatTimestamp(ts));
      });
      setHistoricData(collectedHistoricData);
    });

    const interval = setInterval(async () => {
      try {
        // Make sure getData returns the right data structure
        const data = await getData();
        console.log("Fetched data:", data);
        setAllData(data);

        // Make sure the data contains what we expect
        if (data?.data?.rwyTdz31?.windDirection) {
          const windDir = data.data.rwyTdz31.windDirection.value;
          const ts = data.data.rwyTdz31.windDirection.timestamp;

          // Update the latest result for display
          setResult({
            ...data.data.rwyTdz31.windDirection,
            timestamp: formatTimestamp(ts),
          });

          // Append new data to historicData
          setHistoricData((prevHistoricData) => ({
            windDirection: [...prevHistoricData.windDirection, windDir],
            timestamp: [...prevHistoricData.timestamp, formatTimestamp(ts)],
          }));
        } else {
          console.error("Missing expected wind direction data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }, 5 * 1000);

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: historicData.timestamp,
    datasets: [
      {
        label: "Wind Direction",
        data: historicData.windDirection,
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.3)",
        fill: true,
        tension: 0.3,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Wind Direction Over Time",
      },
    },
    scales: {
      y: {
        min: 0,
        max: 360,
      },
    },
  };

  return (
    <main>
      <h1>Windex</h1>
      <div>
        <h2>Currently:</h2>
        {!allData && <p>Loading... This should take approximately 5 seconds</p>}
        {allData && (
          <>
            <p>
              wind direction: {allData.data.rwyTdz01.windDirection.value}
              {allData.data.rwyTdz01.windDirection.unit}
            </p>
            <p>timestamp: {formatTimestamp(allData.timestamp)}</p>
            <p>
              Humidity: {allData.data.rwyTdz01.humidity.value}
              {allData.data.rwyTdz01.humidity.unit}
            </p>
            <p>
              Air temperature: {allData.data.rwyTdz01.tempAir.value}
              {allData.data.rwyTdz01.tempAir.unit}
            </p>
            <p>
              Wind speed: {allData.data.rwyTdz01.windSpeed.value}
              {allData.data.rwyTdz01.windSpeed.unit}
            </p>
          </>
        )}
      </div>

      <h2>Wind direction vs. time</h2>
      <Line data={chartData} options={chartOptions} />
      <table>
        <thead>
          <tr>
            <th>Wind Direction</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {historicData.windDirection.map((dir, i) => (
            <tr key={i}>
              <td>{dir}</td>
              <td>{historicData.timestamp[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
