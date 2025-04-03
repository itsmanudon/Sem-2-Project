import pandas as pd
import seaborn as sns
import os
from pathlib import Path
from matplotlib.lines import Line2D

import matplotlib.pyplot as plt


class BarGraph:
    def __init__(self, csv_file_path):
        """
        Initialize the BarGraph with a CSV file path.

        Parameters:
        -----------
        csv_file_path : str
            Path to the CSV file containing stock data.
        """
        self.csv_file_path = csv_file_path
        self.data = None
        self.company_name = None
        self.load_data()

    def load_data(self):
        """Load data from CSV file"""
        try:
            self.data = pd.read_csv(self.csv_file_path)
            # Convert 'Date' column to datetime if it exists
            if 'Date' in self.data.columns:
                self.data['Date'] = pd.to_datetime(self.data['Date'])
        except Exception as e:
            print(f"Error loading CSV file: {e}")

    def create_bar_graph(self, title=None, figsize=(12, 8)):
        """
        Create a bar graph with a KDE plot for volume vs stock price.

        Parameters:
        -----------
        title : str, optional
            Title for the graph. If None, uses company name.
        figsize : tuple, default=(12, 8)
            Figure size (width, height) in inches.

        Returns:
        --------
        matplotlib.figure.Figure
            The figure containing the bar graph.
        """
        if self.data is None:
            print("No data available to plot.")
            return None

        if title is None:
            title = f"{self.company_name} - Volume vs Stock Price"

        plt.figure(figsize=figsize)
        
        # Plot volume as bars
        ax1 = plt.gca()
        sns.barplot(x=self.data['Date'], y=self.data['Volume'], alpha=0.5, ax=ax1, color='skyblue')
        ax1.set_ylabel('Volume', fontsize=12)
        ax1.set_xlabel('')
        ax1.tick_params(axis='x', rotation=45)

        # Create a second y-axis for price
        ax2 = ax1.twinx()

        # Plot KDE for the closing price
        # sns.kdeplot(data=self.data, x='Date', y='Close', fill=True, cmap="Reds", 
        #             alpha=0.7, ax=ax2, levels=20)
        # ax2.set_ylabel('Close Price', fontsize=12)

        # Set title and adjust layout
        plt.title(title, fontsize=16)
        plt.tight_layout()

        return plt.gcf()

    def save_graph(self, output_path=None, dpi=300):
        """
        Save the current graph to a file.

        Parameters:
        -----------
        output_path : str, optional
            Path to save the graph. If None, uses the company name.
        dpi : int, default=300
            DPI (dots per inch) for the saved image.
        """
        if output_path is None:
            output_path = f"{self.company_name}_bar_graph.png"

        plt.savefig(output_path, dpi=dpi)
        print(f"Graph saved to {output_path}")

    def show_graph(self):
        """Display the graph."""
        plt.show()


if __name__ == "__main__":
    # Example usage
    csv_path = "stock-data-csv-files/AAPL.csv"  # Replace with actual CSV file path
    bar_graph = BarGraph(csv_path)
    bar_graph.create_bar_graph()
    bar_graph.show_graph()