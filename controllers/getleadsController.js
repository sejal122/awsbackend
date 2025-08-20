const { fetchLeadsCSV,fetchLeadsBaramatiCSV } = require('../services/sftpService');
const getLeads = async (req, res) => {
      console.log("in getleadsc");
      try {
          
        const data = await fetchLeadsCSV();
        
       
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching leads:', err.message);
        res.status(500).json({ error: 'Failed to fetch leads data' });
      }
    
   
  };

const getLeadsBaramati = async (req, res) => {
      console.log("in getleadsc");
      try {
          
        const data = await fetchLeadsBaramatiCSV();
        
       
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching leads:', err.message);
        res.status(500).json({ error: 'Failed to fetch leads data' });
      }
    
   
  };
  module.exports = { getLeads,getLeadsBaramati };
