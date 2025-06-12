const { uploadVisitsCSV } = require('../services/sftpService');
const uploadVisits=async(req,res)=>{
    try {
        const visitJson = req.body
        const data = await uploadVisitsCSV(visitJson);
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error uploading visits:', err.message);
        res.status(500).json({ error: 'Failed to upload visits' });
      }
}

module.exports = { uploadVisits };
