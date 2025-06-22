const { fetchAndParseOrderHistoryCSV } = require('../services/sftpService');
const getInvoiceHistory = async (req, res) => {
    try {
        const data = await fetchAndParseOrderHistoryCSV();
     
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching invoice history:', err.message);
        res.status(500).json({ error: 'Failed to fetch invoice history data' });
      }
    
}
module.exports = { getInvoiceHistory };