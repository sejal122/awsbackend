
const { fetchAndParseSubDealerCSV ,fetchAndParseSubDealerCSVShrirampur,fetchAndParseSubDealerCSVBaramati} = require('../services/sftpService');
const getSubdealerData=async(req,res)=>{
    try {
        const data = await fetchAndParseSubDealerCSV();
        
      
        res.json(data);
       // console.log(data)
      } catch (err) {
        console.error('Error fetching dealers:', err.message);
            if (!res.headersSent) {
     res.status(500).json({ error: 'Failed to fetch subdealer data' });
}
      }
    
}

const getSubdealerDataShrirampur=async(req,res)=>{
    try {
        const data = await fetchAndParseSubDealerCSVShrirampur();
        
      
        res.json(data);
       // console.log(data)
      } catch (err) {
        console.error('Error fetching dealers:', err.message);
            if (!res.headersSent) {
     res.status(500).json({ error: 'Failed to fetch subdealer data' });
}
      }
    
}

const getSubdealerDataBaramati=async(req,res)=>{
    try {
        const data = await fetchAndParseSubDealerCSVBaramati();
        
      
        res.json(data);
       // console.log(data)
      } catch (err) {
        console.error('Error fetching dealers:', err.message);
            if (!res.headersSent) {
     res.status(500).json({ error: 'Failed to fetch subdealer data' });
}
      }
    
}
module.exports = { getSubdealerData,getSubdealerDataShrirampur,getSubdealerDataBaramati};
