"use client";
import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  PolarAreaController,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(PolarAreaController, RadialLinearScale, ArcElement, Tooltip, Legend);

const SECTOR_COUNT = 16;
const SECTOR_SIZE = 360 / SECTOR_COUNT;
const DIRECTION_LABELS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

function speedToColor(avgSpeed) {
  if (avgSpeed < 5)  return "rgba(100, 180, 255, 0.75)";
  if (avgSpeed < 10) return "rgba(80, 200, 120, 0.75)";
  if (avgSpeed < 15) return "rgba(255, 210, 60, 0.75)";
  if (avgSpeed < 20) return "rgba(255, 140, 40, 0.75)";
  return "rgba(220, 60, 60, 0.75)";
}

export default function WindRose({ windDirectionData, windSpeedData, isDarkMode = true, dataPointsToShow = 2000, description = null }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!windDirectionData?.length) return;

    const dirSlice = windDirectionData.slice(-dataPointsToShow);
    const speedSlice = windSpeedData?.slice(-dataPointsToShow) || [];

    // Build a speed lookup by timestamp for fast join
    const speedByTs = {};
    for (const sp of speedSlice) speedByTs[sp.timestamp] = sp.windSpeed;

    const counts = new Array(SECTOR_COUNT).fill(0);
    const speedSums = new Array(SECTOR_COUNT).fill(0);

    for (const point of dirSlice) {
      const deg = ((point.windDirection % 360) + 360) % 360;
      const sector = Math.floor((deg + SECTOR_SIZE / 2) % 360 / SECTOR_SIZE);
      counts[sector]++;
      speedSums[sector] += speedByTs[point.timestamp] ?? 0;
    }

    const avgSpeeds = counts.map((c, i) => (c > 0 ? speedSums[i] / c : 0));
    const colors = avgSpeeds.map(speedToColor);

    const chartData = {
      labels: DIRECTION_LABELS,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderColor: colors.map((c) => c.replace("0.75", "1")),
        borderWidth: 1,
      }],
    };

    const textColor = isDarkMode ? "#fff" : "#1a1a1a";
    const gridColor = isDarkMode ? "#333" : "#ddd";

    const options = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const sector = ctx.dataIndex;
              const pct = dirSlice.length > 0 ? ((counts[sector] / dirSlice.length) * 100).toFixed(1) : 0;
              return `${pct}%  avg ${avgSpeeds[sector].toFixed(1)} kt`;
            },
          },
        },
      },
      scales: {
        r: {
          ticks: { display: false },
          grid: { color: gridColor },
          pointLabels: {
            display: true,
            color: textColor,
            font: { size: 12 },
          },
        },
      },
    };

    if (chartRef.current) {
      chartRef.current.data = chartData;
      chartRef.current.options = options;
      chartRef.current.update();
    } else {
      chartRef.current = new ChartJS(canvasRef.current, {
        type: "polarArea",
        data: chartData,
        options,
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [windDirectionData, windSpeedData, isDarkMode, dataPointsToShow]);

  return (
    <div className="wind-rose-container">
      <div className="chart-header">
        <div className="chart-title-group">
          <h3 className="chart-title">Wind rose</h3>
          {description && <p className="chart-description">{description}</p>}
        </div>
      </div>
      <div className="legend">
        {[
          { label: "< 5 kt", color: "rgba(100, 180, 255, 0.75)" },
          { label: "5–10 kt", color: "rgba(80, 200, 120, 0.75)" },
          { label: "10–15 kt", color: "rgba(255, 210, 60, 0.75)" },
          { label: "15–20 kt", color: "rgba(255, 140, 40, 0.75)" },
          { label: "20+ kt", color: "rgba(220, 60, 60, 0.75)" },
        ].map(({ label, color }) => (
          <span key={label} className="legend-item">
            <span className="legend-swatch" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
      <div className="canvas-wrap">
        <canvas ref={canvasRef} />
      </div>
      <style jsx>{`
        .wind-rose-container {
          background: ${isDarkMode ? "#1a1a1a" : "#fff"};
          border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
        }
        .chart-header { margin-bottom: 8px; }
        .chart-title-group { flex: 1; }
        .chart-title { margin: 0; font-size: 16px; font-weight: 600; }
        .chart-description {
          margin: 4px 0 0 0;
          font-size: 12px;
          line-height: 1.4;
          color: ${isDarkMode ? "#888" : "#777"};
        }
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 12px;
          color: ${isDarkMode ? "#ccc" : "#555"};
        }
        .legend-item { display: flex; align-items: center; gap: 4px; }
        .legend-swatch {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          display: inline-block;
        }
        .canvas-wrap {
          max-width: 460px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
