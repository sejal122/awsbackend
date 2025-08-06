const uploadLeadCSV=async(req,res)=>{
    try {
        const visitJson = req.body
        const data = await uploadVisitsCSV(visitJson);
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error uploading leads:', err.message);
        res.status(500).json({ error: 'Failed to upload leads' });
      }
}

module.exports = { uploadLeadCSV };