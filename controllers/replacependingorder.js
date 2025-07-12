const { replacePendingOrder ,replacePendingOrderShrirampur,replacePendingOrderBaramati} = require('../services/sftpService');
const  replacependingordercontroller=async (req,res)=> {

    const { purch_no_c,updatedOrderArray } = req.body;
    console.log(updatedOrderArray)
    console.log(purch_no_c)

try {
    
 
    const data = await replacePendingOrder(purch_no_c,updatedOrderArray);
  
  
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error updating order', err.message);
 if (!res.headersSent) {
     res.status(500).json({ error:  'Error updating order' });
    }
    
  }
}

const  replacependingordercontrollerShrirampur=async (req,res)=> {

    const { purch_no_c,updatedOrderArray } = req.body;
    console.log(updatedOrderArray)
    console.log(purch_no_c)

try {
    
 
    const data = await replacePendingOrderShrirampur(purch_no_c,updatedOrderArray);
  
  
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error updating order', err.message);
 if (!res.headersSent) {
     res.status(500).json({ error:  'Error updating order' });
    }
    
  }
}
const  replacependingordercontrollerBaramati=async (req,res)=> {

    const { purch_no_c,updatedOrderArray } = req.body;
    console.log(updatedOrderArray)
    console.log(purch_no_c)

try {
    
 
    const data = await replacePendingOrderBaramati(purch_no_c,updatedOrderArray);
  
  
    res.json(data);
    console.log(data)
  } catch (err) {
    console.error('Error updating order', err.message);
 if (!res.headersSent) {
     res.status(500).json({ error:  'Error updating order' });
    }
    
  }
}
module.exports = {replacependingordercontroller , replacependingordercontrollerShrirampur,replacependingordercontrollerBaramati};
