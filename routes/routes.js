
// const express = require('express');
// const app = express();
// const readCSVFileAsJSON=require('../utils/utils')
// app.get('/customer-data', async (req, res) => {
//     const data = await readCSVFileAsJSON(); // Your function
//     res.json(data); // Sends parsed JSON to frontend
//   });
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getDealers ,getDealersShrirampur,getDealersBaramati} = require('../controllers/dealerController');
const {LeadController} = require('../controllers/leadsController');
const {addFollowupController} = require('../controllers/addFollowupController');
const {getLeads} = require('../controllers/getleadsController');
const { getProducts,getProductsShrirampur,getProductsBaramati} = require('../controllers/productsController');
const { appendData ,appendDataShrirampur,appendDataBaramati} = require('../controllers/placeOrderController');
const {handleLogin,handleLoginShrirampur,handleLoginBaramati} = require('../controllers/loginController')
const {getOutstanding,getOutstandingShrirampur,getOutstandingBaramati}= require('../controllers/outstandingController')
const {getSubdealerData,getSubdealerDataShrirampur,getSubdealerDataBaramati}=require('../controllers/subDealerController')
const {getOrderHistory,getOrderHistoryShrirampur,getOrderHistoryBaramati} =require('../controllers/orderHistoryController')
const {dealerTarget,dealerTargetShrirampur,dealerTargetBaramati}=require('../controllers/dealerTargetController')
const {getpendingOrders,getpendingOrdersShrirampur,getpendingOrdersBaramati,getpendingOrdersFinal}=require('../controllers/pendingOrderController')
const { approveOrder,approveOrderFinal } = require('../controllers/approveOrderController');
const { approveOrderShrirampur,approveOrderBaramati } = require('../controllers/approveOrderController');
const { rejectOrder } = require('../controllers/rejectOrderController');
const { rejectOrderShrirampur,rejectOrderBaramati } = require('../controllers/rejectOrderController');
const { uploadVisits ,uploadVisitsShrirampur,uploadVisitsBaramati} = require('../controllers/uploadVisitsController');
const { csklogin ,cskloginShrirampur,cskloginBaramati} = require('../controllers/cskloginController');
const { replacependingordercontroller , replacependingordercontrollerShrirampur,replacependingordercontrollerBaramati } = require('../controllers/replacependingorder');
const { getInvoiceHistory ,getInvoiceHistoryShrirampur,getInvoiceHistoryBaramati} = require('../controllers/invoiceHistory');
const {postComplaint,postComplaintShrirampur,postComplaintBaramati}=require('../controllers/postComplaintController');
const {GothaController}=require('../controllers/gothaVisitsController');
const {getGotha}=require('../controllers/getGothaController');
//SATARA
router.post('/leads',LeadController)
router.post('/gotha',GothaController)
router.get('/get-gotha',getGotha)
router.post('/add-followup',addFollowupController)
router.get('/get-leads',getLeads)
router.post('/approveOrder',approveOrder)
router.post('/approveOrder-final',approveOrderFinal)
router.post('/rejectOrder',rejectOrder)
router.get('/dealers', getDealers);
router.get('/products', getProducts);
router.post('/upload-csv',appendData)
router.post('/update-order',replacependingordercontroller)
router.post('/login',handleLogin)
router.get('/outstanding',getOutstanding)
router.get('/sub-dealers',getSubdealerData)
router.get('/orderHistory',getOrderHistory)
router.get('/dealerTarget',dealerTarget)
router.get('/pendingorderHistory',getpendingOrders)
router.get('/pendingorderHistory-final',getpendingOrdersFinal)
router.post('/upload-visitdata',uploadVisits)
router.post('/handlecsklogin',csklogin)
router.get('/invoicedata',getInvoiceHistory)

//shrirampur
router.post('/approveOrder-Shrirampur',approveOrderShrirampur)
console.log('DEBUG handleLogin type:', typeof approveOrderShrirampur);

