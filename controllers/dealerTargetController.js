const { fetchAndParseDealerTargetCSV,fetchAndParseDealerTargetCSVShrirampur ,fetchAndParseDealerTargetCSVBaramati} = require('../services/sftpService');
 const dealerTarget =async(req,res)=>{
    try {
        const data = await fetchAndParseDealerTargetCSV();
        
        res.json(data);
       // console.log(data)
      } catch (err) {
        console.error('Error fetching outstanding:', err.message);
        res.status(500).json({ error: 'Failed to fetch outstanding data' });
      }
}


 const dealerTargetShrirampur =async(req,res)=>{
    try {
        const data = await fetchAndParseDealerTargetCSVShrirampur();
        
        res.json(data);
       // console.log(data)
      } catch (err) {
        console.error('Error fetching outstanding:', err.message);
        res.status(500).json({ error: 'Failed to fetch outstanding data' });
      }
}

 const dealerTargetBaramati =async(req,res)=>{
    try {
        const data = await fetchAndParseDealerTargetCSVBaramati();
        
        res.json(data);
       // console.log(data)
      } catch (err) {
        console.error('Error fetching outstanding:', err.message);
        res.status(500).json({ error: 'Failed to fetch outstanding data' });
      }
}
module.exports={dealerTarget,dealerTargetShrirampur,dealerTargetBaramati}
