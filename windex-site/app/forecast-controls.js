export default function ForecastControls({
  windowSize,
  onWindowSizeChange,
  forecastSteps,
  onForecastStepsChange,
  seasonalityMode,
  onSeasonalityModeChange,
  dataPointsToShow,
  onDataPointsToShowChange,
  isDarkMode,
}) {
  return (
    <div className="forecast-controls">
      <h3>Prophet Forecast</h3>

      <div className="control-group">
        <label htmlFor="data-points-slider">X-axis range (data points): {dataPointsToShow}</label>
        <input
          id="data-points-slider"
          type="range"
          min="10"
          max="500"
          value={dataPointsToShow}
          onChange={(e) => onDataPointsToShowChange(Number(e.target.value))}
          className="slider"
        />
      </div>

      <div className="control-group">
        <label htmlFor="window-slider">Fit window (last N points): {windowSize}</label>
        <input
          id="window-slider"
          type="range"
          min="10"
          max="200"
          value={windowSize}
          onChange={(e) => onWindowSizeChange(Number(e.target.value))}
          className="slider"
        />
      </div>

      <div className="control-group">
        <label htmlFor="steps-slider">Forecast steps: {forecastSteps}</label>
        <input
          id="steps-slider"
          type="range"
          min="1"
          max="500"
          value={forecastSteps}
          onChange={(e) => onForecastStepsChange(Number(e.target.value))}
          className="slider"
        />
      </div>

      <div className="control-group">
        <label htmlFor="seasonality-select">Seasonality mode:</label>
        <select
          id="seasonality-select"
          value={seasonalityMode}
          onChange={(e) => onSeasonalityModeChange(e.target.value)}
          className="select"
        >
          <option value="additive">Additive</option>
          <option value="multiplicative">Multiplicative</option>
        </select>
      </div>

      <style jsx>{`
        .forecast-controls {
          background: ${isDarkMode ? "#1a1a1a" : "#fff"};
          border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
          color: ${isDarkMode ? "#fff" : "#1a1a1a"};
        }

        .forecast-controls h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 12px;
        }

        label {
          font-size: 14px;
          font-weight: 500;
          color: ${isDarkMode ? "#fff" : "#1a1a1a"};
          min-width: 240px;
        }

        .slider {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          background: ${isDarkMode ? "#333" : "#ddd"};
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${isDarkMode ? "#fff" : "#333"};
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${isDarkMode ? "#fff" : "#333"};
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .select {
          padding: 8px 12px;
          border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          border-radius: 4px;
          background: ${isDarkMode ? "#0a0a0a" : "#f5f5f5"};
          color: ${isDarkMode ? "#fff" : "#1a1a1a"};
          font-size: 14px;
          cursor: pointer;
        }

        .select:focus {
          outline: none;
          border-color: ${isDarkMode ? "#666" : "#999"};
        }
      `}</style>
    </div>
  );
}
