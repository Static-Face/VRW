// zillowScraper.js
const puppeteer = require('puppeteer');

/**
 * Convert "500k" or "$500,000" to a number (e.g. 500000).
 */
function parsePriceString(priceStr = "") {
  return parseInt(priceStr.replace(/[^0-9]/g, ""), 10) || 0;
}

/**
 * Launch Puppeteer, search Zillow with advanced parameters, and scrape listings.
 * 
 * @param {Object} options
 * @param {string} options.location  - e.g. "Houston, TX"
 * @param {number} options.minPrice - e.g. 100000
 * @param {number} options.maxPrice - e.g. 300000
 * @param {number} options.minBeds  - e.g. 2
 * @param {number} options.minBaths - e.g. 2
 * @param {number} options.maxPages - e.g. 2
 * 
 * @returns {Promise<Array>} Array of listing objects with shape:
 *   { address, price, beds, baths, link, zestimate, ... }
 */
async function scrapeZillowListings({
  location   = "Houston, TX",
  minPrice   = 0,
  maxPrice   = 9999999,
  minBeds    = 0,
  minBaths   = 0,
  maxPages   = 1
}) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Build a Zillow URL with basic filters in the query string if possible.
  // Zillow's parameter structure can change anytime. As of 2023/2024, you can try something like:
  // https://www.zillow.com/homes/for_sale/<LOCATION>/
  //   ?searchQueryState={... JSON that includes price min/max, bed min, bath min, etc... }
  //
  // For simplicity, let's do a simpler approach: navigate to the main location and set some filters via the DOM if possible.
  // (This is less reliable, but easier to read for demonstration.)

  const baseUrl = `https://www.zillow.com/homes/for_sale/${encodeURIComponent(location)}/`;
  await page.goto(baseUrl, { waitUntil: 'networkidle2' });

  // TODO: Programmatically set filters if needed (price, beds, baths) by clicking on UI elements or building a "searchQueryState" param.
  // We'll skip that complexity for demonstration and rely on a simpler approach.

  let allListings = [];

  for (let i = 0; i < maxPages; i++) {
    // Extract listing cards on the page
    const listings = await page.evaluate(() => {
      const data = [];
      const cards = document.querySelectorAll('.list-card-info');
      cards.forEach(card => {
        const addressEl = card.querySelector('.list-card-addr');
        const priceEl   = card.querySelector('.list-card-price');
        const bedsEl    = card.querySelector('.list-card-details li:nth-child(1)');
        const bathsEl   = card.querySelector('.list-card-details li:nth-child(2)');
        const linkEl    = card.querySelector('a.list-card-link');

        // Some listings might show a "Zestimate" or "Est. payment" - we can attempt to parse if present:
        // For demonstration only, we try to see if there's an element or text for "Zestimate"
        // but typically you'd have to open the listing or scrape more detail pages for ARV or "Zestimate."
        // We'll skip deep detail scraping here to keep it simpler.
        let zestimate = "";

        data.push({
          address: addressEl?.textContent?.trim() || "",
          price:   priceEl?.textContent?.trim()   || "",
          beds:    bedsEl?.textContent?.trim()    || "",
          baths:   bathsEl?.textContent?.trim()   || "",
          link:    linkEl?.href                   || "",
          zestimate
        });
      });
      return data;
    });

    allListings = allListings.concat(listings);

    // Try going to the next page
    const nextBtn = await page.$('a[title="Next page"]');
    if (!nextBtn) {
      break; // No more pages
    }
    await nextBtn.click();
    await page.waitForTimeout(3000);
  }

  await browser.close();

  // Apply your initial filter (minPrice, maxPrice, minBeds, minBaths)
  const filtered = allListings.filter(item => {
    const numericPrice = parsePriceString(item.price);
    const numericBeds  = parseFloat(item.beds) || 0;
    const numericBaths = parseFloat(item.baths) || 0;

    return (
      numericPrice >= minPrice &&
      numericPrice <= maxPrice &&
      numericBeds  >= minBeds &&
      numericBaths >= minBaths
    );
  });

  return filtered;
}

/**
 * Example advanced logic: determine if the property meets your wholesale criteria.
 * Here we do:
 *  - if there's a "zestimate," treat that as ARV
 *  - compare (zestimate - (price + repairs)) / zestimate >= 0.25
 * 
 * We'll guess a default repairs cost. In reality, you'd need more data.
 */
function advancedWholesaleFilter(listings) {
  // Hard-coded guess for repairs:
  const defaultRepairs = 20000;

  return listings.filter(item => {
    const numericPrice    = parsePriceString(item.price);
    const numericZestimate = parsePriceString(item.zestimate) || 0;

    // If we have no zestimate, skip advanced check:
    if (numericZestimate <= 0) return false;

    // Potential profit margin:
    const potentialProfit = numericZestimate - (numericPrice + defaultRepairs);
    // Potential profit ratio:
    const profitRatio     = potentialProfit / numericZestimate;

    // Example: require at least 25% margin
    return profitRatio >= 0.25;
  });
}

module.exports = { scrapeZillowListings, advancedWholesaleFilter, parsePriceString };
