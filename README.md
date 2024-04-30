# Windex

author: Sigurdur Haukur Birgisson

---

A simple MLP neural network implemented with scikit learn, which utilizes online learning to become more accurate over time. The network is trained on weather data from the Reykjavik airport, and is used to predict the wind direction at a given time.

## Data

The data used to train the network is collected from the Isavia API, which provides real-time weather data from the Reykjavik airport. The data is collected every second, and is saved to `weather_data.txt`. The data consists of 2 columns, the first being the time the data was collected, and the second being the wind direction in degrees.

see: [Isavia BIRK](https://iws.isavia.is/#!/BIRK/)

## Requirements

- Python 3.6
- Scikit-learn
- Numpy
- Matplotlib
- Pandas

## Usage

To run the program, simply run the `main.py` file. The program will train the network on the data in `weather_data.txt`, and then prompt the user to input a date and time. The program will then predict the wind direction at that time.

## Documentation

`main()` is the main function of the program, and is called when the program is run. It reads the data from `weather_data.txt`, trains the network, and then visualizes the predictions in real-time.

`collect_data_for_pretraining` is a helper function to collect the data. Since it only receives real-time data it might take some time to collect enough data to train the network. The data is saved to

`weather_data.txt`.

There are two libraries in this project, `weather_data.py` and `model.py`. `weather_data.py` contains the `get_weather_data()` function, which is used to interacti with the api from Isavia from the airport. It has a global variable named `airport_code` which is used to get data from a specific airport in Iceland, it has not been extended to allow for different codes. `model.py` contains the `Model` class, which is used to train the network and make predictions.
