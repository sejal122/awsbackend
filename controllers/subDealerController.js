
const { fetchAndParseCSV } = require('../services/sftpService');
const getSubdealerData=async(req,res)=>{
    try {
        const data = await fetchAndParseCSV();
        
        await cache.set('dealers', data);
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching dealers:', err.message);
            if (!res.headersSent) {
     res.status(500).json({ error: 'Failed to fetch subdealer data' });
}
      }
    
}
module.exports = { getSubdealerData };
