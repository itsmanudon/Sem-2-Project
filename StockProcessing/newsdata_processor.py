import json
import os
import pandas as pd

class NewsDataProcessor:
    """
    Class for processing news data from raw JSON data.
    """
    def __init__(self, json_file=None, company_name=None):
        """
        Initialize the NewsDataProcessor with an optional JSON file.
        
        Args:
            json_file (str, optional): Path to the JSON file. Defaults to None.
        """
        self.json_file = json_file
        self.processed_df = None
        self.company_name = company_name

    def process_json_to_dataframe(self, json_data):
        """
        Process news data from raw JSON.
        
        Args:
            json_data (dict): Raw JSON data containing news articles
            
        Returns:
            pandas.DataFrame: Processed news dataframe
        """
        # Check if the JSON has the expected structure
        if 'results' not in json_data:
            raise ValueError("Invalid JSON structure: 'results' key not found.")
        
        # Extract news articles
        articles = json_data['results']

        # Assign self.processed_df to the processed DataFrame
        self.processed_df = pd.DataFrame(articles)
        
        # Convert to DataFrame
        return pd.DataFrame(articles)
    
    def extract_image_urls(self):
        """
        Extract the image URL from the article.
        
        Args:
            article (dict): A single article dictionary
        
        Returns:
            str: Image URL or None if not found
        """
        if self.processed_df is None:
            raise ValueError("No processed data available. Run process_json_data first.")
            
        image_urls = []
            
        # Check if 'image_url' column exists in DataFrame
        if 'image_url' in self.processed_df.columns:
            image_urls = self.processed_df['image_url'].tolist()
        # Check if images might be in a nested structure
        elif 'image' in self.processed_df.columns:
            image_urls = self.processed_df['image'].apply(
                lambda x: x.get('url') if isinstance(x, dict) else None
            ).tolist()
            
        return image_urls
    
    def save_processed_data_as_CSV(self, output_file=None):
        """
        Save the processed DataFrame to a CSV file.
        
        Args:
            output_file (str, optional): Path to save the CSV. If None, uses company_name_news.csv.
            
        Returns:
            str: Path to the saved file
        """
        if self.processed_df is None:
            raise ValueError("No processed data available. Run process_json_data first.")
        
        # Determine output filename
        if output_file is None:
            # Ensure the directory exists
            os.makedirs("news-data-csv-files", exist_ok=True)
            filename = f"{self.company_name}_news.csv" if self.company_name else "unknown_news.csv"
            output_file = f"news-data-csv-files/{filename}"
        
        # Save to CSV
        self.processed_df.to_csv(output_file, index=False)
        
        return output_file