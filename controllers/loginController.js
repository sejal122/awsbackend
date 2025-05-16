const {fetchAndParseCSV} =require('../services/sftpService')
const  handleLogin=async (req,res)=> {
const {phone}=req.body
console.log(phone)
try {
    const dealers = await fetchAndParseCSV(); // Should return array of dealer objects
    console.log(dealers)
    console.log(typeof dealers)
    const dealer = dealers.find(d => d.phone === phone);

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
module.exports={handleLogin}
