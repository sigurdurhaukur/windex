import { parseData } from "./utils.js";

export default function Recommendation({ data }) {
  if (!data) {
    return (
      <div>
        <h2>Recommendation</h2> <p>no data recieved</p>
      </div>
    );
  }

  const { cloudData, weather_stations, station_keys, snow_tam } = parseData(
    data,
    "BIRK",
  );

  return (
    <div>
      <h2>Text description</h2>
      <p>{evaluateWindSpeed(weather_stations)}</p>
    </div>
  );
}

function evaluateWindSpeed(weather_stations) {
  const windSpeeds = weather_stations.map((station) => station.windSpeed.value);
  let averageWindSpeed =
    windSpeeds.reduce((acc, speed) => acc + speed, 0) / windSpeeds.length;

  // two decimal places
  averageWindSpeed = Math.round(averageWindSpeed * 100) / 100;
  let message = `Average wind speed is ${averageWindSpeed} knots.`;

  switch (averageWindSpeed) {
    case averageWindSpeed > 20:
      message += " It's too windy to sail.";
      break;
    case averageWindSpeed > 14:
      message += " It's a bit windy, but you can sail.";
      break;
    case averageWindSpeed > 10:
      message += " It's a good day to sail.";
      break;
    case averageWindSpeed < 5:
      message += " There might not be enough wind to sail.";
      break;
    default:
      message += " Good wind conditions.";
  }

  return message;
}
