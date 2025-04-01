"""
Data Processor Module
--------------------
This module contains the DataProcessor class for processing stock data from various formats.
"""

import pandas as pd
import json
from datetime import datetime

class DataProcessor:
    """
    Class for processing stock data from CSV files and other sources.
    """
    
    def __init__(self, data_file=None):
        """
        Initialize the DataProcessor with an optional data file.
        
        Args:
            data_file (str, optional): Path to the data file. Defaults to None.
        """
        self.data_file = data_file
        self.processed_df = None
        self.ticker = None
    
    def process_csv_data(self, csv_file=None):
        """
        Process stock data from a non-standard CSV format with JSON-like strings.
        
        Args:
            csv_file (str, optional): Path to the CSV file. If None, uses self.data_file.
            
        Returns:
            tuple: (processed_dataframe, ticker_symbol)
        """
        # Use provided file or the instance data_file
        file_to_process = csv_file if csv_file else self.data_file
        if not file_to_process:
            raise ValueError("No data file specified.")
        
        # Read the raw CSV data
        raw_df = pd.read_csv(file_to_process, header=None)
        
        # Extract stock ticker
        ticker = raw_df.iloc[2, 0]
        
        # Initialize lists to store data
        dates = []
        open_prices = []
        high_prices = []
        low_prices = []
        close_prices = []
        volumes = []
        
        # Process each row containing stock data (starts from row 6)
        for i in range(6, len(raw_df)):
            if pd.notna(raw_df.iloc[i, 1]):
                try:
                    # Parse the JSON-like string
                    data_str = raw_df.iloc[i, 1]
                    data_dict = json.loads(data_str.replace("'", '"'))
                    
                    # Extract date from previous rows (adjust as needed)
                    if i == 6:  # First data point
                        current_date = raw_df.iloc[3, 0]
                    else:
                        # For subsequent points, we'll use a decreasing date sequence
                        last_date = datetime.strptime(dates[-1], "%Y-%m-%d")
                        current_date = (last_date - pd.Timedelta(days=1)).strftime("%Y-%m-%d")
                    
                    dates.append(current_date)
                    open_prices.append(float(data_dict['1. open']))
                    high_prices.append(float(data_dict['2. high']))
                    low_prices.append(float(data_dict['3. low']))
                    close_prices.append(float(data_dict['4. close']))
                    volumes.append(int(data_dict['5. volume']))
                except Exception as e:
                    print(f"Error processing row {i}: {e}")
        
        # Create a DataFrame with the extracted data
        stock_df = pd.DataFrame({
            'Date': dates,
            'Open': open_prices,
            'High': high_prices,
            'Low': low_prices,
            'Close': close_prices,
            'Volume': volumes
        })
        
        # Convert Date column to datetime
        stock_df['Date'] = pd.to_datetime(stock_df['Date'])
        
        # Sort by date (oldest to newest)
        stock_df = stock_df.sort_values('Date')
        
        # Reset index
        stock_df = stock_df.reset_index(drop=True)
        
        # Store the processed data and ticker
        self.processed_df = stock_df
        self.ticker = ticker
        
        return stock_df, ticker
    
    def save_processed_data(self, output_file=None):
        """
        Save the processed DataFrame to a CSV file.
        
        Args:
            output_file (str, optional): Path to save the CSV. If None, uses ticker_processed.csv.
            
        Returns:
            str: Path to the saved file
        """
        if self.processed_df is None:
            raise ValueError("No processed data available. Run process_csv_data first.")
        
        # Determine output filename
        if output_file is None:
            output_file = f"{self.ticker}_processed.csv"
        
        # Save to CSV
        self.processed_df.to_csv(output_file, index=False)
        
        return output_file 