FROM python:3.12-slim

WORKDIR /app

RUN mkdir -p /data/cache && chmod 755 /data/cache

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py model.py weather_data.py ./

EXPOSE 5001

CMD ["python", "main.py"]
