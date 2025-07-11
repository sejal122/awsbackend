//import { placeOrderAndUploadFile } from "../services/sftpService";

const { approveOrderAndUploadFile,approveOrderAndUploadFileShrirampur } = require('../services/sftpService');

 const  approveOrder=async (req,res)=> {

    const {  doc_number,approvedHistoryFormat } = req.body;
    console.log(approvedHistoryFormat)
    console.log(doc_number)

try {
    const data = await approveOrderAndUploadFile(doc_number,approvedHistoryFormat);
  
  
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error approving order', err.message);
 
 if (!res.headersSent) {
     res.status(500).json({ error:  'Error approving order' });
    }
    
  }
}

//shrirampur
 const  approveOrderShrirampur=async (req,res)=> {

    const {  doc_number,approvedHistoryFormat } = req.body;
    console.log(approvedHistoryFormat)
    console.log(doc_number)

try {
    const data = await approveOrderAndUploadFileShrirampur(doc_number,approvedHistoryFormat);
  
  
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error approving order', err.message);
 
 if (!res.headersSent) {
     res.status(500).json({ error:  'Error approving order' });
    }
    
  }
}
module.exports = {
  approveOrder,
  approveOrderShrirampur
};
