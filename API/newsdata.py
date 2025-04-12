import requests
import json
import os
from dotenv import load_dotenv
import csv

load_dotenv()

YOUR_API_KEY = str(os.getenv("NEWSDATA_API_KEY"))

class NewsData:
    def __init__(self, stock_symbol, company_name):
        self.stock_symbol = stock_symbol
        self.company_name = company_name
        self.api_key = YOUR_API_KEY
        self.base_url = "https://newsdata.io/api/1/latest"
        self.params = {
            'apikey': self.api_key,
            'qInTitle': company_name,
        }

    def fetch_news_data(self):
        """Fetch news data from the API."""
        response = requests.get(self.base_url, params=self.params)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error: {response.status_code}")
            return None