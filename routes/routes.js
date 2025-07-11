
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
const { getDealers ,getDealersShrirampur} = require('../controllers/dealerController');
const { getProducts,getProductsShrirampur } = require('../controllers/productsController');
const { appendData ,appendDataShrirampur} = require('../controllers/placeOrderController');
const {handleLogin,handleLoginShrirampur} = require('../controllers/loginController')
const {getOutstanding,getOutstandingShrirampur}= require('../controllers/outstandingController')
const {getSubdealerData,getSubdealerDataShrirampur}=require('../controllers/subDealerController')
const {getOrderHistory,getOrderHistoryShrirampur} =require('../controllers/orderHistoryController')
const {dealerTarget,dealerTargetShrirampur}=require('../controllers/dealerTargetController')
const {getpendingOrders,getpendingOrdersShrirampur}=require('../controllers/pendingOrderController')
const { approveOrder } = require('../controllers/approveOrderController');
const { approveOrderShrirampur } = require('../controllers/approveOrderController');
const { rejectOrder } = require('../controllers/rejectOrderController');
const { rejectOrderShrirampur } = require('../controllers/rejectOrderController');
const { uploadVisits ,uploadVisitsShrirampur} = require('../controllers/uploadVisitsController');
const { csklogin ,cskloginShrirampur} = require('../controllers/cskloginController');
const { replacependingordercontroller , replacependingordercontrollerShrirampur } = require('../controllers/replacependingorder');
const { getInvoiceHistory ,getInvoiceHistoryShrirampur} = require('../controllers/invoiceHistory');
const {postComplaint,postComplaintShrirampur}=require('../controllers/postComplaintController');

//SATARA
router.post('/approveOrder',approveOrder)
router.post('/rejectOrder',rejectOrder)
router.get('/dealers', getDealersShrirampur);
router.get('/products', getProducts);
router.post('/upload-csv',appendData)
router.post('/update-order',replacependingordercontroller)
router.post('/login',handleLogin)
router.get('/outstanding',getOutstanding)
router.get('/sub-dealers',getSubdealerData)
router.get('/orderHistory',getOrderHistory)
router.get('/dealerTarget',dealerTarget)
router.get('/pendingorderHistory',getpendingOrders)
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
module.exports = router;
