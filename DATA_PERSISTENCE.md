# Data Persistence Configuration

## Overview
All data is now configured to persist across container restarts using Docker volumes. This includes wind data, sea level data, and all cached data.

## Architecture

### Persistent Data Locations

1. **Wind Data** (Python Backend)
   - File: `/app/wind_data/wind_data.txt`
   - Volume: `./wind_data:/app/wind_data`
   - Format: CSV (timestamp, wind_direction)
   - Rotation: Data older than 1 day is automatically removed
   - Persistence: ✅ Persists via host volume

2. **Sea Level Data** (Node.js Frontend)
   - Cache Location: `/data/cache/sea_level.json`
   - Cache Duration: 5 minutes (falls back to stale cache on API failure)
   - Volume: `cache_data:/data/cache` (shared between frontend and backend)
   - Persistence: ✅ Persists via named volume
   - Fallback: Returns stale cached data if API is unavailable

3. **Weather/Sensor Data** (Node.js Frontend)
   - Primary File: `./windex-site/data.json`
   - Cache Location: `/data/cache/sensor_data.json` (optional)
   - Volume: `./windex-site:/app` + `cache_data:/data/cache`
   - Max Data Points: 70,000 points retained
   - Collection Interval: Every 5 seconds
   - Persistence: ✅ Persists via host volume + named volume

### Data Flow

```
API Requests
    ↓
[Cache Check - 5 min validity]
    ↓
[Return cached data if valid]
    ↓
[Fetch fresh from API]
    ↓
[Save to disk]
    ↓
[Return to client]
    ↓
[Fallback to stale cache on API failure]
```

## Docker Volume Configuration

### Named Volume
```yaml
cache_data:
  driver: local
```
- Persists across restarts
- Shared between backend and frontend
- Located in Docker's managed storage directory

### Host Volumes
1. `./wind_data:/app/wind_data` - Backend wind data
2. `./windex-site:/app` - Frontend code and data

## Cache Utility Functions

The `cache-utils.js` module provides:

```javascript
// Get or fetch data with automatic caching
getOrFetchCached(cacheKey, fetchFn, options)

// Read cached data
readCacheFile(filePath)

// Write cache data
writeCacheFile(filePath, data)

// Check if cache is valid
isCacheValid(cacheData, duration)

// Clear specific cache
clearCache(cacheKey)

// List all cached files
listCachedFiles()

// Clear all cache
clearAllCache()
```

## Cache Keys

Pre-defined cache keys for consistency:
- `SEA_LEVEL` → `sea_level.json`
- `WIND_DATA` → `wind_data.json`
- `SENSOR_DATA` → `sensor_data.json`
- `AIR_TEMP` → `air_temp.json`
- `AIR_PRESSURE` → `air_pressure.json`

## Dockerfiles

Both backend and frontend Dockerfiles now:
1. Create the `/data/cache` directory
2. Set proper permissions (755)
3. Mount the named volume at `/data/cache`

## Usage Example

### Fetching with Caching
```javascript
import { getOrFetchCached, CACHE_KEYS } from './cache-utils';

const seaLevelData = await getOrFetchCached(
  CACHE_KEYS.SEA_LEVEL,
  async () => {
    const response = await fetch(API_URL);
    return response.json();
  },
  { fallbackToStale: true }
);
```

### Direct Cache Operations
```javascript
import { readCacheFile, writeCacheFile } from './cache-utils';

// Read cache
const cached = readCacheFile('/data/cache/my_data.json');

// Write cache
writeCacheFile('/data/cache/my_data.json', myData);
```

## Data Cleanup Strategies

### Automatic Cleanup
1. **Wind Data (Python)**: Removes entries older than 1 day
2. **Sensor Data (Node.js)**: Keeps only latest 70,000 data points
3. **Cache Data (Node.js)**: 5-minute cache validity period

### Manual Cleanup
To clear cached data:
```javascript
import { clearCache, clearAllCache } from './cache-utils';

// Clear specific cache
clearCache('sea_level');

// Clear all caches
clearAllCache();
```

## Verification Checklist

- ✅ Backend Dockerfile creates `/data/cache`
- ✅ Frontend Dockerfile creates `/data/cache`
- ✅ docker-compose defines `cache_data` named volume
- ✅ Both services mount `cache_data` volume
- ✅ `api.js` implements caching for `getSeaLevel()`
- ✅ `cache-utils.js` provides reusable caching utilities
- ✅ `data.js` persists sensor data to `data.json`
- ✅ `wind_data.txt` persists via volume
- ✅ Fallback to stale cache on API failures implemented

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### View persistent data
```bash
# Wind data
docker-compose exec backend ls -la /app/wind_data/

# Cache data
docker-compose exec frontend ls -la /data/cache/
```

### Check cache contents
```bash
docker-compose exec frontend cat /data/cache/sea_level.json
```

## Environment Variables

Current setup uses:
- `NODE_ENV=development` (frontend)
- `PYTHONUNBUFFERED=1` (backend)
- `PORT=5001` (backend)
- `BACKEND_URL=http://backend:5001` (frontend)

All data directories are automatically created and have proper permissions.
