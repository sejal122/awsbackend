//import { placeOrderAndUploadFile } from "../services/sftpService";

const placeOrderAndUploadFile=require('../services/sftpService')
 const  appendData=async (req,res)=> {
  console.log('hi')
    const orderJson = req.body
    console.log(orderJson)

try {
    const data = await placeOrderAndUploadFile(orderJson);
    
  
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error uploading order', err.message);
    res.status(500).json({ error: 'Failed to upload order' });
  }
}
module.exports = { appendData };
