"use client";
import { useEffect, useRef } from "react";

const BIRK = [64.1300, -21.9411];

// Wind sensor locations
const SENSORS = [
  { id: "RWY13", label: "RWY13", coords: [64.130556, -21.950361] },
  { id: "RWY01", label: "RWY01", coords: [64.125278, -21.934972] },
  { id: "RWY31", label: "RWY31", coords: [64.128528, -21.940917] },
  { id: "RWY19", label: "RWY19", coords: [64.132944, -21.936417] },
];

function arrowSvg(degrees, opacity, size, color) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"
      style="transform:rotate(${degrees}deg);opacity:${opacity}">
      <polygon points="50,8 62,72 50,62 38,72" fill="${color}" stroke="${color}" stroke-width="2"/>
    </svg>`;
}

function sensorMarkerSvg(color) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="#fff" stroke-width="2"/>
    </svg>`;
}

export default function WindMap({
  sensorData = {},
  windDirectionData,
  windSpeedData,
  isDarkMode = true,
  dataPointsToShow = 100,
}) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (leafletRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, { zoomControl: true }).setView(BIRK, 12);
      if (cancelled) { map.remove(); return; }

      L.tileLayer(
        isDarkMode
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap © CARTO", maxZoom: 19 }
      ).addTo(map);

      // Add sensor location markers
      SENSORS.forEach(({ label, coords }) => {
        const markerIcon = L.divIcon({
          html: sensorMarkerSvg(isDarkMode ? "#888" : "#555"),
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          className: "",
        });
        L.marker(coords, { icon: markerIcon, interactive: false }).addTo(map);
        L.tooltip(coords, { content: label, direction: "top", permanent: true, className: "sensor-label" }).addTo(map);
      });

      leafletRef.current = { L, map };
    }

    init();

    return () => {
      cancelled = true;
      if (leafletRef.current) {
        leafletRef.current.map.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  // Redraw wind arrows whenever data changes
  useEffect(() => {
    if (!leafletRef.current) return;
    const { L, map } = leafletRef.current;

    // Clear previous arrows
    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];

    // For each sensor location, draw wind arrows
    SENSORS.forEach(({ id, coords }) => {
      // Determine which data to use: per-sensor or shared
      const sensorId = id.toLowerCase() === "rwy13" ? "rwyTdz13" :
                       id.toLowerCase() === "rwy31" ? "rwyTdz31" :
                       id.toLowerCase() === "rwy01" ? "rwyTdz01" :
                       id.toLowerCase() === "rwy19" ? "rwyTdz19" : null;

      let directionData = windDirectionData || [];
      let speedData = windSpeedData || [];

      // Use sensor-specific data if available
      if (sensorData?.[sensorId]) {
        directionData = sensorData[sensorId].windDirection || [];
        speedData = sensorData[sensorId].windSpeed || [];
      }

      if (!directionData.length) return;

      const dirSlice = directionData.slice(-dataPointsToShow);
      const speedSlice = speedData.slice(-dataPointsToShow);
      const step = Math.max(1, Math.floor(dirSlice.length / 20));

      // Historical arrows (faded, small)
      for (let i = 0; i < dirSlice.length - 1; i += step) {
        const age = i / dirSlice.length; // 0 = oldest, ~1 = newest
        const opacity = 0.08 + age * 0.25;
        const icon = L.divIcon({
          html: arrowSvg(dirSlice[i].windDirection, opacity, 36, isDarkMode ? "#aaddff" : "#3366aa"),
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          className: "",
        });
        const layer = L.marker(coords, { icon, interactive: false }).addTo(map);
        layersRef.current.push(layer);
      }

      // Current arrow (bold) with size scaled by wind speed
      const latest = dirSlice[dirSlice.length - 1];
      const latestSpeed = speedSlice[speedSlice.length - 1];
      const speed = latestSpeed?.windSpeed ?? 0;
      const speedValue = typeof speed === "number" ? speed : 0;
      const arrowSize = Math.max(48, Math.min(120, 48 + speedValue * 4));
      const anchorSize = arrowSize / 2;
      const currentIcon = L.divIcon({
        html: arrowSvg(latest.windDirection, 1, arrowSize, isDarkMode ? "#00e87a" : "#007a3d"),
        iconSize: [arrowSize, arrowSize],
        iconAnchor: [anchorSize, anchorSize],
        className: "",
      });
      const currentLayer = L.marker(coords, { icon: currentIcon })
        .bindPopup(
          `<strong>${id}</strong><br>Direction: ${Math.round(latest.windDirection)}°<br>Speed: ${typeof speed === "number" ? speed.toFixed(1) : speed} kt`,
          { closeButton: false }
        )
        .addTo(map);
      layersRef.current.push(currentLayer);
    });
  }, [sensorData, windDirectionData, windSpeedData, isDarkMode, dataPointsToShow]);

  return (
    <div className="wind-map-container">
      <div className="chart-header">
        <div className="chart-title-group">
          <h3 className="chart-title">Wind direction map</h3>
          <p className="chart-description">
            Wind direction at each of the 4 runway sensors. Current direction shown as bold arrows; size indicates wind speed. Faded arrows show recent direction history.
          </p>
        </div>
      </div>
      <div ref={mapRef} className="map" />
      <style jsx>{`
        .wind-map-container {
          background: ${isDarkMode ? "#1a1a1a" : "#fff"};
          border: 1px solid ${isDarkMode ? "#333" : "#ddd"};
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
        }
        .chart-header { margin-bottom: 12px; }
        .chart-title-group { flex: 1; }
        .chart-title { margin: 0; font-size: 16px; font-weight: 600; }
        .chart-description {
          margin: 4px 0 0 0;
          font-size: 12px;
          line-height: 1.4;
          color: ${isDarkMode ? "#888" : "#777"};
        }
        .map {
          height: 460px;
          border-radius: 6px;
          overflow: hidden;
          z-index: 0;
        }
      `}</style>
      <style global jsx>{`
        .sensor-label {
          background: transparent;
          border: none;
          box-shadow: none;
          font-size: 12px;
          font-weight: 600;
          color: ${isDarkMode ? "#ccc" : "#333"};
          white-space: nowrap;
          padding: 2px 6px;
        }
        .leaflet-popup-content-wrapper {
          background: ${isDarkMode ? "#1a1a1a" : "#fff"};
          color: ${isDarkMode ? "#fff" : "#1a1a1a"};
          border: 1px solid ${isDarkMode ? "#444" : "#ddd"};
          border-radius: 6px;
          box-shadow: none;
        }
        .leaflet-popup-tip {
          background: ${isDarkMode ? "#1a1a1a" : "#fff"};
        }
      `}</style>
    </div>
  );
}
