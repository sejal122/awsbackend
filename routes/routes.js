
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
const { getDealers } = require('../controllers/dealerController');
const { getProducts } = require('../controllers/productsController');
const { appendData } = require('../controllers/placeOrderController');
const {handleLogin} = require('../controllers/loginController')
const {getOutstanding}= require('../controllers/outstandingController')
const {getSubdealerData}=require('../controllers/subDealerController')
const {getOrderHistory} =require('../controllers/orderHistoryController')
const {dealerTarget}=require('../controllers/dealerTargetController')
const {getpendingOrders}=require('../controllers/pendingOrderController')
const { approveOrder } = require('../controllers/approveOrderController');
const { rejectOrder } = require('../controllers/rejectOrderController');
const { uploadVisits } = require('../controllers/uploadVisitsController');
const { csklogin } = require('../controllers/cskloginController');
const { replacependingordercontroller } = require('../controllers/replacependingorder');
const { getInvoiceHistory } = require('../controllers/invoiceHistory');
const {postComplaint}=require('../controllers/postComplaintController');
router.post('/approveOrder',approveOrder)
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
router.post('/upload-visitdata',uploadVisits)
router.post('/handlecsklogin',csklogin)
router.get('/invoicedata',getInvoiceHistory)

//shrirampur
router.post('/approveOrder-Shrirampur',approveOrder)
router.post('/rejectOrder-Shrirampur',rejectOrder)
router.get('/dealers-Shrirampur', getDealers);
router.get('/products-Shrirampur', getProducts);
router.post('/upload-csv-Shrirampur',appendData)
router.post('/update-order-Shrirampur',replacependingordercontroller)
router.post('/login-Shrirampur',handleLogin)
router.get('/outstanding-Shrirampur',getOutstanding)
router.get('/sub-dealers-Shrirampur',getSubdealerData)
router.get('/orderHistory-Shrirampur',getOrderHistory)
router.get('/dealerTarget-Shrirampur',dealerTarget)
router.get('/pendingorderHistory-Shrirampur',getpendingOrders)
router.post('/upload-visitdata-Shrirampur',uploadVisits)
router.post('/handlecsklogin-Shrirampur',csklogin)
router.get('/invoicedata-Shrirampur',getInvoiceHistory)
router.post('/upload-complaint-Shrirampur', upload.single('photo'), postComplaint);
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
