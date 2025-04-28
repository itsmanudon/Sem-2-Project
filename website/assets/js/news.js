const welcomeArea = document.getElementById("welcomeArea");
const logoutArea = document.getElementById("logoutArea");
const loggedInUser = localStorage.getItem("stockviz_loggedInUser");
const searchForm = document.getElementById("searchForm");
const companySelector = document.getElementById('companySelector'); // Get dropdown element
const newsGrid = document.getElementById('newsGrid'); // Get news grid element

// --- Authentication and Header Logic ---
if (loggedInUser) {
    // ...existing welcome/logout logic...
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

    const logoutBtn = document.getElementById("logoutBtn"); // Re-select after adding
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("stockviz_loggedInUser");
            window.location.reload();
        });
    }
} else {
    // ...existing login/signup link logic...
    welcomeArea.innerHTML = `
      <a href="login.html" style="margin-right: 1rem; font-size: 0.95rem; color: white; text-decoration: none;">Login</a>
      <a href="signup.html" style="background: var(--light-green); padding: 8px 16px; border-radius: 6px; color: white; font-weight: 600; text-decoration: none;">Sign Up</a>
    `;
    logoutArea.innerHTML = ``; // Keep empty
}

async function displayNews(symbol) {
    if (!newsGrid) return;
    newsGrid.innerHTML = '<p>Loading news...</p>';

    if (!symbol) {
        newsGrid.innerHTML = '<p>Please select a company to view news.</p>';
        return;
    }

    $.ajax({
        url: `./news-data-csv-files/${symbol}.csv`,
        method: 'GET',
        dataType: 'text',
        success: function(csvData) {
            // Basic CSV parsing (adjust as needed)
            const lines = csvData.trim().split('\n');
            if (lines.length < 2) {
                newsGrid.innerHTML = `<p>No news articles found for ${symbol}.</p>`;
                return;
            }

            // Process header and data rows
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const articles = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const article = {};
                headers.forEach((header, index) => {
                    const lowerHeader = header.toLowerCase();
                    if (lowerHeader.includes('date')) article.date = values[index] || 'N/A';
                    else if (lowerHeader.includes('category')) article.category = values[index] || 'General';
                    else if (lowerHeader.includes('headline')) article.headline = values[index] || 'No Headline';
                    else if (lowerHeader.includes('summary') || lowerHeader.includes('text')) article.summary = values[index] || 'No summary available.';
                    else if (lowerHeader.includes('image')) article.imageUrl = values[index] || '';
                    else if (lowerHeader.includes('url') || lowerHeader.includes('link')) article.articleUrl = values[index] || '#';
                });
                return article;
            }).filter(article => article.headline && article.headline !== 'No Headline');

            newsGrid.innerHTML = '';
            if (articles.length === 0) {
                newsGrid.innerHTML = `<p>No valid news articles found for ${symbol}.</p>`;
                return;
            }

            articles.forEach((article, index) => {
                const newsCard = document.createElement('div');
                newsCard.classList.add('news-card');

                // Use placeholder image if imageUrl is empty or invalid
                const imageUrl = article.imageUrl && (article.imageUrl.startsWith('http') || article.imageUrl.startsWith('/'))
                                 ? article.imageUrl
                                 : 'https://via.placeholder.com/400x200.png?text=News';

                newsCard.innerHTML = `
                    <div class="news-image" style="background-image: url('${imageUrl}')">
                        ${index === 0 ? '<div class="news-tag">LATEST</div>' : ''}
                    </div>
                    <div class="news-content">
                        <div class="news-meta">
                            <span class="news-category">${article.category}</span>
                            <span class="news-date">${article.date}</span>
                        </div>
                        <h3>${article.headline}</h3>
                        <p>${article.summary}</p>
                        <a href="${article.articleUrl}" target="_blank" rel="noopener noreferrer" class="read-more">
                          Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                `;
                newsGrid.appendChild(newsCard);
            });
        },
        error: function(xhr) {
            if (xhr.status === 404) {
                newsGrid.innerHTML = `<p>No news data found for ${symbol}.</p>`;
            } else {
                newsGrid.innerHTML = `<p>Could not load news for ${symbol}. Status: ${xhr.status}</p>`;
            }
        }
    });
}

// --- Mobile Menu Logic ---
function setupMobileMenu() {
    const mobileBtn = document.querySelector(".mobile-menu-btn");
    const navLinks = document.querySelector(".nav-links"); // Use class selector
    const searchBox = document.querySelector(".search-box"); // Use class selector

    if (mobileBtn && navLinks && searchBox) {
        mobileBtn.addEventListener("click", () => {
            // Toggle a class on the parent or navLinks/searchBox for CSS control
            navLinks.classList.toggle("show");
            searchBox.classList.toggle("show");

            // Example of direct style manipulation (less recommended than CSS classes)
            /*
            const isOpen = navLinks.classList.contains('show');
            navLinks.style.display = isOpen ? 'flex' : 'none';
            searchBox.style.display = isOpen ? 'flex' : 'none';
            // Add more mobile-specific styles if needed when 'show' is active
            */
        });
    } else {
        console.error("Mobile menu button, nav links, or search box not found.");
    }
}


// --- News Page Specific Logic ---

/**
 * Fetches news data for a given company symbol from its CSV file
 * and displays it in the news grid.
 * @param {string} symbol - The company stock symbol (e.g., 'AAPL').
 */
