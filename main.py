from API import stock_data as stock_api
from API import news_data as news_api
from API import newsdata as newsdata_api
from StockProcessing.data_processor import DataProcessor
from StockProcessing.visualizer import StockVisualizer
from StockProcessing.line_graph import LineGraph
from StockProcessing.pie_chart import PieChart
from StockProcessing.newsdata_processor import NewsDataProcessor
import pandas as pd
import os
import json

def ensure_directory_exists(directory_path):
    """Ensure the specified directory exists, create it if it doesn't."""
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

def add_company_details_to_csv():
    """Add company details to a CSV file."""
    with open('companies.json', 'r') as file:
        companies_details = json.load(file)

        for company_detail in companies_details:
            # Initialize API objects
            stock = stock_api.StockData(stock_symbol=company_detail['symbol'], company_name=company_detail['name'])
            
            # Ensure the output directory exists
            ensure_directory_exists("website/images")

            stock_data = stock.fetch_stock_data_json()
            
            # Process the stock data
            processor = DataProcessor()
            csv_file = processor.dict_to_csv(stock_data)
            stock_df, ticker = processor.process_csv_data(csv_file)
            
            # Save the processed data
            processed_file = processor.save_processed_data()
            print(f"Processed stock data saved to: {processed_file}")

def add_specific_comapnies():
    """Add company details to a CSV file."""
    with open('companies.json', 'r') as file:
        companies_details = json.load(file)

        for i in range(2, 3):
            # Initialize API objects
            stock = stock_api.StockData(stock_symbol=companies_details[i]['symbol'], company_name=companies_details[i]['name'])
            
            # Ensure the output directory exists
            ensure_directory_exists("website/images")

            stock_data = stock.fetch_stock_data_json()
            print(stock_data)
            
            # Process the stock data
            processor = DataProcessor()
            csv_file = processor.dict_to_csv(stock_data)
            stock_df, ticker = processor.process_csv_data(csv_file)
            
            # Save the processed data
            processed_file = processor.save_processed_data()
            print(f"Processed stock data saved to: {processed_file}")

def add_news_data():
    """
    Fetch and process news data for companies using the new News API.
    """

    with open('D:\\Github Repos\\Sem-2-Project\\companies.json', 'r') as file:
        companies_details = json.load(file)
        for company_detail in companies_details:
            news_data = newsdata_api.NewsData(stock_symbol=company_detail['symbol'], company_name=company_detail['name'])
            news_json_data = news_data.fetch_news_data()

            if news_json_data is None:
                print(f"Failed to fetch news data for {company_detail['name']}")
                continue

            news_processor = NewsDataProcessor(company_name=company_detail['name'])

            # Convert JSON data to CSV
            news_csv_path = news_processor.process_json_to_dataframe(json_data=news_json_data)
            if news_csv_path is None:
                print(f"Failed to process news data for {company_detail['name']}")
                continue
            print(f"News data converted to CSV: {news_csv_path}")

            # Save the processed news data
            processed_news_file = news_processor.save_processed_data_as_CSV()
            print(f"Processed news data saved to: {processed_news_file}")

            # Image URLs extraction
            # image_urls = news_processor.extract_image_urls()
            # print("Extracted image URLs:")
            # for url in image_urls:
            #     print(f"  {url}")

def main():

    # line_graph = LineGraph(csv_file_path='./stock-data-csv-files/AAPL_processed.csv')
    # line_graph.create_line_graph(x_column='Date', y_column='Close', title='Apple Stock Price')
    # line_graph.show_graph()

    # pie_chart = PieChart(csv_file_path='./stock-data-csv-files/AMZN_processed.csv')
    # pie_chart.create_pie_chart(column_name='Volume', title='Apple Stock Volume Distribution')
    # pie_chart.show_graph()

    # newsdata = newsdata_api.NewsData(stock_symbol="AAPL", company_name="Apple Inc")
    # print(newsdata.fetch_news_data())

    add_specific_comapnies()
    
    #add_news_data()

    
    '''# Create visualizations
    visualizer = StockVisualizer()
    chart_path = visualizer.plot_stock_data(stock_df, ticker)
    
    print(f"Processed stock data for {ticker} and created chart at '{chart_path}'")'''

    
    # Example of how to fetch additional data and create more visualizations:
    # news = news_api.NewsData(company_name="Tesla")
    # news.fetch_news()
    # news.print_news()

    # Fetch news data
    # news_data = news.fetch_news()
    # print(f"Fetched {len(news_data)} news articles")
    
    # Get price change data
    # price_changes = stock.get_price_change()
    # print(f"Price change: {price_changes}")

if __name__ == "__main__":
    main()