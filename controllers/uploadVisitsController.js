const { uploadVisitsCSV ,uploadVisitsCSVShrirampur,uploadVisitsCSVBaramati} = require('../services/sftpService');
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


const uploadVisitsShrirampur=async(req,res)=>{
    try {
        const visitJson = req.body
        const data = await uploadVisitsCSVShrirampur(visitJson);
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error uploading visits:', err.message);
        res.status(500).json({ error: 'Failed to upload visits' });
      }
}

const uploadVisitsBaramati=async(req,res)=>{
    try {
        const visitJson = req.body
        const data = await uploadVisitsCSVBaramati(visitJson);
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error uploading visits:', err.message);
        res.status(500).json({ error: 'Failed to upload visits' });
      }
}
module.exports = { uploadVisits ,uploadVisitsShrirampur,uploadVisitsBaramati};
