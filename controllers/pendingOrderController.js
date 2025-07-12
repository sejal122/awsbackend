const { fetchAndParsependingOrdersCSV ,fetchAndParsependingOrdersCSVShrirampur,fetchAndParsependingOrdersCSVBaramati} = require("../services/sftpService");

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

const getpendingOrdersShrirampur=async(req,res)=>{
    try {
        const data = await fetchAndParsependingOrdersCSVShrirampur();
        
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching pending orders:', err.message);
        res.status(500).json({ error: 'Failed to fetch pending order data' });
      }
}

const getpendingOrdersBaramati=async(req,res)=>{
    try {
        const data = await fetchAndParsependingOrdersCSVBaramati();
        
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching pending orders:', err.message);
        res.status(500).json({ error: 'Failed to fetch pending order data' });
      }
}
module.exports = { getpendingOrders ,getpendingOrdersShrirampur,getpendingOrdersBaramati};
