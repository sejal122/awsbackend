const { fetchAndParseCSV } = require('../services/sftpService');
const deepEqual = require('deep-equal');
let cachedDealers = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 15 * 60 * 1000;
const getDealers = async (req, res) => {
  const currentTime = Date.now();

  const shouldRefresh =
    !cachedDealers ||
    (currentTime - lastFetchTime > CACHE_DURATION_MS);
    if (shouldRefresh) {
      console.log('🔄 Refreshing data from VPN...');
      try {
        const data = await fetchAndParseCSV();
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching dealers:', err.message);
        res.status(500).json({ error: 'Failed to fetch dealer data' });
      }
  
      if (data && !deepEqual(data, cachedDealers)) {
        cachedDealers = data;
        lastFetchTime = currentTime;
        console.log('✅ Data updated from VPN');
      } else {
        console.log('⏳ No change in data, serving cached version');
      }
    } else {
      console.log('⚡ Serving cached data');
    }
 
};

module.exports = { getDealers };
