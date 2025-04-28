// Global variable to store parsed CSV data
let stockData = [];

// Load CSV data when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Use PapaParse to fetch and parse the CSV file
    Papa.parse('./assets/js/results.csv', {
        header: true,
        download: true,
        skipEmptyLines: true,
        complete: function(results) {
            stockData = results.data;
            console.log('CSV data loaded:', stockData);
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
        }
    });

    // Add event listener for the Enter key in the search input
    document.getElementById('stockInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchStock();
        }
    });
});

// Function to search for stock recommendations
function searchStock() {
    const stockSymbol = document.getElementById('stockInput').value.trim().toUpperCase();
    const resultArea = document.getElementById('resultArea');
    
    // Clear previous results
    resultArea.innerHTML = '';
    
    if (!stockSymbol) {
        resultArea.innerHTML = '<p class="error-message">Please enter a stock symbol</p>';
        resultArea.classList.add('visible');
        return;
    }
    
    // Check if data is loaded
    if (stockData.length === 0) {
        resultArea.innerHTML = '<p class="error-message">Still loading data, please try again in a moment</p>';
        resultArea.classList.add('visible');
        return;
    }
    
    // Debug CSV data structure
    console.log('Searching for:', stockSymbol);
    console.log('Available keys:', stockData.length > 0 ? Object.keys(stockData[0]) : 'No data');
    console.log('First few records:', stockData.slice(0, 3)); // Log first 3 records to see structure
    
    // Find the stock in our data with a more flexible approach
    let stock = null;
    
    // Try to find the stock by checking all possible property keys case-insensitively
    for (const item of stockData) {
        // Check each property of the item
        for (const key in item) {
            if (typeof item[key] === 'string' && 
                (key.toLowerCase().includes('stock') || key.toLowerCase() === 'symbol' || key.toLowerCase() === 'ticker')) {
                
                if (item[key].trim().toUpperCase() === stockSymbol) {
                    stock = item;
                    console.log('Match found in field:', key);
                    break;
                }
            }
        }
        if (stock) break;
    }
    
    // If still not found, try a more permissive approach (partial matches)
    if (!stock) {
        console.log('Exact match not found, trying fuzzy search');
        for (const item of stockData) {
            // Try more permissive matching on common stock fields
            const stockFields = Object.keys(item).filter(key => 
                key.toLowerCase().includes('stock') || 
                key.toLowerCase() === 'symbol' || 
                key.toLowerCase() === 'ticker');
            
            for (const field of stockFields) {
                if (typeof item[field] === 'string' && 
                    item[field].trim().toUpperCase().includes(stockSymbol)) {
                    stock = item;
                    console.log('Fuzzy match found in field:', field);
                    break;
                }
            }
            if (stock) break;
        }
    }
    
    if (stock) {
        // Create recommendation card
        // Check if Recommendation field exists and handle various possible field names
        let recommendation = 'Unknown';
        let recommendClass = 'recommend-neutral';
        
        // Find the recommendation field (handle various possible names)
        const recommendField = Object.keys(stock).find(key => 
            key.toLowerCase().includes('recommend') || key.toLowerCase().includes('action'));
            
        if (recommendField) {
            const recValue = stock[recommendField].toLowerCase();
            recommendation = (recValue.includes('yes') || recValue.includes('buy')) ? 'Buy' : 'Hold/Avoid';
            recommendClass = (recValue.includes('yes') || recValue.includes('buy')) ? 'recommend-buy' : 'recommend-avoid';
        }
        
        // Find votes or confidence field
        const votesField = Object.keys(stock).find(key => 
            key.toLowerCase().includes('vote') || key.toLowerCase().includes('confidence'));
        const votes = votesField ? parseInt(stock[votesField]) || 1 : 1;
        
        const resultCard = `
            <div class="recommendation-card ${recommendClass}">
                <h2>${stockSymbol}</h2>
                <div class="recommendation">
                    <span class="label">Recommendation:</span>
                    <span class="value">${recommendation}</span>
                </div>
                <div class="confidence">
                    <span class="label">Confidence:</span>
                    <span class="value">${getConfidenceText(votes)}</span>
                    <div class="confidence-bar">
                        <div class="confidence-level" style="width: ${Math.min(votes * 25, 100)}%"></div>
                    </div>
                </div>
            </div>
        `;
        
        resultArea.innerHTML = resultCard;
        resultArea.classList.add('visible');
    } else {
        // Enhanced error message with debugging information
        resultArea.innerHTML = `
            <p class="error-message">No data available for ${stockSymbol}</p>
            <p class="debug-info">Please check if the symbol is correct and try again.</p>
        `;
        resultArea.classList.add('visible');
        console.log('Available stocks:', stockData.slice(0, 10).map(item => {
            // Get the most likely stock identifier field
            const stockField = Object.keys(item).find(k => 
                k.toLowerCase().includes('stock') || 
                k.toLowerCase() === 'symbol' || 
                k.toLowerCase() === 'ticker') || Object.keys(item)[0];
            return item[stockField];
        }));
    }
}

// Helper function to get confidence text based on votes
function getConfidenceText(votes) {
    if (votes >= 4) return 'High';
    if (votes >= 2) return 'Medium';
    return 'Low';
}
