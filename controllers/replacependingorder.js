const { replacePendingOrder } = require('../services/sftpService');
const  replacependingordercontroller=async (req,res)=> {

    const {  doc_number,updatedOrderArray } = req.body;
    console.log(updatedOrderArray)
    console.log(doc_number)

try {
    
  if (!purch_no_c || !Array.isArray(updatedOrderArray)) {
    return res.status(400).json({ error: 'Missing or invalid data' });
  }
    const data = await replacePendingOrder(doc_number,updatedOrderArray);
  
  
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error updating order', err.message);
 if (!res.headersSent) {
     res.status(500).json({ error:  'Error updating order' });
    }
    
  }
}
module.exports = { replacependingordercontroller };
