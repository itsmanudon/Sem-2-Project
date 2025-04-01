"""
Stock Visualizer Module
----------------------
This module contains the StockVisualizer class for creating professional stock charts.
"""

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import seaborn as sns
import numpy as np
import pandas as pd

class StockVisualizer:
    """
    Class for creating professional stock market visualizations.
    """
    
    def __init__(self, output_dir='website/images'):
        """
        Initialize the StockVisualizer.
        
        Args:
            output_dir (str, optional): Directory to save generated charts. Defaults to 'website/images'.
        """
        self.output_dir = output_dir
    
    def plot_stock_data(self, df, ticker, filename=None):
        """
        Create a professional stock trading chart using the provided data.
        
        Args:
            df (pandas.DataFrame): DataFrame with stock data (must have Date, Open, High, Low, Close, Volume columns)
            ticker (str): Stock ticker symbol
            filename (str, optional): Output filename. If None, uses 'stock_chart.png'.
            
        Returns:
            str: Path to the created chart
        """
        # Validate input data
        required_columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']
        for col in required_columns:
            if col not in df.columns:
                raise ValueError(f"DataFrame must contain the column: {col}")
        
        # Set the style for the plot
        plt.style.use('dark_background')
        
        # Create a figure and axis with specific size
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Plot the closing price
        ax.plot(df['Date'], df['Close'], linewidth=2, color='#00FFFF', label='Close Price')
        
        # Add a shaded region for the price range (High to Low)
        ax.fill_between(df['Date'], df['Low'], df['High'], alpha=0.3, color='#7FFFD4')
        
        # Configure the plot
        ax.set_title(f'{ticker} Stock Price', fontsize=18, color='white', fontweight='bold', pad=20)
        ax.set_xlabel('Date', fontsize=14, color='white', labelpad=10)
        ax.set_ylabel('Price ($)', fontsize=14, color='white', labelpad=10)
        
        # Configure the grid
        ax.grid(True, linestyle='--', alpha=0.7, color='#555555')
        
        # Configure the background
        ax.set_facecolor('#1F1F1F')
        fig.patch.set_facecolor('#121212')
        
        # Format the x-axis dates
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        plt.xticks(rotation=45)
        
        # Only show a subset of dates to avoid overcrowding
        ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=4))
        
        # Format the y-axis to show dollar amounts
        ax.yaxis.set_major_formatter('${x:,.2f}')
        
        # Add a volume chart at the bottom with alpha transparency
        volume_ax = ax.twinx()
        volume_ax.bar(df['Date'], df['Volume'], alpha=0.3, color='#FF6B6B', width=1.5)
        volume_ax.set_ylabel('Volume', color='#FF6B6B', fontsize=12, labelpad=10)
        volume_ax.tick_params(axis='y', colors='#FF6B6B')
        
        # Scale the volume axis to make it fit nicely
        volume_max = df['Volume'].max()
        price_range = df['High'].max() - df['Low'].min()
        volume_ax.set_ylim(0, volume_max * price_range / df['Close'].max() * 2)
        
        # Add legend
        ax.legend(loc='upper left')
        
        # Add a horizontal line at the most recent closing price
        latest_close = df['Close'].iloc[-1]
        ax.axhline(y=latest_close, color='#FFFFFF', linestyle='--', alpha=0.5)
        ax.text(df['Date'].iloc[0], latest_close, f' ${latest_close:.2f}', 
                color='white', verticalalignment='bottom')
        
        # Set tight layout
        plt.tight_layout()
        
        # Determine output filename
        if filename is None:
            filename = 'stock_chart.png'
        
        # Create the full output path
        output_path = f"{self.output_dir}/{filename}"
        
        # Save the figure
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return output_path
    
    def plot_comparison(self, dfs, tickers, filename='comparison_chart.png'):
        """
        Create a chart comparing multiple stocks.
        
        Args:
            dfs (list): List of DataFrames containing stock data
            tickers (list): List of ticker symbols corresponding to dfs
            filename (str, optional): Output filename. Defaults to 'comparison_chart.png'.
            
        Returns:
            str: Path to the created chart
        """
        # Validate input
        if len(dfs) != len(tickers):
            raise ValueError("Number of DataFrames must match number of tickers")
        
        # Set the style for the plot
        plt.style.use('dark_background')
        
        # Create a figure with specific size
        fig, ax = plt.subplots(figsize=(14, 8))
        
        # Plot each stock with a different color
        colors = ['#00FFFF', '#FF6B6B', '#7FFFD4', '#FFD700', '#FF00FF']
        
        for i, (df, ticker) in enumerate(zip(dfs, tickers)):
            # Normalize to percentage change from first day for fair comparison
            first_close = df['Close'].iloc[0]
            normalized = (df['Close'] / first_close - 1) * 100
            
            color = colors[i % len(colors)]
            ax.plot(df['Date'], normalized, linewidth=2, color=color, label=ticker)
        
        # Configure the plot
        ax.set_title('Stock Price Comparison (% Change)', fontsize=18, color='white', fontweight='bold', pad=20)
        ax.set_xlabel('Date', fontsize=14, color='white', labelpad=10)
        ax.set_ylabel('Percent Change (%)', fontsize=14, color='white', labelpad=10)
        
        # Configure the grid
        ax.grid(True, linestyle='--', alpha=0.7, color='#555555')
        
        # Configure the background
        ax.set_facecolor('#1F1F1F')
        fig.patch.set_facecolor('#121212')
        
        # Format the x-axis dates
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        plt.xticks(rotation=45)
        
        # Add a horizontal line at 0% change
        ax.axhline(y=0, color='#FFFFFF', linestyle='-', alpha=0.3)
        
        # Add legend
        ax.legend(loc='upper left')
        
        # Set tight layout
        plt.tight_layout()
        
        # Create the full output path
        output_path = f"{self.output_dir}/{filename}"
        
        # Save the figure
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return output_path 