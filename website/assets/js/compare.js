const welcomeArea = document.getElementById("welcomeArea");
const logoutArea = document.getElementById("logoutArea");
const loggedInUser = localStorage.getItem("stockviz_loggedInUser");

// Add this to your existing index.js (at the top or in the DOMContentLoaded event)

// Search form functionality
const searchForm = document.getElementById("searchForm");
if (searchForm) {
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const searchInput = this.querySelector('input[type="text"]');
    const searchTerm = searchInput.value.trim().toUpperCase();

    if (searchTerm) {
      // Check if the symbol exists in our stocks list
      const stocks = [
        { symbol: "AAPL" },
        { symbol: "ADBE" },
        { symbol: "BAC" },
        { symbol: "AMZN" },
        { symbol: "CRM" },
        { symbol: "CSCO" },
        { symbol: "DIS" },
        { symbol: "GOOGL" },
        { symbol: "HD" },
        { symbol: "INTC" },
        { symbol: "JNJ" },
        { symbol: "JPM" },
        { symbol: "KO" },
        { symbol: "MA" },
        { symbol: "META" },
        { symbol: "MSFT" },
        { symbol: "NFLX" },
        { symbol: "NVDA" },
        { symbol: "PFE" },
        { symbol: "TSLA" },
        { symbol: "UNH" },
        { symbol: "V" },
        { symbol: "WMT" },
        { symbol: "XOM" },
        { symbol: "PG" },
      ];

      const isValidSymbol = stocks.some((stock) => stock.symbol === searchTerm);

      if (isValidSymbol) {
        // Redirect to markets.html with the symbol as a query parameter
        window.location.href = `markets.html?symbol=${encodeURIComponent(
          searchTerm
        )}`;
      } else {
        alert("Please enter a valid stock symbol from our available list");
      }
    }
  });
}

