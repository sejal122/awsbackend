const { saveComplaintToSFTP,saveComplaintToSFTPShrirampur,saveComplaintToSFTPBaramati} = require('../services/sftpService');

const postComplaint = async (req, res) => {
  try {
    const { ID, Name, date } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Photo file is missing' });
    }

    const filePath = file.path;
    const fileName = file.originalname;

    const data = await saveComplaintToSFTP({
      ID,
      Name,
      date,
      filePath,
      fileName
    });

    res.json({ message: '✅ Complaint uploaded successfully', data });
    console.log('📸 Complaint uploaded:', data);
  } catch (err) {
    console.error('❌ Error uploading complaint:', err.message);
    res.status(500).json({ error: 'Failed to upload complaint' });
  }
};


const postComplaintShrirampur = async (req, res) => {
  try {
    const { ID, Name, date } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Photo file is missing' });
    }

    const filePath = file.path;
    const fileName = file.originalname;

    const data = await saveComplaintToSFTPShrirampur({
      ID,
      Name,
      date,
      filePath,
      fileName
    });

    res.json({ message: '✅ Complaint uploaded successfully', data });
    console.log('📸 Complaint uploaded:', data);
  } catch (err) {
    console.error('❌ Error uploading complaint:', err.message);
    res.status(500).json({ error: 'Failed to upload complaint' });
  }
};

const postComplaintBaramati = async (req, res) => {
  try {
    const { ID, Name, date } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Photo file is missing' });
    }

    const filePath = file.path;
    const fileName = file.originalname;

    const data = await saveComplaintToSFTPBaramati({
      ID,
      Name,
      date,
      filePath,
      fileName
    });

    res.json({ message: '✅ Complaint uploaded successfully', data });
    console.log('📸 Complaint uploaded:', data);
  } catch (err) {
    console.error('❌ Error uploading complaint:', err.message);
    res.status(500).json({ error: 'Failed to upload complaint' });
  }
};

module.exports = { postComplaint ,postComplaintShrirampur,postComplaintBaramati};
