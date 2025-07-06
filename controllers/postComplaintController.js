const { saveComplaintToSFTP } = require('../services/sftpService');
const postComplaint=async()=>{

    try {
        const data = await saveComplaintToSFTP();
        
        await cache.set('dealers', data);
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching dealers:', err.message);
        res.status(500).json({ error: 'Failed to fetch dealer data' });
      }
}

module.exports = { postComplaint };

