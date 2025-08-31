const { uploadGothaVisitCSV,uploadGothaVisitCSVBaramati} = require('../services/sftpService');
const GothaController=async(req,res)=>{
    try {
        console.log("---------------------")
        console.log(req.body);
        const visitJson = req.body
        const data = await uploadGothaVisitCSV(visitJson);
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error uploading leads:', err.message);
        res.status(500).json({ error: 'Failed to upload leads' });
      }
}
const GothaControllerBaramati=async(req,res)=>{
    try {
        console.log("---------------------")
        console.log(req.body);
        const visitJson = req.body
        const data = await uploadGothaVisitCSVBaramati(visitJson);
        res.json(data);
        console.log(data)
      } catch (err) {
        console.error('Error uploading leads:', err.message);
        res.status(500).json({ error: 'Failed to upload leads' });
      }
}
module.exports = { GothaController,GothaControllerBaramati };
