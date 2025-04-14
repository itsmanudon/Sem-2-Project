import pandas as pd

def stock_prediction_algorithm(csv_file, prediction_days=5):
    """
    Simple stock prediction algorithm using mean and median calculations.
    
    Args:
        csv_file (str): Path to the CSV file containing stock data
        prediction_days (int): Number of days to predict into the future
        
    Returns:
        dict: Contains prediction results and analysis metrics
    """
    
    # Load the stock data
    try:
        df = pd.read_csv(csv_file)
        # Convert date column to datetime if it exists
        if 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'])
            df.set_index('Date', inplace=True)
    except Exception as e:
        return {"error": f"Failed to load CSV file: {str(e)}"}
    
    # Ensure we have the required columns
    required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        return {"error": f"Missing required columns: {', '.join(missing_cols)}"}
    
    # Calculate basic statistics
    results = {
        'last_date': df.index[-1].strftime('%Y-%m-%d'),
        'last_close': df['Close'].iloc[-1],
        'analysis_period_days': len(df),
    }
    
    # Calculate mean and median for different time windows
    time_windows = [7, 30, 90, 180]  # days
    
    for window in time_windows:
        if len(df) >= window:
            window_df = df.iloc[-window:]
            results[f'mean_close_{window}d'] = window_df['Close'].mean()
            results[f'median_close_{window}d'] = window_df['Close'].median()
            results[f'mean_volume_{window}d'] = window_df['Volume'].mean()
            results[f'median_volume_{window}d'] = window_df['Volume'].median()
    
    # Simple prediction based on recent trends
    if len(df) >= 30:  # Need at least 30 days of data for prediction
        recent_close = df['Close'].iloc[-30:]
        recent_volume = df['Volume'].iloc[-30:]
        
        # Calculate daily returns
        daily_returns = recent_close.pct_change().dropna()
        
        # Prediction: Assume average daily return continues
        avg_daily_return = daily_returns.mean()
        current_price = df['Close'].iloc[-1]
        
        predictions = []
        for day in range(1, prediction_days + 1):
            predicted_price = current_price * (1 + avg_daily_return) ** day
            predictions.append({
                'day': day,
                'date': (df.index[-1] + pd.Timedelta(days=day)).strftime('%Y-%m-%d'),
                'predicted_close': round(predicted_price, 2),
                'confidence': 'low'  # Simple mean-based predictions have low confidence
            })
        
        results['predictions'] = predictions
        results['prediction_method'] = f"Mean daily return ({avg_daily_return*100:.2f}%) projection"
    
    # Add volatility measurement
    if len(df) >= 10:
        results['volatility_10d'] = df['Close'].iloc[-10:].std()
    if len(df) >= 30:
        results['volatility_30d'] = df['Close'].iloc[-30:].std()
    
    return results

# Example usage
if __name__ == "__main__":
    # Replace with your actual CSV file path
    csv_path = "D:\Github Repos\Sem-2-Project\stock-data-csv-files\AAPL_processed.csv"  
    results = stock_prediction_algorithm(csv_path)
    
    print("Stock Prediction Results:")
    for key, value in results.items():
        if key == 'predictions':
            print("\nFuture Predictions:")
            for pred in value:
                print(f"Day {pred['day']} ({pred['date']}): ${pred['predicted_close']} ({pred['confidence']} confidence)")
        else:
            print(f"{key.replace('_', ' ').title()}: {value}")