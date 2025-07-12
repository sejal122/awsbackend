const {fetchAndParseCSV,fetchAndParseCSVShrirampur,fetchAndParseCSVBaramati} =require('../services/sftpService')
const  csklogin=async (req,res)=> {
const {identifier}=req.body
const phone=identifier
console.log("phone")
console.log(req.body)
try {
    let dealers = await fetchAndParseCSV();
    console.log(dealers)
    // console.log("dealers") // Should return array of dealer objects
    // console.log(dealers)
    //console.log(typeof dealers)
    
     dealers=Object.values(dealers);
    // const dealer = dealers.find(d => d.Phone_number === phone);
   
    const dealer = dealers.filter(d => d['Telephone 1'] === phone);
console.log(dealer)
    if (dealer) {
      res.json({ success: true, dealer });
    } else {
      res.status(401).json({ success: false, message: 'Phone number not registered' });
    }
  } catch (err) {
    console.error('Error fetching dealers:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

const  cskloginShrirampur=async (req,res)=> {
const {identifier}=req.body
const phone=identifier
console.log("phone")
console.log(req.body)
try {
    let dealers = await fetchAndParseCSVShrirampur();
    console.log(dealers)
    // console.log("dealers") // Should return array of dealer objects
    // console.log(dealers)
    //console.log(typeof dealers)
    
     dealers=Object.values(dealers);
    // const dealer = dealers.find(d => d.Phone_number === phone);
   
    const dealer = dealers.filter(d => d['Telephone 1'] === phone);
console.log(dealer)
    if (dealer) {
      res.json({ success: true, dealer });
    } else {
      res.status(401).json({ success: false, message: 'Phone number not registered' });
    }
  } catch (err) {
    console.error('Error fetching dealers:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

const  cskloginBaramati=async (req,res)=> {
const {identifier}=req.body
const phone=identifier
console.log("phone")
console.log(req.body)
try {
    let dealers = await fetchAndParseCSVShrirampur();
    console.log(dealers)
    // console.log("dealers") // Should return array of dealer objects
    // console.log(dealers)
    //console.log(typeof dealers)
    
     dealers=Object.values(dealers);
    // const dealer = dealers.find(d => d.Phone_number === phone);
   
    const dealer = dealers.filter(d => d['Telephone 1'] === phone);
console.log(dealer)
    if (dealer) {
      res.json({ success: true, dealer });
    } else {
      res.status(401).json({ success: false, message: 'Phone number not registered' });
    }
  } catch (err) {
    console.error('Error fetching dealers:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
module.exports={csklogin,cskloginShrirampur,cskloginBaramati}
