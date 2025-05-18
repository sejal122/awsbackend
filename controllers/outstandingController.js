const { fetchOutstandingAndParseCSV } = require('../services/sftpService');
 const getOutstanding =async()=>{
    try {
        const data = await fetchOutstandingAndParseCSV();
        
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching outstanding:', err.message);
        res.status(500).json({ error: 'Failed to fetch outstanding data' });
      }
}

module.exports={getOutstanding}