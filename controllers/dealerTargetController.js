const { fetchAndParseDealerTargetCSV } = require('../services/sftpService');
 const dealerTarget =async(req,res)=>{
    try {
        const data = await fetchAndParseDealerTargetCSV();
        
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching outstanding:', err.message);
        res.status(500).json({ error: 'Failed to fetch outstanding data' });
      }
}

module.exports={dealerTarget}