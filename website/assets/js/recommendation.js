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
            
            // Populate the stock cards once data is loaded
            populateStockCards();
            
            // Setup filter buttons
            setupFilterButtons();
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
            document.querySelector('.loading-indicator').textContent = 'Error loading recommendations. Please try again later.';
        }
    });

    // Add event listener for the Enter key in the search input
    document.getElementById('stockInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchStock();
        }
    });
});

// Function to populate stock cards
function populateStockCards() {
    const stocksContainer = document.getElementById('stocksContainer');
    
    if (!stocksContainer) return;
    
    // Clear loading indicator
    stocksContainer.innerHTML = '';
    
    if (stockData.length === 0) {
        stocksContainer.innerHTML = '<div class="no-results">No recommendations available.</div>';
        return;
    }
    
    // Create stock cards
    stockData.forEach(stock => {
        // Get stock symbol
        const stockSymbol = getStockSymbol(stock);
        if (!stockSymbol) return; // Skip if no symbol found
        
        // Get recommendation
        const recommendation = getRecommendation(stock);
        const isRecommended = recommendation.toLowerCase() === 'yes' || recommendation.toLowerCase() === 'buy';
        
        // Get votes
        const votes = getVotes(stock);
        
        // Create card element
        const card = document.createElement('div');
        card.className = `stock-card ${isRecommended ? 'buy-recommendation' : 'avoid-recommendation'}`;
        card.dataset.symbol = stockSymbol;
        card.dataset.recommendation = isRecommended ? 'buy' : 'avoid';
        
        card.innerHTML = `
            <div class="stock-symbol">${stockSymbol}</div>
            <div class="stock-recommendation">
                <span class="recommendation-label">Recommendation:</span>
                <span class="recommendation-value ${isRecommended ? 'buy' : 'avoid'}">${isRecommended ? 'Buy' : 'Avoid'}</span>
            </div>
            <div class="votes-info">
                <i class="fas fa-users"></i> ${votes} ${votes === 1 ? 'vote' : 'votes'}
            </div>
        `;
        
        stocksContainer.appendChild(card);
    });
}

// Helper functions to extract data from stock objects
function getStockSymbol(stock) {
    // Find the stock symbol field
    const stockField = Object.keys(stock).find(key => 
        key.toLowerCase() === 'stock' || 
        key.toLowerCase() === 'symbol' || 
        key.toLowerCase() === 'ticker');
    
    return stockField ? stock[stockField].trim().toUpperCase() : null;
}

function getRecommendation(stock) {
    // Find the recommendation field
    const recommendField = Object.keys(stock).find(key => 
        key.toLowerCase().includes('recommend') || 
        key.toLowerCase() === 'action');
    
    return recommendField ? stock[recommendField] : '';
}

function getVotes(stock) {
    // Find the votes field
    const votesField = Object.keys(stock).find(key => 
        key.toLowerCase().includes('vote') || 
        key.toLowerCase() === 'confidence');
    
    return votesField ? parseInt(stock[votesField]) || 0 : 0;
}

// Setup filter buttons
function setupFilterButtons() {
    const allBtn = document.getElementById('allStocksBtn');
    const buyBtn = document.getElementById('buyStocksBtn');
    const avoidBtn = document.getElementById('avoidStocksBtn');
    
    if (!allBtn || !buyBtn || !avoidBtn) return;
    
    // All stocks button
    allBtn.addEventListener('click', function() {
        filterStocks('all');
        setActiveButton(this);
    });
    
    // Buy recommendations button
    buyBtn.addEventListener('click', function() {
        filterStocks('buy');
        setActiveButton(this);
    });
    
    // Avoid recommendations button
    avoidBtn.addEventListener('click', function() {
        filterStocks('avoid');
        setActiveButton(this);
    });
}

// Filter stocks based on recommendation
function filterStocks(filter) {
    const stockCards = document.querySelectorAll('.stock-card');
    
    stockCards.forEach(card => {
        if (filter === 'all') {
            card.style.display = '';
        } else {
            card.style.display = card.dataset.recommendation === filter ? '' : 'none';
        }
    });
    
    // Show "no results" message if all cards are hidden
    const stocksContainer = document.getElementById('stocksContainer');
    const visibleCards = document.querySelectorAll('.stock-card[style="display: none;"]');
    const noResultsMsg = document.querySelector('.no-results');
    
    if (visibleCards.length === stockCards.length && filter !== 'all') {
        if (!noResultsMsg) {
            const msgElement = document.createElement('div');
            msgElement.className = 'no-results';
            msgElement.textContent = `No ${filter === 'buy' ? 'buy' : 'avoid'} recommendations found.`;
            stocksContainer.appendChild(msgElement);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Set active button
function setActiveButton(button) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
}

// Original search function
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
