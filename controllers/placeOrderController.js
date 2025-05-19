//import { placeOrderAndUploadFile } from "../services/sftpService";

const { placeOrderAndUploadFile } = require('../services/sftpService');

 const  appendData=async (req,res)=> {
  console.log('hi')
    const orderJson = req.body
    console.log(orderJson)

try {
    const data = await placeOrderAndUploadFile(orderJson);
    
  
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error uploading orderrrrrrrrrrr', err.message);
 if (!res.headersSent) {
     res.status(500).json({ error:  'Error uploading order' });
    }
    
  }
}
module.exports = { appendData };
