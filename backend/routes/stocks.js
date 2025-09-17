const express = require('express');
const router = express.Router();
const yahooFinance = require('yahoo-finance2').default;

// Search for stocks
router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    try {
        const searchResults = await yahooFinance.search(q, { enableFuzzyQuery: true });
        const results = searchResults.quotes.map(quote => ({
            symbol: quote.symbol,
            name: quote.longname || quote.shortname,
            exchange: quote.exchange
        })).filter(quote => quote.exchange === 'NSI' || quote.exchange === 'BSE'); // Filter out entries without a name
        console.log("Search results:", searchResults);
        res.json({ results });
    } catch (error) {
        console.error('Failed to search for stocks:', error);
        res.status(500).json({ message: 'Failed to search for stocks' });
    }
});

// Get stock price
router.get('/price/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const quote = await yahooFinance.quote(symbol);
        if (!quote) {
            return res.status(404).json({ message: 'Stock symbol not found' });
        }
        res.json({
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            previousClose: quote.regularMarketPreviousClose
        });
    } catch (error) {
        console.error(`Failed to fetch price for ${symbol}:`, error);
        res.status(500).json({ message: `Failed to fetch price for ${symbol}` });
    }
});

module.exports = router;
