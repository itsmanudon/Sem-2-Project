import pandas as pd
from statistics import mean, median, stdev
import numpy as np
import os

def analyze_stock(csv_path):
    """
    Analyze stock performance from a CSV file and provide a recommendation based on historical data.
    Parameters:
        csv_path (str): The file path to a CSV file containing stock market data. The CSV is expected to have columns for prices ('adj close' or 'close')
                        and 'volume'. The function handles column names in a case-insensitive manner.
    Returns:
        tuple or str:
            - If valid and sufficient data is provided, returns a tuple (recommendation, votes_up) where:
                recommendation (str): "Yes" if the computed vote count is 4 or more, otherwise "No".
                votes_up (int): The total count of positive signals derived from historical and current data comparisons.
            - If required price or volume columns are missing, returns the string "Invalid".
            - If the provided data does not have at least 6 data points for both price and volume, returns "Insufficient Data".
            - In case of any exceptions during processing, returns a string with the error message prefixed by 'Error:'.
    Notes:
        - The function calculates statistical metrics (mean, median, standard deviation) on historical price data.
        - It evaluates various conditions including:
            • Whether the mean or median of historical prices is greater than the current price.
            • Whether the current price is within one standard deviation below the mean.
            • Whether the current volume exceeds the average of historical volumes.
            • Whether there is an uptrend in recent historical prices based on consecutive increases and a positive slope of the last 5 price points.
        - It relies on external libraries: pandas, numpy, and statistical functions (mean, median, stdev) from the statistics module.
    """
    try:
        df = pd.read_csv(csv_path)
        df.columns = [col.lower().strip() for col in df.columns]

        if 'adj close' in df.columns:
            price_col = 'adj close'
        elif 'close' in df.columns:
            price_col = 'close'
        else:
            return "Invalid"

        if 'volume' not in df.columns:
            return "Invalid"

        prices = df[price_col].dropna().tolist()
        volumes = df['volume'].dropna().tolist()

        if len(prices) < 6 or len(volumes) < 6:
            return "Insufficient Data"

        current_price = prices[-1]
        current_volume = volumes[-1]
        historical_prices = prices[:-1]
        historical_volumes = volumes[:-1]

        m_mean = mean(historical_prices)
        m_median = median(historical_prices)
        m_std = stdev(historical_prices)
        avg_volume = mean(historical_volumes)

        votes_up = 0
        if m_mean > current_price:
            votes_up += 1
        if m_median > current_price:
            votes_up += 1
        if current_price < m_mean and abs(current_price - m_mean) <= m_std:
            votes_up += 1
        if current_volume > avg_volume:
            votes_up += 1
        if historical_prices[-1] > historical_prices[-2] > historical_prices[-3]:
            votes_up += 1

        x = np.arange(5)
        y = np.array(historical_prices[-5:])
        slope = np.polyfit(x, y, 1)[0]
        if slope > 0:
            votes_up += 1

        return "Yes" if votes_up >= 4 else "No", votes_up

    except Exception as e:
        return f"Error: {str(e)}"

def analyze_all_csvs(folder_path="D:\Github Repos\Sem-2-Project\stock-data-csv-files", output_csv='results.csv'):
    results = []

    for file in os.listdir(folder_path):
        if file.endswith(".csv"):
            filepath = os.path.join(folder_path, file)
            result = analyze_stock(filepath)
            if isinstance(result, tuple):
                prediction, votes = result
            else:
                prediction = result
                votes = "-"
            results.append({"Filename": file, "Prediction": prediction, "Votes": votes})

    # Save results to new CSV
    result_df = pd.DataFrame(results)
    output_path = os.path.join(folder_path, output_csv)
    result_df.to_csv(output_path, index=False)
    print(f"✅ Results saved to: {output_path}")

# --- Run from terminal ---
if __name__ == "__main__":
    # folder_path = input("📁`` Enter the folder path with CSV files: ")
    analyze_all_csvs()
