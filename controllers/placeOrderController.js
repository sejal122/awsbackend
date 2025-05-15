//import { placeOrderAndUploadFile } from "../services/sftpService";

const placeOrderAndUploadFile=require('../services/sftpService')
export const  appendData=async (req,res)=> {
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