async function displayNews(symbol) {
    if (!newsGrid) return;
    newsGrid.innerHTML = '<p>Loading news...</p>'; // Show loading state

    if (!symbol) {
        newsGrid.innerHTML = '<p>Please select a company to view news.</p>';
        return;
    }

    try {
        // Construct the path relative to the HTML file's location based on the selected symbol
        const csvPath = `./news-data-csv-files/${symbol}_news.csv`;
        const response = await fetch(csvPath);

        if (!response.ok) {
            // Handle cases where the CSV file might not exist for a symbol
            if (response.status === 404) {
                newsGrid.innerHTML = `<p>No news data found for ${symbol}.</p>`;
            } else {
                throw new Error(`Could not load news for ${symbol}. Status: ${response.status}`);
            }
            return; // Stop execution if file not found or other error
        }

        const csvData = await response.text();

        // --- Basic CSV Parsing (Consider using PapaParse for robustness) ---
        const lines = csvData.trim().split('\n');
        if (lines.length < 2) { // Check if there's data beyond the header
             newsGrid.innerHTML = `<p>No news articles found for ${symbol}.</p>`;
             return;
        }

        // Assume header is the first line
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '')); // Trim and remove surrounding quotes if any
        const articles = lines.slice(1).map(line => {
            // Basic split, may fail with commas within fields. Use a library for complex CSVs.
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const article = {};
            headers.forEach((header, index) => {
            // Map header names (case-insensitive match for flexibility)
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes('date')) article.date = values[index] || 'N/A';
            else if (lowerHeader.includes('category')) article.category = values[index] || 'General';
            else if (lowerHeader.includes('headline') || lowerHeader.includes('title')) article.headline = values[index] || 'No Headline';
            else if (lowerHeader.includes('summary') || lowerHeader.includes('text')) article.summary = values[index] || 'No summary available.';
            else if (lowerHeader.includes('image')) article.imageUrl = values[index] || '';
            else if (lowerHeader.includes('url') || lowerHeader.includes('link')) article.articleUrl = values[index] || '#';
            // Add more mappings if needed
            });
            return article;
        }).filter(article => article.headline && article.headline !== 'No Headline'); // Filter out potentially empty rows

        // --- End Basic CSV Parsing ---

        newsGrid.innerHTML = ''; // Clear loading/error message

        if (articles.length === 0) {
             newsGrid.innerHTML = `<p>No valid news articles found for ${symbol}.</p>`;
             return;
        }

        articles.forEach((article, index) => {
            const newsCard = document.createElement('div');
            newsCard.classList.add('news-card');
            // Optional: Make the first card large
            if (index === 0) {
            newsCard.classList.add('large');
            }

            // Validate and trim the image URL before using it
            const trimmedImageUrl = article.imageUrl ? article.imageUrl.trim() : '';
            const isValidImage = trimmedImageUrl && (trimmedImageUrl.startsWith('http') || trimmedImageUrl.startsWith('/'));
            const imageUrl = isValidImage
                     ? trimmedImageUrl
                     : 'https://via.placeholder.com/400x200.png?text=News'; // Default placeholder

            newsCard.innerHTML = `
            <div class="news-image" style="background-image: url('${imageUrl}')">
                ${index === 0 ? '<div class="news-tag">LATEST</div>' : ''}
            </div>
            <div class="news-content">
                <div class="news-meta">
                <span class="news-category">${article.category}</span>
                <span class="news-date">${article.date}</span>
                </div>
                <h3>${article.headline}</h3>
                <p>${article.summary}</p>
                <a href="${article.articleUrl}" target="_blank" rel="noopener noreferrer" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
            `;
            newsGrid.appendChild(newsCard);
        });

    } catch (error) {
        console.error(`Error fetching or displaying news for ${symbol}:`, error);
        newsGrid.innerHTML = `<p>Could not load news for ${symbol}. Check console for details.</p>`;
    }
}

/**
 * Fetches the list of companies from companies.json and populates the dropdown selector.
 */
async function populateCompanySelector() {
    if (!companySelector) return;

    try {
        // Fetch companies.json relative to the HTML file's location
        const response = await fetch('../companies.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const companies = await response.json();

        // Sort companies alphabetically by name
        companies.sort((a, b) => a.name.localeCompare(b.name));

        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.symbol;
            // Display Name (Symbol) in the dropdown
            option.textContent = `${company.name} (${company.symbol})`;
            companySelector.appendChild(option);
        });

        // Add event listener to the selector AFTER options are populated
        companySelector.addEventListener('change', (event) => {
            displayNews(event.target.value); // Call displayNews with the selected symbol
        });

        // Optional: Load news for the first company in the list by default?
        if (companies.length > 0) {
           displayNews(companies[0].symbol);
           companySelector.value = companies[0].symbol; // Set dropdown to the loaded company
        } else {
           displayNews(''); // Show initial message if no companies loaded
        }

    } catch (error) {
        console.error("Failed to load companies:", error);
        if (companySelector) {
            companySelector.disabled = true;
            // Clear existing options and add error message
            companySelector.innerHTML = '<option value="">Error loading companies</option>';
        }
         if (newsGrid) {
            newsGrid.innerHTML = '<p>Could not load company list. News cannot be displayed.</p>';
        }
    }
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu(); // Setup mobile menu toggle
    populateCompanySelector(); // Fetch companies and set up the dropdown
    // The initial news display is handled within populateCompanySelector or its listener
});

// --- Remove functions not relevant to news.html ---
// function initMainChart() { ... }
// function animateIndexValues() { ... }
// function simulateStockChanges() { ... }
// Make sure these are removed or commented out if they cause errors on this page.
