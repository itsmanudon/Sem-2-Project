import pandas as pd
import os

import matplotlib.pyplot as plt

class PieChart:
    def __init__(self, csv_file_path):
        """
        Initialize the PieChart class with a path to a CSV file.
        
        Parameters:
        -----------
        csv_file_path : str
            Path to the CSV file to be processed
        """
        self.csv_file_path = csv_file_path
        self.data = None
        self.load_data()
        
    def load_data(self):
        """Load data from CSV file"""
        try:
            self.data = pd.read_csv(self.csv_file_path)
        except Exception as e:
            print(f"Error loading CSV file: {e}")
            
    def create_pie_chart(self, column_name, title=None, figsize=(8, 8)):
        """
        Create a pie chart using matplotlib.
        
        Parameters:
        -----------
        column_name : str
            Column to use for creating the pie chart
        title : str, optional
            Title for the graph
        figsize : tuple, default=(8, 8)
            Size of the figure
            
        Returns:
        --------
        matplotlib.figure.Figure
            The figure containing the pie chart
        """
        if self.data is None:
            print("No data available to plot")
            return None
        
        if column_name not in self.data.columns:
            print(f"Column '{column_name}' not found in the data")
            return None
        
        if title is None:
            file_name = os.path.basename(self.csv_file_path)
            title = f"Pie Chart of {column_name} from {file_name}"
        
        plt.figure(figsize=figsize)
        
        # Creating pie chart
        counts = self.data[column_name].value_counts()
        
        # If there are more than 10 categories, only show top 10
        if len(counts) > 10:
            other = pd.Series({'Others': counts[10:].sum()})
            counts = pd.concat([counts[:10], other])
        
        # Create pie chart with better text alignment
        wedges, texts, autotexts = plt.pie(counts, 
                         labels=counts.index,
                         autopct='%1.1f%%',
                         startangle=90,
                         pctdistance=0.85,
                         labeldistance=1.1)
        
        # Enhance text properties
        plt.setp(autotexts, size=8, weight="bold")
        plt.setp(texts, size=8)
        
        # Add legend if there are many categories
        if len(counts) > 5:
            plt.legend(wedges, counts.index,
                  title=column_name,
                  loc="center left",
                  bbox_to_anchor=(1, 0, 0.5, 1))
        
        plt.title(title, fontsize=16, pad=20)
        plt.tight_layout()
        
        return plt.gcf()
    
    def save_graph(self, output_path=None, dpi=300):
        """
        Save the current graph to a file.
        
        Parameters:
        -----------
        output_path : str, optional
            Path to save the graph to. If None, will use the column name.
        dpi : int, default=300
            DPI (dots per inch) for the saved image
        """
        if output_path is None:
            column_name = 'default_column'  # Replace with a default column or handle differently
            output_path = f"{column_name}_pie_chart.png"
        
        plt.savefig(output_path, dpi=dpi)
        print(f"Graph saved to {output_path}")
    
    def show_graph(self):
        """Display the graph"""
        plt.show()

if __name__ == "__main__":
    # Example usage
    csv_file = "example.csv"  # Replace with your CSV file path
    
    # Create a dummy CSV file for testing
    data = {'Category': ['A', 'B', 'A', 'C', 'B', 'B'],
            'Value': [10, 15, 7, 12, 9, 11]}
    df = pd.DataFrame(data)
    df.to_csv(csv_file, index=False)
    
    pie_chart = PieChart(csv_file)
    pie_chart.create_pie_chart(column_name='Category', title='Category Distribution')
    pie_chart.show_graph()
    # pie_chart.save_graph(output_path='category_pie_chart.png')