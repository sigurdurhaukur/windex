"use server";
import fs from "fs";
import path from "path";
import { getOrFetchCached } from "./cache-utils.js";

const SENSORS = ["rwyTdz01", "rwyTdz13", "rwyTdz19", "rwyTdz31"];

export async function getData(airport_code = "BIRK") {
  try {
    const url = `https://iws.isavia.is/weather/${airport_code}`;
    console.log(`[getData] Fetching from ${url}`);
    const response = await fetch(url, { next: { revalidate: 0 } });
    if (!response.ok) {
      console.error(`[getData] API returned ${response.status}`);
      return null;
    }
    const data = await response.json();
    console.log(`[getData] Successfully fetched data`);
    return data;
  } catch (error) {
    console.error(`[getData] Error:`, error);
    return null;
  }
}

export async function getAllSensorData(airport_code = "BIRK") {
  try {
    const data = await getData(airport_code);
    if (!data) {
      console.warn(`[getAllSensorData] No data from getData`);
      return {};
    }

    const timestamp = data.timestamp;
    const sensorData = {};

    SENSORS.forEach((sensor) => {
      if (data.data[sensor]?.windDirection) {
        sensorData[sensor] = {
          timestamp,
          windDirection: data.data[sensor].windDirection.value,
          windSpeed: data.data[sensor].windSpeed?.value,
          tempAir: data.data[sensor].tempAir?.value,
        };
      }
    });

    console.log(`[getAllSensorData] Processed ${Object.keys(sensorData).length} sensors`);
    return sensorData;
  } catch (error) {
    console.error(`[getAllSensorData] Error:`, error);
    return {};
  }
}

export async function getHistoricData() {
  try {
    const dataPath = "/app/data.json";
    if (fs.existsSync(dataPath)) {
      const fileData = fs.readFileSync(dataPath, "utf-8");
      if (fileData.length > 0) {
        return JSON.parse(fileData);
      }
    }
  } catch (error) {
    console.error("Error reading file:", error);
  }
  return [];
}

export async function getSeaLevel(stationNumber = 1141) {
  return getOrFetchCached(
    "sea_level",
    async () => {
      const url = `https://gagnaveita.vegagerdin.is/api/vedur2014_1`;
      const response = await fetch(url, { next: { revalidate: 0 } });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        const station = data.find(s => s.Nr === stationNumber);
        return station || null;
      }
      return null;
    },
    { fallbackToStale: true }
  );
}
