
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
const { replacependingordercontroller ,replacePendingOrderShrirampur } = require('../controllers/replacependingorder');
const { getInvoiceHistory ,getInvoiceHistoryShrirampur} = require('../controllers/invoiceHistory');
const {postComplaint,postComplaintShrirampur}=require('../controllers/postComplaintController');
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
router.post('/rejectOrder-Shrirampur',rejectOrderShrirampur)
router.get('/dealers-Shrirampur', getDealersShrirampur);
router.get('/products-Shrirampur', getProductsShrirampur);
router.post('/upload-csv-Shrirampur',appendDataShrirampur)
router.post('/update-order-Shrirampur',replacePendingOrderShrirampur)
router.post('/login-Shrirampur',handleLoginShrirampur)
router.get('/outstanding-Shrirampur',getOutstandingShrirampur)
router.get('/sub-dealers-Shrirampur',getSubdealerDataShrirampur)
router.get('/orderHistory-Shrirampur',getOrderHistoryShrirampur)
router.get('/dealerTarget-Shrirampur',dealerTargetShrirampur)
router.get('/pendingorderHistory-Shrirampur',getpendingOrdersShrirampur)
router.post('/upload-visitdata-Shrirampur',uploadVisitsShrirampur)
router.post('/handlecsklogin-Shrirampur',cskloginShrirampur)
router.get('/invoicedata-Shrirampur',getInvoiceHistoryShrirampur)
router.post('/upload-complaint-Shrirampur', upload.single('photo'), postComplaintShrirampur);
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

module.exports = router;
