const { addFollowupCSV } = require('../services/sftpService');
const addFollowupController = async (req, res) => {
    const { leadID, followup } = req.body;
console.log("------------ id ----------")
    console.log(leadID);
    console.log("followup");
    if (!leadID || !followup) {
      return res.status(400).json({ error: 'leadId and followup are required' });
    }
    try {
       const data = await addFollowupCSV(leadID, followup);
        return res.json({ success: true, lead: data });
        console.log(data);
      } catch (err) {
        console.error('Error updating leads:', err.message);
        res.status(500).json({ error: 'Failed to update leads data' });
      }
  };
  module.exports = { addFollowupController };
