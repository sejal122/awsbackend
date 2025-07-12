
const { fetchAndParseCSV, fetchAndParseCSVShrirampur,fetchAndParseCSVBaramati } = require('../services/sftpService');

const cacheManager = require('cache-manager');
let cache;
(async () => {
  cache = await cacheManager.caching({
    store: "memory",
    ttl: 900, // 15 minutes in seconds
  });
})();

const getDealers = async (req, res) => {

    try {
      const data = await fetchAndParseCSV();
      
      await cache.set('dealers', data);
      res.json(data);
     // console.log(data)
    } catch (err) {
      console.error('Error fetching dealers:', err.message);
      if (!res.headersSent) {
     res.status(500).json({ error: 'Failed to fetch dealer data' });
}
  
    }
  
 
};
const getDealersShrirampur = async (req, res) => {
  try {
    const data = await fetchAndParseCSVShrirampur();
    await cache.set('dealers_shrirampur', data);
    res.json(data);
  } catch (err) {
    console.error('Error fetching dealers:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to fetch dealer data' });
    }
  }
};

const getDealersBaramati = async (req, res) => {
  try {
    const data = await fetchAndParseCSVBaramati();
    await cache.set('dealers_shrirampur', data);
    res.json(data);
  } catch (err) {
    console.error('Error fetching dealers:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to fetch dealer data' });
    }
  }
};
module.exports = { getDealers ,getDealersShrirampur,getDealersBaramati};
