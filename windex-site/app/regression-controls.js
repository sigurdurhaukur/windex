"use client";

export default function RegressionControls({ windowSize, onWindowSizeChange, showRegression, onToggleRegression, isDarkMode }) {
  return (
    <div className="regression-controls">
      <h3>Regression Analyzer</h3>
      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={showRegression}
            onChange={(e) => onToggleRegression(e.target.checked)}
          />
          Show regression line
        </label>
      </div>

      {showRegression && (
        <div className="control-group">
          <label htmlFor="window-size">Window size: {windowSize} points</label>
          <input
            id="window-size"
            type="range"
            min="2"
            max="100"
            value={windowSize}
            onChange={(e) => onWindowSizeChange(parseInt(e.target.value))}
            className="slider"
          />
          <small>Adjust data range for regression line</small>
        </div>
      )}

      <style jsx>{`
        .regression-controls {
          background: ${isDarkMode ? "#1a1a1a" : "#fff"};
          border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          color: ${isDarkMode ? "#fff" : "#1a1a1a"};
        }

        .regression-controls h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
        }

        .control-group {
          margin-bottom: 16px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          cursor: pointer;
        }

        input[type="checkbox"] {
          margin-right: 8px;
          cursor: pointer;
        }

        .slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: ${isDarkMode ? "#333" : "#ddd"};
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${isDarkMode ? "#fff" : "#1a1a1a"};
          cursor: pointer;
          border: 2px solid ${isDarkMode ? "#666" : "#999"};
        }

        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${isDarkMode ? "#fff" : "#1a1a1a"};
          cursor: pointer;
          border: 2px solid ${isDarkMode ? "#666" : "#999"};
        }

        small {
          display: block;
          color: ${isDarkMode ? "#999" : "#666"};
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
