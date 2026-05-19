import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = "/data/cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in ms

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read cache file safely
export async function readCacheFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return data ? JSON.parse(data) : null;
    }
  } catch (error) {
    console.error(`Error reading cache file ${filePath}:`, error);
  }
  return null;
}

// Write cache file safely
export async function writeCacheFile(filePath, data) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing cache file ${filePath}:`, error);
  }
}

// Check if cache is still valid
export async function isCacheValid(cacheData, duration = CACHE_DURATION) {
  if (!cacheData || !cacheData.timestamp) return false;
  return Date.now() - cacheData.timestamp < duration;
}

// Get or fetch data with caching
export async function getOrFetchCached(
  cacheKey,
  fetchFn,
  options = {}
) {
  const {
    duration = CACHE_DURATION,
    fallbackToStale = true,
  } = options;

  const cacheFilePath = path.join(DATA_DIR, `${cacheKey}.json`);

  try {
    // Check cache first
    const cached = await readCacheFile(cacheFilePath);
    if (cached && await isCacheValid(cached, duration)) {
      console.log(`Using cached data for ${cacheKey}`);
      return cached.data;
    }

    // Fetch new data
    const data = await fetchFn();

    // Cache the result
    if (data !== null && data !== undefined) {
      await writeCacheFile(cacheFilePath, {
        data,
        timestamp: Date.now(),
        cacheKey,
      });
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${cacheKey}:`, error);

    // Return stale cache if available
    if (fallbackToStale) {
      const cached = await readCacheFile(cacheFilePath);
      if (cached) {
        console.log(`Returning stale cache for ${cacheKey}`);
        return cached.data;
      }
    }

    return null;
  }
}

// Clear cache
export async function clearCache(cacheKey) {
  try {
    const cacheFilePath = path.join(DATA_DIR, `${cacheKey}.json`);
    if (fs.existsSync(cacheFilePath)) {
      fs.unlinkSync(cacheFilePath);
      console.log(`Cleared cache for ${cacheKey}`);
    }
  } catch (error) {
    console.error(`Error clearing cache for ${cacheKey}:`, error);
  }
}

// List all cached files
export async function listCachedFiles() {
  try {
    ensureDataDir();
    return fs.readdirSync(DATA_DIR);
  } catch (error) {
    console.error("Error listing cached files:", error);
    return [];
  }
}

// Clear all cache
export async function clearAllCache() {
  try {
    const files = await listCachedFiles();
    files.forEach((file) => {
      const filePath = path.join(DATA_DIR, file);
      fs.unlinkSync(filePath);
    });
    console.log("Cleared all cache");
  } catch (error) {
    console.error("Error clearing all cache:", error);
  }
}

// Cache keys - not exported because "use server" modules can only export async functions
const CACHE_KEYS = {
  SEA_LEVEL: "sea_level",
  WIND_DATA: "wind_data",
  SENSOR_DATA: "sensor_data",
  AIR_TEMP: "air_temp",
  AIR_PRESSURE: "air_pressure",
};

export async function getCacheKey(key) {
  return CACHE_KEYS[key];
}
