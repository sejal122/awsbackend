const { fetchGothaCSV,fetchGothaCSVBaramati } = require('../services/sftpService');
const getGotha = async (req, res) => {
   
  
      try {
        const data = await fetchGothaCSV();
        
       
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching gotha details:', err.message);
        res.status(500).json({ error: 'Failed to fetch gotha data' });
      }
    
   
  };
const getGothaBaramati = async (req, res) => {
   
  
      try {
        const data = await fetchGothaCSVBaramati();
        
       
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching gotha details:', err.message);
        res.status(500).json({ error: 'Failed to fetch gotha data' });
      }
    
   
  };
  module.exports = { getGotha ,getGothaBaramati};
