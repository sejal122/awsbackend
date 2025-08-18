const { addGothaFollowupCSV } = require('../services/sftpService');
const addOpinionController = async (req, res) => {
    const { leadID, followup } = req.body;
console.log("------------ id ----------")
    console.log(leadID);
    console.log("opinion");
    if (!leadID || !followup) {
      return res.status(400).json({ error: 'gothaId and opinion are required' });
    }
    try {
       const data = await addGothaFollowupCSV(leadID, followup);
        return res.json({ success: true, lead: data });
        console.log(data);
      } catch (err) {
        console.error('Error updating opinion:', err.message);
        res.status(500).json({ error: 'Failed to update gotha data' });
      }
  };
  module.exports = { addOpinionController };
