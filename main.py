

# scrape and store the weather data from https://iws.isavia.is/#!/BIRK/

import requests as req
import time

airport_code = 'BIRK'
url = f'https://iws.isavia.is/weather/{airport_code}'
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Referer': 'https://iws.isavia.is/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'TE': 'trailers'
}


max_requests = 20
n_requests = 0

wind_dir = []
wind_speed = []
time_stamp = []

while n_requests < max_requests:
    try:
        r = req.get(url, headers=headers)
        data = r.json()

        clouds = data['data']['reykjavik']
        snowtam = data['data']['snowtam']
        runways = data['data']['rwyTdz31']

        wind_dir.append(runways['windDirection']['value'])
        wind_speed.append(runways['windSpeed']['value'])
        time_stamp.append(runways['windDirection']['timestamp'])

        print(wind_dir[-1], wind_speed[-1], time_stamp[-1])

        time.sleep(5)
        n_requests += 1
    except Exception as e:
        print('Error:', e)
        break