if (loggedInUser) {
  welcomeArea.textContent = `Welcome, ${loggedInUser}`;
  logoutArea.innerHTML = `
    <button id="logoutBtn" style="
      background: var(--light-green);
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 0.95rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    ">Logout</button>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("stockviz_loggedInUser");
    window.location.reload();
  });
} else {
  welcomeArea.innerHTML = `
    <a href="login.html" style="margin-right: 1rem; font-size: 0.95rem; color: white; text-decoration: none;">Login</a>
    <a href="signup.html" style="background: var(--light-green); padding: 8px 16px; border-radius: 6px; color: white; font-weight: 600; text-decoration: none;">Sign Up</a>
  `;
  logoutArea.innerHTML = ``; // Keep empty
}

// Mobile menu toggle functionality
// This code will toggle the mobile menu when the button is clicked
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector("#navLinks");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const compareBtn = document.getElementById("compareBtn");
  const stock1Select = document.getElementById("stockList1");
  const stock2Select = document.getElementById("stockList2");
  const chartContainer = document.getElementById("chart");
  const rangeButtons = document.querySelectorAll(".time-range-buttons button");

  let stockChart;
  let fullLabels = [];
  let fullStock1Data = [];
  let fullStock2Data = [];

  compareBtn.addEventListener("click", async () => {
    const stock1 = stock1Select.value;
    const stock2 = stock2Select.value;
    chartContainer.innerHTML =
      '<canvas id="comparisonChart"></canvas><canvas id="histogramChart"></canvas>';

    if (
      !stock1 ||
      !stock2 ||
      stock1 === "Select a Stock" ||
      stock2 === "Select a Stock"
    ) {
      chartContainer.innerHTML =
        "<p class='error'>Please select two valid stocks to compare.</p>";
      return;
    }

    if (stock1 === stock2) {
      chartContainer.innerHTML =
        "<p class='error'>Please select two different stocks.</p>";
      return;
    }

    try {
      const [data1, data2] = await Promise.all([
        fetchCSV(`./stock-data-csv-files/${stock1}_processed.csv`),
        fetchCSV(`./stock-data-csv-files/${stock2}_processed.csv`),
      ]);

      fullLabels = data1.map((row) => row.Date);
      fullStock1Data = data1.map((row) => parseFloat(row.Close));
      fullStock2Data = data2.map((row) => parseFloat(row.Close));

      const { labels, stock1Data, stock2Data, sliceStart } =
        filterDataByRange("5Y");

      drawChart(labels, stock1Data, stock2Data, stock1, stock2);
      await drawHistogram(
        stock1,
        stock2,
        stock1Data,
        stock2Data,
        labels,
        sliceStart
      );
    } catch (error) {
      console.error(error);
      chartContainer.innerHTML =
        "<p class='error'>Error loading stock data. Please check console.</p>";
    }
  });

  rangeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const range = button.getAttribute("data-range");
      if (fullLabels.length === 0) return;

      const { labels, stock1Data, stock2Data, sliceStart } =
        filterDataByRange(range);
      const stock1 = stock1Select.value;
      const stock2 = stock2Select.value;

      drawChart(labels, stock1Data, stock2Data, stock1, stock2);
      await drawHistogram(
        stock1,
        stock2,
        stock1Data,
        stock2Data,
        labels,
        sliceStart
      );
    });
  });

  function drawChart(labels, stock1Data, stock2Data, stock1, stock2) {
    if (stockChart) stockChart.destroy();

    const ctx = document.getElementById("comparisonChart").getContext("2d");

    stockChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: `${stock1} Closing Prices`,
            data: stock1Data,
            borderColor: "#00c896",
            backgroundColor: "rgba(0, 200, 150, 0.2)",
            fill: false,
            tension: 0.3,
          },
          {
            label: `${stock2} Closing Prices`,
            data: stock2Data,
            borderColor: "#f05454",
            backgroundColor: "rgba(240, 84, 84, 0.2)",
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#fff",
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#fff",
              maxTicksLimit: 10,
            },
          },
          y: {
            ticks: {
              color: "#fff",
            },
          },
        },
      },
    });
  }

  async function drawHistogram(
    stock1,
    stock2,
    stock1Data,
    stock2Data,
    labels,
    sliceStart
  ) {
    const allStockNames = [...stock1Select.options]
      .map((opt) => opt.value)
      .filter((name) => name !== "Select a Stock");
    const otherStocks = allStockNames.filter(
      (name) => name !== stock1 && name !== stock2
    );

    try {
      const otherDataArray = await Promise.all(
        otherStocks.map((name) =>
          fetchCSV(`./stock-data-csv-files/${name}_processed.csv`)
        )
      );

      const otherAvgArray = [];

      for (let i = 0; i < labels.length; i++) {
        let sum = 0;
        let count = 0;

        for (const stockData of otherDataArray) {
          const val = parseFloat(stockData[sliceStart + i]?.Close);
          if (!isNaN(val)) {
            sum += val;
            count++;
          }
        }

        otherAvgArray.push(count ? sum / count : 0);
      }

      const avg1 = average(stock1Data);
      const avg2 = average(stock2Data);
      const avgOthers = average(otherAvgArray);

      const ctx = document.getElementById("histogramChart").getContext("2d");
      if (window.histogram) window.histogram.destroy();

      window.histogram = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [stock1, stock2, "Market Avg"],
          datasets: [
            {
              label: "Average Valuation",
              data: [avg1, avg2, avgOthers],
              backgroundColor: ["#00c896", "#f05454", "#7289da"],
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: { color: "#fff" },
            },
            y: {
              ticks: { color: "#fff" },
            },
          },
          plugins: {
            legend: {
              labels: { color: "#fff" },
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to calculate histogram:", error);
    }
  }

  function average(arr) {
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return arr.length ? sum / arr.length : 0;
  }

  function filterDataByRange(range) {
    const map = {
      "1D": 1,
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "6M": 180,
      "1Y": 365,
      "5Y": 1825,
    };

    const days = map[range] || fullLabels.length;
    const sliceStart = Math.max(0, fullLabels.length - days);

    return {
      labels: fullLabels.slice(sliceStart),
      stock1Data: fullStock1Data.slice(sliceStart),
      stock2Data: fullStock2Data.slice(sliceStart),
      sliceStart,
      sliceEnd: fullLabels.length,
    };
  }

  async function fetchCSV(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    const text = await response.text();
    return parseCSV(text);
  }

  function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map((line) => {
      const values = line.split(",");
      const row = {};
      headers.forEach((header, i) => {
        row[header.trim()] = values[i].trim();
      });
      return row;
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const compareBtn = document.getElementById('compareBtn');
  const stockList1 = document.getElementById('stockList1');
  const stockList2 = document.getElementById('stockList2');
  const recommendationResultDiv = document.getElementById('recommendationResult');

  // --- IMPORTANT ---
  // Replace this path with the actual accessible path to your results.csv file.
  // This file MUST be served by a web server and accessible via HTTP/HTTPS.
  // Client-side JavaScript cannot directly access local file paths like 'D:\...'.
  // Example: If results.csv is in a 'data' folder next to your html file,
  // the path might be './data/results.csv' or '../data/results.csv' depending on structure.
  const resultsCsvPath = './stock-data-csv-files/results.csv'; // Adjust this path as needed!

  compareBtn.addEventListener('click', async () => {
      const stock1Symbol = stockList1.value;
      const stock2Symbol = stockList2.value;

      // Basic validation
      if (stock1Symbol === 'Select a Stock' || stock2Symbol === 'Select a Stock') {
          recommendationResultDiv.innerHTML = '<p>Please select two stocks to compare.</p>';
          return;
      }
       if (stock1Symbol === stock2Symbol) {
          recommendationResultDiv.innerHTML = '<p>Please select two different stocks to compare.</p>';
          return;
      }

      recommendationResultDiv.innerHTML = '<p>Fetching recommendations...</p>';

      try {
          // Fetch the CSV file generated by the Python script
          const response = await fetch(resultsCsvPath);
          if (!response.ok) {
               // Provide more specific error feedback
               if (response.status === 404) {
                  throw new Error(`Could not find the results file at '${resultsCsvPath}'. Please ensure the file exists and the path is correct.`);
               } else {
                  throw new Error(`HTTP error! Status: ${response.status}`);
               }
          }
          const csvData = await response.text();

          // Parse the CSV data
          const recommendations = parseCSV(csvData);
          if (!recommendations || recommendations.length === 0) {
              throw new Error("CSV file is empty or could not be parsed correctly.");
          }

          // Construct filenames as they appear in the CSV (e.g., 'AAPL.csv')
          const filename1 = `./stock-data-csv-files/${stock1Symbol}.csv`;
          const filename2 = `./stock-data-csv-files/${stock2Symbol}.csv`;

          // Find the recommendations for the selected stocks
          const recommendation1 = findRecommendation(recommendations, filename1);
          const recommendation2 = findRecommendation(recommendations, filename2);

          // Display the results
          let resultHTML = `<h3>Analysis Results (Investment Viability):</h3>`;
          resultHTML += `<p><strong>${stock1Symbol}:</strong> <span class="recommendation-${(recommendation1 || 'N/A').toLowerCase()}">${recommendation1 || 'Not found'}</span></p>`;
          resultHTML += `<p><strong>${stock2Symbol}:</strong> <span class="recommendation-${(recommendation2 || 'N/A').toLowerCase()}">${recommendation2 || 'Not found'}</span></p>`;
          recommendationResultDiv.innerHTML = resultHTML;

      } catch (error) {
          console.error('Error fetching or processing recommendations:', error);
          recommendationResultDiv.innerHTML = `<p style="color: red;">Error loading recommendations: ${error.message}</p><p>Please check the console for more details and verify the results file path and format.</p>`;
      }
  });

  // Simple CSV parser (assumes comma-separated, first line is header: Filename,Prediction,Votes)
  function parseCSV(csvText) {
      const lines = csvText.trim().split(/\r?\n/); // Handles different line endings
      if (lines.length < 2) return []; // No data rows

      const headers = lines[0].split(',').map(h => h.trim());
      // Find indices for required columns, case-insensitive
      const filenameIndex = headers.findIndex(h => h.toLowerCase() === 'filename');
      const predictionIndex = headers.findIndex(h => h.toLowerCase() === 'prediction');

      if (filenameIndex === -1 || predictionIndex === -1) {
          console.error("CSV headers 'Filename' or 'Prediction' not found.");
          return []; // Missing required columns
      }

      const data = [];
      for (let i = 1; i < lines.length; i++) {
          // Basic split, doesn't handle commas within quoted fields
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length > Math.max(filenameIndex, predictionIndex)) {
              const entry = {
                  Filename: values[filenameIndex],
                  Prediction: values[predictionIndex]
                  // Add other columns if needed, e.g., Votes
              };
              data.push(entry);
          } else {
               console.warn(`Skipping malformed CSV line ${i + 1}: ${lines[i]}`);
          }
      }
      return data;
  }

  // Find recommendation by filename (case-insensitive)
  function findRecommendation(recommendations, filename) {
      const result = recommendations.find(rec => rec.Filename && rec.Filename.toLowerCase() === filename.toLowerCase());
      // Return the 'Prediction' value ("Yes", "No", "Invalid", etc.) or null if not found
      return result ? result.Prediction : null;
  }

  // Optional: Add some basic CSS for the recommendation result styling
  const style = document.createElement('style');
  style.textContent = `
      .recommendation-yes { color: green; font-weight: bold; }
      .recommendation-no { color: red; font-weight: bold; }
      .recommendation-invalid, .recommendation-insufficient { color: orange; font-weight: bold; }
      .recommendation-n\/a { color: grey; font-style: italic; }
  `;
  document.head.appendChild(style);
});