const { fetchLeadsCSV } = require('../services/sftpService');
const getLeads = async (req, res) => {
    let dealers = await cache.get('dealers');
    if (dealers) {
      // If data is cached, send it
      console.log('Returning cached dealers data');
      console.log(res.json(dealers))
      return res.json(dealers);
    }else{
      try {
        const data = await fetchLeadsCSV();
        
        await cache.set('dealers', data);
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching dealers:', err.message);
        res.status(500).json({ error: 'Failed to fetch dealer data' });
      }
    }
   
  };
  module.exports = { getLeads };