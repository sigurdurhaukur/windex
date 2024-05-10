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
