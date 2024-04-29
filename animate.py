import requests as req
import time
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# Initialize the plot
fig, ax = plt.subplots(2, 1, figsize=(10, 8))  # Two subplots for wind direction and speed

# space between subplots
plt.subplots_adjust(hspace=0.5)


# Variables to store data
wind_dir = []
wind_speed = []
time_stamp = []

# Configure the plots
def setup_plot():
    ax[0].set_title('Real-Time Wind Direction')
    ax[0].set_xlabel('Timestamp')
    ax[0].set_ylabel('Direction (degrees)')
    ax[1].set_title('Real-Time Wind Speed')
    ax[1].set_xlabel('Timestamp')
    ax[1].set_ylabel('Speed (knots)')

def animate(i):
    global wind_dir, wind_speed, time_stamp
    try:
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

        response = req.get(url, headers=headers)
        data = response.json()

        # Extract specific data here
        runways = data['data']['rwyTdz31']
        wind_dir.append(runways['windDirection']['value'])
        wind_speed.append(runways['windSpeed']['value'])
        time_stamp.append(runways['windDirection']['timestamp'])

        # Update plots
        ax[0].cla()
        # ax0 from 0 to 360 with 0 in the middle
        ax[0].set_ylim(0, 360)

        ax[1].cla()
        setup_plot()
        ax[0].plot(time_stamp, wind_dir, 'b')
        ax[1].plot(time_stamp, wind_speed, 'r')


        with open('wind_data.txt', 'a') as f:
            f.write(f'{time_stamp[-1]},{wind_dir[-1]},{wind_speed[-1]}\n')

    except Exception as e:
        print('Error:', e)

ani = FuncAnimation(fig, animate, interval=1000)

plt.show()

