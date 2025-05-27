
const { fetchAndParseProductsCSV } = require('../services/sftpService');

const cacheManager = require('cache-manager');
let cache;
(async () => {
  cache = await cacheManager.caching({
    store: "memory",
    ttl: 900, // 15 minutes in seconds
  });
})();

const getProducts = async (req, res) => {
  console.log('in route')

      try {
        const data = await fetchAndParseProductsCSV();
        
        await cache.set('products', data);
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching products:', err.message);
        if (!res.headersSent) {
     res.status(500).json({ error: 'Failed to fetch products data' });
    }
        
      }
    
   
  };
  
  module.exports = { getProducts };
