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
        # --- Constants ---
        MIN_DATA_POINTS = 6
        VOTE_THRESHOLD = 4
        TREND_LOOKBACK = 3 # For consecutive price increase check
        SLOPE_LOOKBACK = 5 # For linear regression slope check

        # --- Load and Prepare Data ---
        df = pd.read_csv(csv_path)
        # Standardize column names
        df.columns = [col.lower().strip() for col in df.columns]

        # --- Data Validation ---
        # Determine the price column ('adj close' preferred over 'close')
        if 'adj close' in df.columns:
            price_col = 'adj close'
        elif 'close' in df.columns:
            price_col = 'close'
        else:
            return "Invalid" # Price column missing

        # Check for volume column
        if 'volume' not in df.columns:
            return "Invalid" # Volume column missing

        # Select, clean, and validate data
        df = df[[price_col, 'volume']].copy() # Use copy to avoid SettingWithCopyWarning
        df[price_col] = pd.to_numeric(df[price_col], errors='coerce')
        df['volume'] = pd.to_numeric(df['volume'], errors='coerce')
        df.dropna(inplace=True) # Remove rows with non-numeric or missing data

        if len(df) < MIN_DATA_POINTS:
            return "Insufficient Data" # Not enough valid data points

        # --- Separate Current and Historical Data ---
        prices = df[price_col]
        volumes = df['volume']

        current_price = prices.iloc[-1]
        current_volume = volumes.iloc[-1]
        historical_prices = prices.iloc[:-1]
        historical_volumes = volumes.iloc[:-1]

        # Ensure enough historical data for all calculations
        min_hist_len = max(TREND_LOOKBACK, SLOPE_LOOKBACK, 2) # Need at least 2 for stdev
        if len(historical_prices) < min_hist_len:
             return "Insufficient Historical Data for Analysis"

        # --- Calculate Historical Metrics ---
        hist_price_mean = historical_prices.mean()
        hist_price_median = historical_prices.median()
        # Use ddof=1 for sample standard deviation, matching statistics.stdev
        hist_price_std = historical_prices.std(ddof=1)
        hist_volume_mean = historical_volumes.mean()

        # Handle potential NaN std dev (if only one historical point, though prevented by len check)
        # or zero std dev (if all historical prices are identical)
        if pd.isna(hist_price_std) or hist_price_std == 0:
            # Cannot reliably use std dev based signal
            hist_price_std = 0 # Set to 0 to prevent errors in comparison

        # --- Voting Logic ---
        votes_up = 0

        # Vote 1: Current price is below historical mean (potential buy low)
        if current_price < hist_price_mean:
            votes_up += 1

        # Vote 2: Current price is below historical median (another measure of central tendency)
        if current_price < hist_price_median:
            votes_up += 1

        # Vote 3: Current price is below mean but within 1 standard deviation
        # Only vote if std > 0, otherwise the comparison is less meaningful
        if hist_price_std > 0 and current_price < hist_price_mean and abs(current_price - hist_price_mean) <= hist_price_std:
             votes_up += 1

        # Vote 4: Current volume is above historical average (increased activity)
        if current_volume > hist_volume_mean:
            votes_up += 1

        # Vote 5: Recent price trend (last TREND_LOOKBACK historical points increasing)
        if len(historical_prices) >= TREND_LOOKBACK:
            recent_prices = historical_prices.iloc[-TREND_LOOKBACK:]
            # Check if prices are strictly increasing: p[-1] > p[-2] > p[-3] ...
            is_trending_up = all(recent_prices.iloc[i] > recent_prices.iloc[i-1] for i in range(1, TREND_LOOKBACK))
            if is_trending_up:
             votes_up += 1

        # Vote 6: Positive slope over the last SLOPE_LOOKBACK historical points (momentum)
        if len(historical_prices) >= SLOPE_LOOKBACK:
            y = historical_prices.iloc[-SLOPE_LOOKBACK:].values
            x = np.arange(SLOPE_LOOKBACK)
            try:
                # Fit a linear regression line (degree 1 polynomial)
                slope = np.polyfit(x, y, 1)[0]
                if slope > 0:
                    votes_up += 1
            except (np.linalg.LinAlgError, ValueError):
            # Handle cases where slope calculation fails (e.g., singular matrix)
            # No vote is added in this case. Consider logging this event.
                pass # print(f"Warning: Slope calculation failed for {csv_path}")

        # --- Final Recommendation ---
        recommendation = "Yes" if votes_up >= VOTE_THRESHOLD else "No"
        return recommendation, votes_up

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
