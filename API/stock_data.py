import requests
import os
import datetime as dt
from dotenv import load_dotenv

load_dotenv()

class StockData:
    def __init__(self, stock_symbol="TSLA", company_name="Tesla Inc"):
        self.stock_symbol = stock_symbol
        self.company_name = company_name
        self.api_key = str(os.getenv("ALPHA_ADVANTAGE_STOCKS_API_KEY"))
        self.data = None

    def fetch_stock_data_json(self):
        parameters = {
            "function": "TIME_SERIES_DAILY",
            "outputsize": "full",
            "datatype": "json",
            "symbol": self.stock_symbol,
            "apikey": self.api_key
        }
        response = requests.get(url="https://www.alphavantage.co/query", params=parameters)
        response.raise_for_status()
        self.data = response.json()
        return self.data

    def get_price_change(self):
        if not self.data:
            self.fetch_stock_data_json()

        today = self.current_date() - dt.timedelta(days=1)
        yesterday = self.current_date() - dt.timedelta(days=2)
        today_price = float(self.data["Time Series (Daily)"][str(today)]["1. open"])
        yesterday_price = float(self.data["Time Series (Daily)"][str(today)]["4. close"])

        return today_price, yesterday_price

    @staticmethod
    def current_date():
        return dt.datetime.now().date()