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


def get_weather_data(max_requests=20):
    n_requests = 0
    while n_requests < max_requests:
        try:
            r = req.get(url, headers=headers)
            r.raise_for_status()  # Raises an HTTPError for bad responses
            data = r.json()

            timestamp = data["timestamp"]
            wind_dir = data["data"]["rwyTdz31"]["windDirection"]["value"]

            if max_requests > 1:
                time.sleep(1)

            n_requests += 1
            yield timestamp, wind_dir
        except req.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")  # Specific error for HTTP issues
            break
        except req.exceptions.RequestException as err:
            print(f"Error during requests to the API: {err}")  # General request errors
            break
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            break
