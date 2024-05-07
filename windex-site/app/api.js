"use server";
const fs = require("fs");

export async function getData(airport_code = "BIRK") {
  const url = `https://iws.isavia.is/weather/${airport_code}`;

  const response = await fetch(url);
  const data = await response.json();

  return data;
}

export async function getHistoricData() {
  try {
    if (fs.existsSync("data.json")) {
      const fileData = fs.readFileSync("data.json");
      if (fileData.length > 0) {
        return JSON.parse(fileData);
      }
    }
  } catch (error) {
    console.error("Error reading file:", error);
  }

  return [];
}
