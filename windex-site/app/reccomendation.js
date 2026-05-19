import { parseData, calculateRunningAverage } from "./utils.js";

export default function Recommendation({ data, historicData, isDarkMode }) {
  if (!data) {
    return (
    <div className="recommendation">
        <h2>Recommendation</h2>
        <p>no data recieved</p>
        <style jsx>{`
          .recommendation {
            background: ${isDarkMode ? "#1a1a1a" : "#fff"};
            border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          h2 {
            margin-top: 0;
          }
        `}</style>
      </div>
    );
  }

  const { cloudData, weather_stations, station_keys, snow_tam } = parseData(
    data,
    "BIRK",
  );

  const windSpeedAverage = historicData?.windSpeed
    ? calculateRunningAverage(historicData.windSpeed)
    : null;

  return (
    <div className="recommendation">
      <p className="description">{evaluateWindSpeed(weather_stations)}</p>
      <div className="metrics">
        {windSpeedAverage && (
          <div className="metric">
            <span className="label">Running average (last 10):</span>
            <span className="value">{windSpeedAverage.toFixed(2)} knots</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .recommendation {
          background: ${isDarkMode ? "#1a1a1a" : "#fff"};
          border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
        }

        h2 {
          margin-top: 0;
          margin-bottom: 16px;
        }

        .description {
          margin-bottom: 16px;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: ${isDarkMode ? "#0a0a0a" : "#f5f5f5"};
          border-radius: 4px;
          border-left: 3px solid ${isDarkMode ? "#666" : "#ddd"};
        }

        .label {
          color: ${isDarkMode ? "#999" : "#666"};
          font-size: 13px;
        }

        .value {
          color: ${isDarkMode ? "#fff" : "#1a1a1a"};
          font-weight: 600;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

function evaluateWindSpeed(weather_stations) {
  const windSpeeds = weather_stations
    .filter((station) => station?.windSpeed?.value !== undefined)
    .map((station) => station.windSpeed.value);

  if (windSpeeds.length === 0) return "No wind speed data available.";

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
