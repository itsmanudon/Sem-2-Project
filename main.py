from API import stock_data as stock_api
from API import news_data as news_api

def main():
    stock = stock_api.StockData()
    news = news_api.NewsData(stock.company_name)
    print(stock.fetch_stock_data())
    print(stock.get_price_change())
    print(news.fetch_news())


if __name__== "__main__":
    main()