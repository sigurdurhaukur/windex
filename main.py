from model import Model
from weather_data import get_weather_data
from sklearn.metrics import mean_squared_error
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation


def only_train_model_no_visuals(path_to_data="wind_data.txt"):
    model = Model()
    scaler_X, scaler_y = model.pretrain_model(epoch=2, path_to_data=path_to_data)

    regr = model.model
    batch_size = 10
    max_requests = 100
    counter = 0

    wind_dir = []
    wind_speed = []

    for data in get_weather_data(max_requests=max_requests):
        wind_dir.append(data[0])
        wind_speed.append(data[1])
        counter += 1

        # only train the model when we have enough data points
        if counter % batch_size == 0:
            test_index = batch_size // 2
            X = np.array(wind_dir)[-batch_size:-test_index:].reshape(-1, 1)
            y = np.array(wind_speed)[-batch_size:-test_index]
            X_test = np.array(wind_dir)[-test_index:].reshape(-1, 1)
            y_test = np.array(wind_speed)[-test_index:]

            # Normalize the data
            X = scaler_X.transform(X)
            y = scaler_y.transform(y.reshape(-1, 1)).ravel()
            X_test = scaler_X.transform(X_test)
            y_test = scaler_y.transform(y_test.reshape(-1, 1)).ravel()

            regr = regr.partial_fit(X, y)

            y_pred = regr.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            print(f"Mean Squared Error: {mse}")


def main(path_to_data="wind_data.txt"):
    model = Model()
    batch_size = 12
    t_into_future = 30
    model.pretrain_model(epoch=10, path_to_data=path_to_data)

    # Initialize the plot
    fig, ax = plt.subplots(figsize=(10, 6))

    timestamp = []
    wind_dir = []

    def setup_plot():
        ax.set_title("Real-Time Wind Direction")
        ax.set_xlabel("Timestamp")
        ax.set_ylabel("Direction (degrees)")
        # ax[0].set_ylim(0, 360)

    def animate(i):
        time, dir = next(get_weather_data(max_requests=1))
        timestamp.append(time)
        wind_dir.append(dir)

        # online training
        if i % batch_size == 0 and len(wind_dir) > batch_size:
            test_index = batch_size // 2
            X = np.array(wind_dir)[-batch_size:-test_index:].reshape(-1, 1)
            y = np.array(timestamp)[-batch_size:-test_index]
            X_test = np.array(wind_dir)[-test_index:].reshape(-1, 1)
            y_test = np.array(timestamp)[-test_index:]

            assert len(X) == len(y) == batch_size - test_index and len(X) > 0

            model.online_train(X, y, X_test, y_test)

        # Update plots
        ax.cla()
        setup_plot()
        ax.plot(timestamp, wind_dir, "b")

        # Predict the next 10 seconds
        if len(wind_dir) > batch_size:
            # predict from the first timestamp
            next_t_seconds = np.arange(timestamp[0], timestamp[-1] + t_into_future, 1)

            # predict from the last timestamp
            # next_t_seconds = np.arange(timestamp[-1], timestamp[-1] + t_into_future, 1)
            y_pred = model.predict(next_t_seconds)
            ax.plot(next_t_seconds, y_pred, "r--")
            ax.legend(["Actual", "Predicted"])
        else:
            ax.legend(["Actual"])

        with open(path_to_data, "a") as f:
            f.write(f"{timestamp[-1]},{wind_dir[-1]}\n")

    ani = FuncAnimation(fig, animate, interval=2000, cache_frame_data=False)
    plt.show()


def test_application():
    model = None

    # Test model initialization and pretrain_model method
    def test_model_initialization():
        try:
            model = Model()
            model.pretrain_model(epoch=1)
            assert model is not None

            print("Model initialization and pretrain_model test passed")
        except Exception as e:
            print(
                "check model initialization and pretrain_model method in model.py failed"
            )
            print("=" * 50)
            print(e)

    # Test online_train method
    def test_online_train():
        try:
            model = Model()
            model.pretrain_model(epoch=1)

            # single data point only for training
            model.online_train(np.array([[0]]), np.array([0]))

            # single data point and test data point for training
            model.online_train(
                np.array([[0]]), np.array([0]), np.array([[1]]), np.array([1])
            )

            x_in = np.array([[0], [1], [2], [3], [4], [5]])
            y_in = np.array([0, 1, 2, 3, 4, 5])
            x_test = np.array([[6], [7], [8]])
            y_test = np.array([6, 7, 8])
            model.online_train(x_in, y_in, x_test, y_test)

            assert model is not None

            print("Online training test passed")
        except Exception as e:
            print("check online_train method in model.py failed")
            print("=" * 50)
            print(e)

    def test_prediction():
        try:
            model = Model()
            model.pretrain_model(epoch=1)

            # single data point prediction
            y_pred = model.predict(np.array([0]))
            assert y_pred is not None

            # multiple data points prediction
            y_pred = model.predict(np.array([0, 1, 2, 3, 4, 5]))
            assert y_pred is not None

            print("Prediction test passed")
        except Exception as e:
            print("check predict method in model.py failed")
            print("=" * 50)
            print(e)

    def test_weather_api():
        try:
            for data in get_weather_data(max_requests=10):
                assert data is not None

            print("Weather API test passed")
        except Exception as e:
            print("check get_weather_data method in weather_data.py failed")
            print("=" * 50)
            print(e)

    # test_online_train()
    # test_weather_api()
    test_prediction()


def collect_data_for_pretraining(path_to_data="wind_data.txt"):
    with open(path_to_data, "a") as f:
        for data in get_weather_data(max_requests=1000):
            f.write(f"{data[0]},{data[1]}\n")


if __name__ == "__main__":
    path_to_data = "wind_data.txt"  # csv format <timestamp, wind_direction>

    # run this function to collect data for pretraining
    collect_data_for_pretraining(path_to_data)

    # run this function to only train the model without visualization
    only_train_model_no_visuals(path_to_data)

    # run this function to train the model and visualize the prediction in real-time
    main(path_to_data)

    # run this function to test the application, make sure to comment the main function
    # test_application()
