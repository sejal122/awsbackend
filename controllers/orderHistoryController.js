const { fetchAndParseOrderHistoryCSV } = require('../services/sftpService');
const getOrderHistory = async (req, res) => {
    try {
        const data = await fetchAndParseOrderHistoryCSV();
     
        res.json(data);
       // console.log(data)
      } catch (err) {
        console.error('Error fetching order history:', err.message);
        res.status(500).json({ error: 'Failed to fetch history data' });
      }
    
}
module.exports = { getOrderHistory };
