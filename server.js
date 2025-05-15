// server.js
const express = require('express');
const { scrapeZillowListings, advancedWholesaleFilter, parsePriceString } = require('./zillowScraper');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * GET /api/zillow-deals?location=Atlanta,GA&minPrice=100000&maxPrice=300000&minBeds=2&minBaths=2&maxPages=2&useAdvancedFilter=true
 */
app.get('/api/zillow-deals', async (req, res) => {
  try {
    // 1. Parse query params
    const location   = req.query.location   || "Houston, TX";
    const minPrice   = parsePriceString(req.query.minPrice) || 0;
    const maxPrice   = parsePriceString(req.query.maxPrice) || 9999999;
    const minBeds    = parseInt(req.query.minBeds || "0", 10);
    const minBaths   = parseInt(req.query.minBaths || "0", 10);
    const maxPages   = parseInt(req.query.maxPages || "1", 10);

    const useAdvancedFilter = req.query.useAdvancedFilter === "true";

    // 2. Scrape listings
    const listings = await scrapeZillowListings({
      location,
      minPrice,
      maxPrice,
      minBeds,
      minBaths,
      maxPages
    });

    // 3. If requested, apply advanced wholesale filter (ARV logic, etc.)
    let finalDeals;
    if (useAdvancedFilter) {
      finalDeals = advancedWholesaleFilter(listings);
    } else {
      finalDeals = listings;
    }

    res.json(finalDeals);
  } catch (err) {
    console.error('Error in /api/zillow-deals:', err);
    res.status(500).json({ error: 'Failed to fetch or parse Zillow data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
