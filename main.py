from API import stock_data as stock_api
from API import news_data as news_api
from StockProcessing.data_processor import DataProcessor
from StockProcessing.visualizer import StockVisualizer
import pandas as pd
import os

def ensure_directory_exists(directory_path):
    """Ensure the specified directory exists, create it if it doesn't."""
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

def main():
    # Initialize API objects
    stock = stock_api.StockData()
    news = news_api.NewsData(stock.company_name)
    
    # Ensure the output directory exists
    ensure_directory_exists("website/images")
    
    # Process the stock data
    processor = DataProcessor("stock_data.csv")
    stock_df, ticker = processor.process_csv_data()
    
    # Save the processed data
    processed_file = processor.save_processed_data()
    print(f"Processed stock data saved to: {processed_file}")
    
    # Create visualizations
    visualizer = StockVisualizer()
    chart_path = visualizer.plot_stock_data(stock_df, ticker)
    
    print(f"Processed stock data for {ticker} and created chart at '{chart_path}'")
    
    # Example of how to fetch additional data and create more visualizations:
    # 
    # # Fetch news data
    # news_data = news.fetch_news()
    # print(f"Fetched {len(news_data)} news articles")
    # 
    # # Get price change data
    # price_changes = stock.get_price_change()
    # print(f"Price change: {price_changes}")

if __name__ == "__main__":
    main()