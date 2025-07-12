const { fetchAndParseInvoiceHistory,fetchAndParseInvoiceHistoryShrirampur ,fetchAndParseInvoiceHistoryBaramati} = require('../services/sftpService');
const getInvoiceHistory = async (req, res) => {
    try {
        const data = await fetchAndParseInvoiceHistory();
     
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching invoice history:', err.message);
        res.status(500).json({ error: 'Failed to fetch invoice history data' });
      }
    
}

const getInvoiceHistoryShrirampur = async (req, res) => {
    try {
        const data = await fetchAndParseInvoiceHistoryShrirampur();
     
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching invoice history:', err.message);
        res.status(500).json({ error: 'Failed to fetch invoice history data' });
      }
    
}

const getInvoiceHistoryBaramati = async (req, res) => {
    try {
        const data = await fetchAndParseInvoiceHistoryBaramati();
     
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching invoice history:', err.message);
        res.status(500).json({ error: 'Failed to fetch invoice history data' });
      }
    
}
module.exports = { getInvoiceHistory ,getInvoiceHistoryShrirampur,getInvoiceHistoryBaramati};
