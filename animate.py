
import requests as req
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error
import pandas as pd
from sklearn.model_selection import train_test_split

# Initialize the plot
fig, ax = plt.subplots(2, 1, figsize=(10, 8))
plt.subplots_adjust(hspace=0.5)

# Variables to store data
wind_dir = []
wind_speed = []
time_stamp = []

# Initialize the model and scalers
regr = MLPRegressor(random_state=1, max_iter=500, hidden_layer_sizes=(64,64), activation='relu', solver='adam', alpha=0.0001, batch_size='auto', learning_rate='constant', learning_rate_init=5e-4)
#scaler_x = StandardScaler()
#scaler_y = StandardScaler()

# pretrain the model

# Read data from csv file
data = pd.read_csv('wind_data2.txt', sep=',', header=None)

X = data[0]  # wind direction (degrees)
y = data[1]  # timestamp (unix time)

# Reshape X to be a 2D array
X = X.values.reshape(-1, 1)

# Normalize the data
scaler_X = StandardScaler()
scaler_y = StandardScaler()
X_train, X_test, y_train, y_test = train_test_split(X, y, shuffle=False, test_size=0.2, random_state=1)

# Fit scaler on training data
X_train = scaler_X.fit_transform(X_train)
X_test = scaler_X.transform(X_test)

# It's crucial to scale the output variable for many regression tasks and models
y_train = scaler_y.fit_transform(y_train.values.reshape(-1, 1)).ravel()  # reshaping and flattening y_train
y_test = scaler_y.transform(y_test.values.reshape(-1, 1)).ravel()  # reshaping and flattening y_test

regr.fit(X_train, y_train)  # Fit the model

y_pred = regr.predict(X_test)

mse = mean_squared_error(scaler_y.inverse_transform(y_test.reshape(-1, 1)), scaler_y.inverse_transform(y_pred.reshape(-1, 1)))
print(f'Mean Squared Error: {mse}')

del data, X, y, X_train, y_train, X_test, y_test


def setup_plot():
    ax[0].set_title('Real-Time Wind Direction')
    ax[0].set_xlabel('Timestamp')
    ax[0].set_ylabel('Direction (degrees)')
    #ax[0].set_ylim(0, 360)
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
        runways = data['data']['rwyTdz31']
        wind_dir.append(float(runways['windDirection']['value']))
        wind_speed.append(float(runways['windSpeed']['value']))
        time_stamp.append(int(runways['windDirection']['timestamp']))

        # Skip if we don't have enough data
        if len(wind_dir) < 2:
            return

        # Train the model every 10th iteration
        if i % 10 == 0:

            X = np.array(wind_dir).reshape(-1, 1)
            y = np.array(wind_speed).reshape(-1, 1)
            scaler_X.fit(X)
            scaler_y.fit(y)

            X_scaled = scaler_X.transform(X)
            y_scaled = scaler_y.transform(y).ravel()

            # Train or partial fit the model
            regr.partial_fit(X_scaled[-10:], y_scaled[-10:]) 


        # predict the next t seconds
        t_into_future = 100
        current_time = time_stamp[-1]
        next_10_seconds = [current_time + i for i in range(1, 1 + t_into_future)]
        x_pred = scaler_X.transform(np.array(next_10_seconds).reshape(-1, 1))
        y_pred = regr.predict(x_pred)
        y_pred = scaler_y.inverse_transform(y_pred.reshape(-1, 1))
        # print(f'Predicted wind direction for next 10 seconds: {y_pred}')

        # Update plots
        ax[0].cla()
        ax[1].cla()
        setup_plot()
        ax[0].plot(time_stamp, wind_dir, 'b')
        ax[0].plot(next_10_seconds, y_pred, 'r--')
        ax[0].legend(['Actual', 'Predicted'])
        ax[1].plot(time_stamp, wind_speed, 'r')

        with open('wind_data2.txt', 'a') as f:
             f.write(f'{time_stamp[-1]},{wind_dir[-1]},{wind_speed[-1]}\n')

    except Exception as e:
        if e is KeyboardInterrupt:
            print('Exiting...')
            plt.close()
            exit() 
    
        print('Error:', e)

ani = FuncAnimation(fig, animate, interval=2000)
plt.show()

