import requests
import os
import datetime as dt
from dotenv import load_dotenv

load_dotenv()

class NewsData:
    def __init__(self, company_name):
        self.company_name = company_name
        self.api_key = str(os.getenv("NEWSAPI_ORG_API_KEY"))
        self.news_data = None

    def fetch_news(self):
        parameters_news = {
            "qInTitle": self.company_name,
            "apiKey": self.api_key
        }
        response_news = requests.get(url="https://newsapi.org/v2/everything", params=parameters_news)
        response_news.raise_for_status()
        self.news_data = response_news.json()
        return self.news_data

    def print_news(self):
        if not self.news_data:
            self.fetch_news()

        for i in range(min(3, len(self.news_data["articles"]))):
            print(f"Title : {self.news_data['articles'][i]['title']}")
            print(f"Description : {self.news_data['articles'][i]['description']}")
            print("\n")
