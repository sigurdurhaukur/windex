const fs = require("fs");

function saveData(data, maxDataPoints = 1000) {
  // Extract the relevant data into an object
  const cleaned = {
    windDirection: data.data.rwyTdz31.windDirection.value,
    timestamp: data.data.rwyTdz31.windDirection.timestamp,
  };

  // Initialize `historicData` array if the file doesn't exist or is empty
  let historicData = [];
  try {
    if (fs.existsSync("data.json")) {
      const fileData = fs.readFileSync("data.json");
      if (fileData.length > 0) {
        historicData = JSON.parse(fileData);
      } else if (fileData.length > maxDataPoints) {
        // Remove oldest data points if the file is too large
        historicData = historicData.slice(fileData.length - maxDataPoints);
      }
    }
  } catch (error) {
    console.error("Error reading file:", error);
  }

  // Check if the last data point is the same as the incoming data
  if (historicData.length > 0) {
    const lastDataPoint = historicData[historicData.length - 1];
    if (
      lastDataPoint.windDirection === cleaned.windDirection &&
      lastDataPoint.timestamp === cleaned.timestamp
    ) {
      return;
    }
  }

  // Add the new data to the array
  historicData.push(cleaned);

  // Save updated data back to the file
  try {
    fs.writeFileSync("data.json", JSON.stringify(historicData));
  } catch (error) {
    console.error("Error writing to file:", error);
  }
}

async function main() {
  const airport_code = "BIRK";
  const url = `https://iws.isavia.is/weather/${airport_code}`;
  const maxDataPoints = 1000;

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
