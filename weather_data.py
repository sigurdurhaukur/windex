import requests as req
import time

airport_code = "BIRK"
url = f"https://iws.isavia.is/weather/{airport_code}"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "DNT": "1",
    "Connection": "keep-alive",
    "Referer": "https://iws.isavia.is/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "TE": "trailers",
}


SENSORS = ["rwyTdz01", "rwyTdz13", "rwyTdz19", "rwyTdz31"]


def get_weather_data(max_requests=20, sensor=None):
    """
    Fetch weather data from the API.
    If sensor is None, returns all sensor data.
    If sensor is specified (e.g., 'rwyTdz31'), returns only that sensor's data.
    """
    n_requests = 0
    while n_requests < max_requests:
        try:
            r = req.get(url, headers=headers)
            r.raise_for_status()
            data = r.json()

            timestamp = data["timestamp"]

            if sensor:
                # Return data for single sensor
                if sensor in data["data"] and data["data"][sensor].get("windDirection"):
                    wind_dir = data["data"][sensor]["windDirection"]["value"]
                    wind_speed = data["data"][sensor].get("windSpeed", {}).get("value")
                    if max_requests > 1:
                        time.sleep(1)
                    n_requests += 1
                    yield timestamp, wind_dir, wind_speed
            else:
                # Return data for all sensors
                sensor_data = {}
                for s in SENSORS:
                    if s in data["data"] and data["data"][s].get("windDirection"):
                        sensor_data[s] = {
                            "windDirection": data["data"][s]["windDirection"]["value"],
                            "windSpeed": data["data"][s].get("windSpeed", {}).get("value"),
                        }
                if sensor_data:
                    if max_requests > 1:
                        time.sleep(1)
                    n_requests += 1
                    yield timestamp, sensor_data
        except req.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")
            break
        except req.exceptions.RequestException as err:
            print(f"Error during requests to the API: {err}")
            break
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            break
