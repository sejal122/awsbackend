const { addFollowupCSV } = require('../services/sftpService');
const addFollowupController = async (req, res) => {
    const { leadID, followup } = req.body;

    if (!leadID || !followup) {
      return res.status(400).json({ error: 'leadId and followup are required' });
    }
    try {
        const data = await addFollowupCSV();
        console.log(data)
      } catch (err) {
        console.error('Error updating leads:', err.message);
        res.status(500).json({ error: 'Failed to update leads data' });
      }
  };
  module.exports = { addFollowupController };