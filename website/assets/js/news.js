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
    newsGrid.innerHTML = '<p>Loading news...</p>';

    if (!symbol) {
        newsGrid.innerHTML = '<p>Please select a company to view news.</p>';
        return;
    }

    try {
        const csvPath = `./news-data-csv-files/${symbol}_news.csv`;
        const response = await fetch(csvPath);

        if (!response.ok) {
            if (response.status === 404) {
                newsGrid.innerHTML = `<p>No news data found for ${symbol}.</p>`;
            } else {
                throw new Error(`Could not load news for ${symbol}. Status: ${response.status}`);
            }
            return;
        }

        const csvData = await response.text();
        const lines = csvData.trim().split('\n');
        if (lines.length < 2) {
             newsGrid.innerHTML = `<p>No news articles found for ${symbol}.</p>`;
             return;
        }

        // Use regex to split on commas that are not inside quotes.
        function parseCSVLine(line) {
            return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                       .map(item => item.replace(/^"(.*)"$/, "$1").trim());
        }

        const headers = parseCSVLine(lines[0]);
        // Find the index of the description, summary, or text column (in that order)
        const descriptionIdx = headers.findIndex(h => h.toLowerCase() === 'description');
        const summaryIdx = headers.findIndex(h => h.toLowerCase() === 'summary');
        const textIdx = headers.findIndex(h => h.toLowerCase() === 'text');
        const headlineIdx = headers.findIndex(h => h.toLowerCase().includes('headline') || h.toLowerCase().includes('title'));

        const articles = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const article = {};

            // Extract headline
            if (headlineIdx !== -1) {
                article.headline = values[headlineIdx] || '';
            }
            // Extract description (prefer description > summary > text)
            if (descriptionIdx !== -1) {
                article.summary = values[descriptionIdx] || '';
            } else if (summaryIdx !== -1) {
                article.summary = values[summaryIdx] || '';
            } else if (textIdx !== -1) {
                article.summary = values[textIdx] || '';
            } else {
                article.summary = '';
            }
            return article;
        }).filter(article => article.headline && article.headline !== 'No Headline');

        newsGrid.innerHTML = '';

        if (articles.length === 0) {
             newsGrid.innerHTML = `<p>No valid news articles found for ${symbol}.</p>`;
             return;
        }

        articles.forEach((article) => {
            const newsCard = document.createElement('div');
            newsCard.classList.add('news-card');

            const newsContent = document.createElement('div');
            newsContent.classList.add('news-content');

            const headline = document.createElement('h3');
            headline.textContent = article.headline || '';
            
            const paragraph = document.createElement('p');
            paragraph.textContent = article.summary || '';
            // Force styling to ensure full text display
            paragraph.style.whiteSpace = 'normal';
            paragraph.style.overflow = 'visible';
            paragraph.style.textOverflow = 'clip';
            paragraph.style.wordBreak = 'break-word';
            paragraph.style.maxHeight = 'none';

            newsContent.appendChild(headline);
            newsContent.appendChild(paragraph);
            newsCard.appendChild(newsContent);
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
