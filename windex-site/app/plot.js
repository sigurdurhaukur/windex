import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
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
  Legend
);

export default function ScatterLinePlot({ data, options }) {
  const scatterDataPoints = data.x.map((xVal, index) => ({
    x: xVal,
    y: data.y[index],
  }));

  const chartData = {
    datasets: [
      {
        type: "line",
        label: `${options.label} - Line`,
        data: scatterDataPoints,
        borderColor: options.color || "rgba(75,192,192,1)",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: options.title || "Scatter and Line Chart",
      },
    },
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: options.xLabel || "X-Axis",
        },
        ticks: {
          callback: (val) => formatTimestamp(val),
        },
        display: true,
        scaleLabel: {
          display: false,
          labelString: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: options.yLabel || "Y-Axis",
        },
        min: options.range?.min || 0,
        max: options.range?.max || 100,
      },
    },
  };

  // Return a Line chart with the combined datasets
  return <Line data={chartData} options={chartOptions} />;
}
