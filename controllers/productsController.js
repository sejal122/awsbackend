
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
    let products = await cache.get('products');
    if (products) {
      // If data is cached, send it
      console.log('Returning cached products data');
      
      return res.json(products);
    }else{
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
    }
   
  };
  
  module.exports = { getProducts };
