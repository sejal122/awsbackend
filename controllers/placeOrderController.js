//import { placeOrderAndUploadFile } from "../services/sftpService";

const { placeOrderAndUploadFile ,placeOrderAndUploadFileShrirampur,placeOrderAndUploadFileBaramati} = require('../services/sftpService');

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


 const  appendDataShrirampur=async (req,res)=> {
  console.log('hi')
    const orderJson = req.body
    console.log(orderJson)

try {
    const data = await placeOrderAndUploadFileShrirampur(orderJson);
  
  
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error uploading orderrrrrrrrrrr', err.message);
 if (!res.headersSent) {
     res.status(500).json({ error:  'Error uploading order' });
    }
    
  }
}


 const  appendDataBaramati=async (req,res)=> {
  console.log('hi')
    const orderJson = req.body
    console.log(orderJson)

try {
    const data = await placeOrderAndUploadFileBaramati(orderJson);
  
  
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error uploading orderrrrrrrrrrr', err.message);
 if (!res.headersSent) {
     res.status(500).json({ error:  'Error uploading order' });
    }
    
  }
}
module.exports = { appendData ,appendDataShrirampur,appendDataBaramati};
