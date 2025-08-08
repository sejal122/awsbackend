const { fetchLeadsCSV } = require('../services/sftpService');
const getLeads = async (req, res) => {
      console.log("in getleadsc");
      try {
          
        const data = await fetchLeadsCSV();
        
       
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching dealers:', err.message);
        res.status(500).json({ error: 'Failed to fetch dealer data' });
      }
    
   
  };
  module.exports = { getLeads };
