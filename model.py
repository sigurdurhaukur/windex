from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error
import pandas as pd
from sklearn.model_selection import train_test_split


class Model:
    def __init__(self):
        # Initialize the model and scalers
        self.model = MLPRegressor(
            random_state=1,
            max_iter=800,
            hidden_layer_sizes=(64, 64),
            activation="relu",
            solver="adam",
            alpha=0.0001,
            batch_size="auto",
            learning_rate="constant",
            learning_rate_init=5e-4,
        )

        self.scaler_X = None
        self.scaler_y = None

    def pretrain_model(self, epoch=10, path_to_data="./wind_data.txt", max_iter=800):
        self.model.max_iter = max_iter

        # Read data from csv file
        data = pd.read_csv(path_to_data, sep=",", header=None)
        assert data is not None, "Data is empty"
        X = data[0]  # wind direction (degrees)
        y = data[1]  # timestamp (unix time)

        # count data points
        print(f"Number of data points: {len(X)}")

        # Reshape X to be a 2D array
        X = X.values.reshape(-1, 1)

        # Normalize the data
        scaler_X = StandardScaler()
        scaler_y = StandardScaler()
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, shuffle=False, test_size=0.2, random_state=1
        )

        # Fit scaler on training data
        X_train = scaler_X.fit_transform(X_train)
        X_test = scaler_X.transform(X_test)

        # It's crucial to scale the output variable for many regression tasks and models
        y_train = scaler_y.fit_transform(
            y_train.values.reshape(-1, 1)
        ).ravel()  # reshaping and flattening y_train
        y_test = scaler_y.transform(
            y_test.values.reshape(-1, 1)
        ).ravel()  # reshaping and flattening y_test

        for i in range(epoch):
            print(f"Epoch {i}")

            self.model.fit(X_train, y_train)  # Fit the model

            y_pred = self.model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            print(f"Mean Squared Error: {mse}")

        self.scaler_X = scaler_X
        self.scaler_y = scaler_y

    def online_train(self, X, y, x_test=[], y_test=[]):
        assert self.scaler_X is not None, "Model is not pretrained yet"

        # reduce max_iter to avoid overfitting
        self.model.max_iter = 2

        # Normalize the data
        X = self.scaler_X.transform(X)
        y = self.scaler_y.transform(y.reshape(-1, 1)).ravel()

        self.model = self.model.partial_fit(X, y)

        if len(x_test) > 0 and len(y_test) > 0:
            x_test = self.scaler_X.transform(x_test)
            y_test = self.scaler_y.transform(y_test.reshape(-1, 1)).ravel()

            y_pred = self.model.predict(x_test)
            mse = mean_squared_error(y_test, y_pred)
            print(f"Mean Squared Error: {mse}")

    def predict(self, X):
        # Normalize the data
        assert self.scaler_X is not None, "Model is not trained yet"
        X = X.reshape(-1, 1)
        X = self.scaler_X.transform(X)
        y_pred = self.model.predict(X)

        # Inverse the normalization
        y_pred = self.scaler_y.inverse_transform(y_pred.reshape(-1, 1)).ravel()

        return y_pred
