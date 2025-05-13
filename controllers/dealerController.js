const { fetchAndParseCSV } = require('../services/sftpService');

const getDealers = async (req, res) => {
  try {
    const data = await fetchAndParseCSV();
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error fetching dealers:', err.message);
    res.status(500).json({ error: 'Failed to fetch dealer data' });
  }
};

module.exports = { getDealers };
