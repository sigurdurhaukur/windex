// Function to convert timestamp to H:M:S format
export default function formatTimestamp(ts) {
  const date = new Date(ts * 1000); // Assuming timestamps are in seconds
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function parseData(data, airport_code = "BIRK") {
  if (!data) throw new Error("No data provided");

  switch (airport_code) {
    case "BIRK":
      return parseBIRK(data);
    case "BIAR":
      return parseBIAR(data);
    default:
      throw new Error("Invalid airport code");
  }
}

function parseBIRK(data) {
  const _data = Object.values(data.data);
  const cloud_data = _data[0];
  const weather_stations = _data.slice(1, -1);
  const station_keys = Object.keys(data.data).slice(1, -1);
  const snow_tam = _data[-1];

  const parsedData = {
    cloud_data: cloud_data,
    weather_stations: weather_stations,
    station_keys: station_keys,
    snow_tam: snow_tam,
  };

  return parsedData;
}

export function calculateRunningAverage(dataPoints, windowSize = 10) {
  if (dataPoints.length === 0) return null;

  const start = Math.max(0, dataPoints.length - windowSize);
  const recentPoints = dataPoints.slice(start);
  const sum = recentPoints.reduce((acc, point) => {
    const value = point.windSpeed !== undefined ? point.windSpeed : point;
    return acc + value;
  }, 0);

  return sum / recentPoints.length;
}

export function linearRegression(dataPoints, windowSize = null) {
  if (dataPoints.length < 2) return null;

  let points = dataPoints;
  let startIndex = 0;
  if (windowSize) {
    startIndex = Math.max(0, dataPoints.length - windowSize);
    points = dataPoints.slice(startIndex);
  }

  const n = points.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  points.forEach((point) => {
    const x = point.timestamp || 0;
    const y =
      point.windSpeed !== undefined
        ? point.windSpeed
        : point.airTemperature !== undefined
          ? point.airTemperature
          : point.windDirection !== undefined
            ? point.windDirection
            : point;

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const regressionLine = points.map((point) => ({
    x: point.timestamp || 0,
    y: slope * (point.timestamp || 0) + intercept,
  }));

  return { slope, intercept, points: regressionLine };
}

export function predictFutureValue(dataPoints, stepsAhead = 5, windowSize = 10) {
  if (dataPoints.length === 0) return [];

  const start = Math.max(0, dataPoints.length - windowSize);
  const recentPoints = dataPoints.slice(start);

  const avg = recentPoints.reduce((acc, point) => {
    const value = point.windSpeed !== undefined
      ? point.windSpeed
      : point.airTemperature !== undefined
        ? point.airTemperature
        : point.windDirection !== undefined
          ? point.windDirection
          : point;
    return acc + value;
  }, 0) / recentPoints.length;

  const lastPoint = dataPoints[dataPoints.length - 1];
  const lastTimestamp = lastPoint?.timestamp || 0;

  const forecast = [];
  for (let i = 1; i <= stepsAhead; i++) {
    forecast.push({
      x: lastTimestamp + i * 10,
      y: avg,
    });
  }

  return forecast;
}
