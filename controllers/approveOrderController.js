//import { placeOrderAndUploadFile } from "../services/sftpService";

const { approveOrderAndUploadFile } = require('../services/sftpService');

 const  approveOrder=async (req,res)=> {

    const {  doc_number,approvedOrders } = req.body;
    console.log(approvedOrders)
    console.log(doc_number)

try {
    const data = await approveOrderAndUploadFile(doc_number,approvedOrders);
  
  
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error approving order', err.message);
 
 if (!res.headersSent) {
     res.status(500).json({ error:  'Error approving order' });
    }
    
  }
}
module.exports = { approveOrder };
