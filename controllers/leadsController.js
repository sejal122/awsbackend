const { uploadLeadsCSV } = require('../services/sftpService');
const LeadController=async(req,res)=>{
    try {
        const visitJson = req.body
        const data = await uploadLeadsCSV(visitJson);
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error uploading leads:', err.message);
        res.status(500).json({ error: 'Failed to upload leads' });
      }
}

module.exports = { LeadController };
