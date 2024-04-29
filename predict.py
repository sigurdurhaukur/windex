import matplotlib.pyplot as plt
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pandas as pd

# Read data from csv file
data = pd.read_csv('wind_data.txt', sep=',', header=None)

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

regr = MLPRegressor(random_state=1, max_iter=500)
regr.fit(X_train, y_train)  # Fit the model

# Assuming you might want to see how the model performs:
from sklearn.metrics import mean_squared_error

y_pred = regr.predict(X_test)

mse = mean_squared_error(scaler_y.inverse_transform(y_test.reshape(-1, 1)), scaler_y.inverse_transform(y_pred.reshape(-1, 1)))
print(f'Mean Squared Error: {mse}')


plt.figure()
plt.scatter (scaler_X.inverse_transform(X_test), scaler_y.inverse_transform(y_test.reshape(-1, 1)), color='black')
plt.scatter(scaler_X.inverse_transform(X_test), scaler_y.inverse_transform(y_pred.reshape(-1, 1)), color='blue')
plt.title('Wind direction vs Timestamp')
plt.ylabel('Wind direction (degrees)')
plt.xlabel('Timestamp (unix time)')
plt.legend(['Predicted', 'Actual'])
plt.ylim(0, 360)
plt.show()
