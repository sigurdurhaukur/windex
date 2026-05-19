"use client";
import { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import formatTimestamp from "./utils";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function ScatterLinePlot({
  data,
  options,
  isDarkMode = true,
  dataPointsToShow = 100,
  minData = null,
  maxData = null,
  description = null,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newPoint, setNewPoint] = useState(false);
  const containerRef = useRef(null);
  const prevDataLength = useRef(0);

  const valueKey = data && data.length
    ? Object.keys(data[0]).find((k) => k !== "timestamp")
    : null;

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Failed to enter fullscreen:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error("Failed to exit fullscreen:", err);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Trigger pulse animation when new data point arrives
  useEffect(() => {
    if (data?.length && data.length > prevDataLength.current) {
      setNewPoint(true);
      prevDataLength.current = data.length;
      const timer = setTimeout(() => setNewPoint(false), 600);
      return () => clearTimeout(timer);
    }
    prevDataLength.current = data?.length || 0;
  }, [data?.length]);


  if (!data || !data.length) {
    return <p>no data recieved</p>;
  }

  const filteredData = data.slice(-dataPointsToShow);
  const scatterPoints = filteredData.map((d) => ({
    x: d.timestamp,
    y: d[valueKey],
  }));

  // Build per-point radius and color arrays for pulse effect
  const lastIdx = scatterPoints.length - 1;
  const pointRadii = scatterPoints.map((_, i) => (i === lastIdx && newPoint ? 8 : 1.5));
  const pointColors = scatterPoints.map((_, i) =>
    i === lastIdx ? (options.color || "rgba(75,192,192,1)") : "rgba(75,192,192,0.6)"
  );

  const minKey = minData?.length ? Object.keys(minData[0]).find((k) => k !== "timestamp") : null;
  const maxKey = maxData?.length ? Object.keys(maxData[0]).find((k) => k !== "timestamp") : null;
  const minPoints = minKey ? minData.slice(-dataPointsToShow).map((d) => ({ x: d.timestamp, y: d[minKey] })) : [];
  const maxPoints = maxKey ? maxData.slice(-dataPointsToShow).map((d) => ({ x: d.timestamp, y: d[maxKey] })) : [];

  const allYValues = [
    ...scatterPoints.map((p) => p.y),
    ...minPoints.map((p) => p.y),
    ...maxPoints.map((p) => p.y),
  ].filter((v) => v != null);

  let yMin = options.range?.min;
  let yMax = options.range?.max;

  if (allYValues.length > 0) {
    const dataMin = Math.min(...allYValues);
    const dataMax = Math.max(...allYValues);
    const range = dataMax - dataMin;
    const padding = range === 0 ? Math.abs(dataMax) * 0.1 : range * 0.1;
    yMin = dataMin - padding;
    yMax = dataMax + padding;
  }

  const datasets = [
    ...(minPoints.length ? [{
      label: "Lull (min)",
      data: minPoints,
      borderColor: options.rgba || "rgba(75,192,192,0.4)",
      backgroundColor: "transparent",
      fill: false,
      tension: 0.3,
      pointRadius: 0,
      borderDash: [4, 4],
    }] : []),
    ...(maxPoints.length ? [{
      label: "Gust (max)",
      data: maxPoints,
      borderColor: options.rgba || "rgba(75,192,192,0.4)",
      backgroundColor: options.rgba || "rgba(75,192,192,0.15)",
      fill: minPoints.length ? "-1" : false,
      tension: 0.3,
      pointRadius: 0,
      borderDash: [4, 4],
    }] : []),
    {
      type: "line",
      label: `${options.label}`,
      data: scatterPoints,
      borderColor: options.color || "rgba(75,192,192,1)",
      backgroundColor: minPoints.length ? "transparent" : (options.rgba || "rgba(75,192,192,0.1)"),
      fill: !minPoints.length,
      tension: 0.3,
      pointRadius: pointRadii,
      pointBackgroundColor: pointColors,
      pointHoverRadius: 6,
    },
  ];

  const chartData = { datasets };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 200,
      easing: "easeOutCubic",
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: isDarkMode ? "#fff" : "#1a1a1a",
        },
        filter: (item) => !item.text.includes("Bound"),
      },
      title: {
        display: true,
        text: `${options.title || "Scatter and Line Chart"}`,
        color: isDarkMode ? "#fff" : "#1a1a1a",
      },
    },
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: options.xLabel || "X-Axis",
          color: isDarkMode ? "#fff" : "#1a1a1a",
        },
        ticks: {
          callback: (val) => formatTimestamp(val),
          color: isDarkMode ? "#999" : "#666",
        },
        display: true,
        grid: {
          color: isDarkMode ? "#333" : "#ddd",
        },
      },
      y: {
        title: {
          display: true,
          text: options.yLabel || "Y-Axis",
          color: isDarkMode ? "#fff" : "#1a1a1a",
        },
        min: yMin,
        max: yMax,
        ticks: {
          color: isDarkMode ? "#999" : "#666",
        },
        grid: {
          color: isDarkMode ? "#333" : "#ddd",
        },
      },
    },
  };

  return (
    <div ref={containerRef} className="chart-container">
      <div className="chart-header">
        <div className="chart-title-group">
          <h3 className="chart-title">{options.title}</h3>
          {description && <p className="chart-description">{description}</p>}
        </div>
        <button
          onClick={handleFullscreen}
          className="fullscreen-btn"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? "⛶" : "⛶"}
        </button>
      </div>
      <div style={{ position: "relative", width: "100%", flex: 1, minHeight: 300 }}>
        <Line data={chartData} options={chartOptions} />
      </div>
      <style jsx>{`
        .chart-container {
          background: ${isDarkMode ? "#1a1a1a" : "#fff"};
          border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
          position: relative;
          height: 400px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chart-container:fullscreen {
          background: ${isDarkMode ? "#000" : "#f5f5f5"};
          height: 100vh;
          width: 100vw;
          max-height: 100vh;
          padding: 40px 60px;
          margin: 0;
          border: none;
          border-radius: 0;
          gap: 20px;
        }

        .chart-container:fullscreen > div:last-child {
          flex: 1;
          position: relative;
          width: 100%;
          min-height: 0;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .chart-title-group {
          flex: 1;
        }

        .chart-description {
          margin: 4px 0 0 0;
          font-size: 12px;
          line-height: 1.4;
          color: ${isDarkMode ? "#888" : "#777"};
        }

        .chart-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          flex: 1;
        }

        .fullscreen-btn {
          background: none;
          border: 1px solid ${isDarkMode ? "#555" : "#ccc"};
          color: ${isDarkMode ? "#fff" : "#1a1a1a"};
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .fullscreen-btn:hover {
          background: ${isDarkMode ? "#333" : "#e0e0e0"};
          border-color: ${isDarkMode ? "#777" : "#999"};
        }

        .fullscreen-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
