const { fetchAndParsependingOrdersCSV } = require("../services/sftpService");

const getpendingOrders=async(req,res)=>{
    try {
        const data = await fetchAndParsependingOrdersCSV();
        
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching pending orders:', err.message);
        res.status(500).json({ error: 'Failed to fetch pending order data' });
      }
}
module.exports = { getpendingOrders };
