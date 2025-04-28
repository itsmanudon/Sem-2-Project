import requests

API_KEY = "SS1LF99RB3Q48JUB"
symbol = "IBM"  # Replace with the desired stock symbol

url = "https://www.alphavantage.co/query"
params = {
    "function": "TIME_SERIES_DAILY",
    "symbol": symbol,
    "apikey": API_KEY
}

response = requests.get(url, params=params)

if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print("Error fetching data:", response.status_code)