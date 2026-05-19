const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");

const SENSORS = ["rwyTdz01", "rwyTdz13", "rwyTdz19", "rwyTdz31"];

const SERIES = [
  {
    key: "windDirection",
    extract: (d) => ({
      timestamp: d.data.rwyTdz31.windDirection.timestamp,
      windDirection: d.data.rwyTdz31.windDirection.value,
    }),
  },
  {
    key: "airTemperature",
    extract: (d) => ({
      timestamp: d.data.rwyTdz01.tempAir.timestamp,
      airTemperature: d.data.rwyTdz01.tempAir.value,
    }),
  },
  {
    key: "windSpeed",
    extract: (d) => ({
      timestamp: d.data.rwyTdz31.windSpeed.timestamp,
      windSpeed: d.data.rwyTdz31.windSpeed.value,
    }),
  },
  {
    key: "airPressure",
    extract: (d) => ({
      timestamp: d.data.rwyTdz31.qnh.timestamp,
      airPressure: d.data.rwyTdz31.qnh.value,
    }),
  },
];

function loadHistoric() {
  const empty = {
    windDirection: [],
    airTemperature: [],
    windSpeed: [],
    airPressure: [],
    sensorData: SENSORS.reduce((acc, sensor) => {
      acc[sensor] = { windDirection: [], windSpeed: [] };
      return acc;
    }, {}),
  };
  try {
    if (!fs.existsSync(DATA_FILE)) return empty;
    const fileData = fs.readFileSync(DATA_FILE, "utf-8");
    if (fileData.length === 0) return empty;
    const parsed = JSON.parse(fileData);
    // Migrate legacy flat-array format (windDirection only)
    if (Array.isArray(parsed)) {
      return { ...empty, windDirection: parsed };
    }
    return {
      windDirection: parsed.windDirection || [],
      airTemperature: parsed.airTemperature || [],
      windSpeed: parsed.windSpeed || [],
      airPressure: parsed.airPressure || [],
      sensorData: parsed.sensorData || empty.sensorData,
    };
  } catch (error) {
    console.error("Error reading file:", error);
    return empty;
  }
}

function saveData(data, maxDataPoints = 1000) {
  const historicData = loadHistoric();

  for (const { key, extract } of SERIES) {
    let point;
    try {
      point = extract(data);
    } catch (error) {
      console.error(`[data.js] Failed to extract ${key}:`, error.message);
      continue;
    }
    if (point[key] == null || point.timestamp == null) {
      continue;
    }

    const arr = historicData[key];
    const last = arr[arr.length - 1];
    if (last && last.timestamp === point.timestamp && last[key] === point[key]) {
      continue;
    }
    arr.push(point);
    if (arr.length > maxDataPoints) {
      historicData[key] = arr.slice(arr.length - maxDataPoints);
    }
  }

  // Save per-sensor data (wind direction and wind speed for each sensor)
  for (const sensor of SENSORS) {
    if (!data.data?.[sensor]) continue;

    const sensorObj = data.data[sensor];
    const timestamp = sensorObj.windDirection?.timestamp;

    if (!timestamp) continue;

    // Initialize sensor data if needed
    if (!historicData.sensorData[sensor]) {
      historicData.sensorData[sensor] = { windDirection: [], windSpeed: [] };
    }

    // Add wind direction
    if (sensorObj.windDirection?.value != null) {
      const wd = { timestamp, windDirection: sensorObj.windDirection.value };
      const lastWd = historicData.sensorData[sensor].windDirection[historicData.sensorData[sensor].windDirection.length - 1];
      if (!lastWd || lastWd.timestamp !== timestamp || lastWd.windDirection !== wd.windDirection) {
        historicData.sensorData[sensor].windDirection.push(wd);
        if (historicData.sensorData[sensor].windDirection.length > maxDataPoints) {
          historicData.sensorData[sensor].windDirection =
            historicData.sensorData[sensor].windDirection.slice(-maxDataPoints);
        }
      }
    }

    // Add wind speed
    if (sensorObj.windSpeed?.value != null) {
      const ws = { timestamp, windSpeed: sensorObj.windSpeed.value };
      const lastWs = historicData.sensorData[sensor].windSpeed[historicData.sensorData[sensor].windSpeed.length - 1];
      if (!lastWs || lastWs.timestamp !== timestamp || lastWs.windSpeed !== ws.windSpeed) {
        historicData.sensorData[sensor].windSpeed.push(ws);
        if (historicData.sensorData[sensor].windSpeed.length > maxDataPoints) {
          historicData.sensorData[sensor].windSpeed =
            historicData.sensorData[sensor].windSpeed.slice(-maxDataPoints);
        }
      }
    }
  }

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(historicData));
  } catch (error) {
    console.error("Error writing to file:", error);
  }
}

async function main() {
  const airport_code = "BIRK";
  const url = `https://iws.isavia.is/weather/${airport_code}`;
  const maxDataPoints = 70000;

  try {
    const response = await fetch(url);
    const data = await response.json();
    saveData(data, maxDataPoints);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Run main every 5 seconds
setInterval(main, 5 * 1000);
