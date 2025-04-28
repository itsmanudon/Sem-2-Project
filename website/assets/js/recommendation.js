
let stockData = {};
let dataLoaded = false;

function loadCSV() {
  const resultArea = document.getElementById('resultArea');
  resultArea.innerHTML = '<span class="loading">Loading recommendation data...</span>';
  
  Papa.parse("./stock-data-csv-files/results.csv", {
    download: true,
    header: true,
    complete: function(results) {
      results.data.forEach(row => {
        if (row.Stock && row.Recommendation) {
          stockData[row.Stock.trim().toUpperCase()] = row.Recommendation.trim();
        }
      });
      dataLoaded = true;
      resultArea.innerHTML = '<span class="success">Recommendation data loaded successfully!</span>';
    },
    error: function(error) {
      resultArea.innerHTML = `<span class="error">Error loading data: ${error}</span>`;
    }
  });
}

function searchStock() {
  const stockInput = document.getElementById('stockInput').value.trim().toUpperCase();
  const resultArea = document.getElementById('resultArea');
  resultArea.style.opacity = 0;

  setTimeout(() => {
    if (!dataLoaded) {
      resultArea.innerHTML = '<span class="error">Please wait for the recommendation data to load.</span>';
    } else if (stockInput === '') {
      resultArea.innerHTML = '<span class="not-found">Please enter a stock symbol.</span>';
    } else if (stockData.hasOwnProperty(stockInput)) {
      if (stockData[stockInput] === 'Yes') {
        resultArea.innerHTML = `<span class="recommended">${stockInput} is Recommended ✅</span>`;
      } else {
        resultArea.innerHTML = `<span class="not-recommended">${stockInput} is Not Recommended ❌</span>`;
      }
    } else {
      resultArea.innerHTML = `<span class="not-found">${stockInput} not found in our recommendation list.</span>`;
    }
    resultArea.style.opacity = 1;
  }, 200);
}

window.onload = loadCSV;