router.post('/rejectOrder-Shrirampur',rejectOrderShrirampur)
console.log('DEBUG handleLogin type:', typeof rejectOrderShrirampur);

router.get('/dealers-Shrirampur', getDealersShrirampur);
console.log('DEBUG handleLogin type:', typeof getDealersShrirampur);

router.get('/products-Shrirampur', getProductsShrirampur);
console.log('DEBUG handleLogin type:', typeof getProductsShrirampur);

router.post('/upload-csv-Shrirampur',appendDataShrirampur)
console.log('DEBUG handleLogin type:', typeof appendDataShrirampur);

console.log('DEBUG handleLogin type:', typeof handleLogin);

router.post('/update-order-Shrirampur', replacependingordercontrollerShrirampur)
console.log('DEBUG handleLogin type:', typeof replacePendingOrderShrirampur);

router.post('/login-Shrirampur',handleLoginShrirampur)
console.log('DEBUG handleLogin type:', typeof handleLoginShrirampur);

router.get('/outstanding-Shrirampur',getOutstandingShrirampur)
console.log('DEBUG handleLogin type:', typeof getOutstandingShrirampur);

router.get('/sub-dealers-Shrirampur',getSubdealerDataShrirampur)
console.log('DEBUG handleLogin type:', typeof getSubdealerDataShrirampur);

router.get('/orderHistory-Shrirampur',getOrderHistoryShrirampur)
console.log('DEBUG handleLogin type:', typeof getOrderHistoryShrirampur);

router.get('/dealerTarget-Shrirampur',dealerTargetShrirampur)
console.log('DEBUG handleLogin type:', typeof dealerTargetShrirampur);

router.get('/pendingorderHistory-Shrirampur',getpendingOrdersShrirampur)
console.log('DEBUG handleLogin type:', typeof getpendingOrdersShrirampur);

router.post('/upload-visitdata-Shrirampur',uploadVisitsShrirampur)
console.log('DEBUG handleLogin type:', typeof uploadVisitsShrirampur);

router.post('/handlecsklogin-Shrirampur',cskloginShrirampur)
console.log('DEBUG handleLogin type:', typeof cskloginShrirampur);

router.get('/invoicedata-Shrirampur',getInvoiceHistoryShrirampur)
console.log('DEBUG handleLogin type:', typeof getInvoiceHistoryShrirampur);

const storage = multer.diskStorage({
  destination: 'uploads/', // temporary local dir
  filename: (req, file, cb) => {
    const date = new Date().toISOString().slice(0, 10);
    const name = `${date}_${req.body.ID || 'unknown'}${path.extname(file.originalname)}`;
    cb(null, name);
  }
});

const upload = multer({ storage });
router.post('/upload-complaint', upload.single('photo'), postComplaint);
router.post('/upload-complaint-Shrirampur', upload.single('photo'), postComplaintShrirampur);
router.post('/upload-complaint-Baramati', upload.single('photo'), postComplaintBaramati);

//BARAMATI
router.post('/approveOrder-Baramati',approveOrderBaramati)
router.post('/rejectOrder-Baramati',rejectOrderBaramati)
router.get('/dealers-Baramati', getDealersBaramati);
router.get('/products-Baramati', getProductsBaramati);
router.post('/upload-csv-Baramati',appendDataBaramati)
router.post('/update-order-Baramati',replacependingordercontrollerBaramati)
router.post('/login-Baramati',handleLoginBaramati)
router.get('/outstanding-Baramati',getOutstandingBaramati)
router.get('/sub-dealers-Baramati',getSubdealerDataBaramati)
router.get('/orderHistory-Baramati',getOrderHistoryBaramati)
router.get('/dealerTarget-Baramati',dealerTargetBaramati)
router.get('/pendingorderHistory-Baramati',getpendingOrdersBaramati)
router.post('/upload-visitdata-Baramati',uploadVisitsBaramati)
router.post('/handlecsklogin-Baramati',cskloginBaramati)
router.get('/invoicedata-Baramati',getInvoiceHistoryBaramati)








module.exports = router;
