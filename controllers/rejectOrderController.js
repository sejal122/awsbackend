
//import { placeOrderAndUploadFile } from "../services/sftpService";

const { RejectOrderAndUploadFile } = require('../services/sftpService');

 const  rejectOrder=async (req,res)=> {

    const {  doc_number,approvedHistoryFormat } = req.body;
    console.log(approvedHistoryFormat)
    console.log(doc_number)

try {
    const data = await RejectOrderAndUploadFile(doc_number,approvedHistoryFormat);
  
  
  } catch (err) {
    console.error('Error rejecting order', err.message);
 
 if (!res.headersSent) {
     res.status(500).json({ error:  'Error rejecting order' });
    }
    
  }
}
module.exports = { rejectOrder };
