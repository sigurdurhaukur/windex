import warnings
from collections import deque

import numpy as np
from statsmodels.tsa.arima.model import ARIMA


class Model:
    """MA(q) time-series model: X_t = mu + e_t + theta_1*e_{t-1} + ... + theta_q*e_{t-q}."""

    def __init__(self, q=5, history_size=300):
        self.q = q
        self.history_size = history_size
        self.values = deque(maxlen=history_size)
        self.fitted = None

    def pretrain_model(self, epoch=10, path_to_data="./wind_data.txt", max_iter=800):
        import pandas as pd
        data = pd.read_csv(path_to_data, sep=",", header=None)
        assert data is not None, "Data is empty"
        values = data[1].values
        print(f"Number of data points: {len(values)}")
        keep = min(len(values), self.history_size)
        self.values = deque(values[-keep:], maxlen=self.history_size)
        self._fit()

    def _fit(self):
        if len(self.values) < max(self.q * 3, 20):
            return
        try:
            arr = np.asarray(self.values, dtype=float)
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                self.fitted = ARIMA(arr, order=(0, 0, self.q)).fit()
        except Exception as e:
            print(f"MA({self.q}) fit failed: {e}")
            self.fitted = None

    def online_train(self, X, y, x_test=[], y_test=[]):
        for val in y:
            self.values.append(float(val))
        self._fit()
        if len(x_test) > 0 and len(y_test) > 0 and self.fitted is not None:
            y_pred = np.asarray(self.fitted.forecast(steps=len(y_test)))
            mse = float(np.mean((np.asarray(y_test, dtype=float) - y_pred) ** 2))
            print(f"Mean Squared Error: {mse}")

    def predict(self, X, steps_ahead=None):
        forecast_len = steps_ahead if steps_ahead is not None else len(X)
        if self.fitted is None:
            if len(self.values) == 0:
                return np.zeros(forecast_len)
            return np.full(forecast_len, float(np.mean(self.values)))
        return np.asarray(self.fitted.forecast(steps=forecast_len))
