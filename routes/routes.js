
// const express = require('express');
// const app = express();
// const readCSVFileAsJSON=require('../utils/utils')
// app.get('/customer-data', async (req, res) => {
//     const data = await readCSVFileAsJSON(); // Your function
//     res.json(data); // Sends parsed JSON to frontend
//   });
const express = require('express');
const router = express.Router();
const { getDealers } = require('../controllers/dealerController');
const { getProducts } = require('../controllers/productsController');
const { appendData } = require('../controllers/placeOrderController');
const {handleLogin} = require('../controllers/loginController')
const {getOutstanding}= require('../controllers/outstandingController')
const {getSubdealerData}=require('../controllers/subDealerController')
const {getOrderHistory} =require('../controllers/orderHistoryController')
const {dealerTarget}=require('../controllers/dealerTargetController')
router.get('/dealers', getDealers);
router.get('/products', getProducts);
router.post('/upload-csv',appendData)
router.post('/login',handleLogin)
router.get('/outstanding',getOutstanding)
router.get('/sub-dealers',getSubdealerData)
router.get('/orderHistory',getOrderHistory)
router.get('/dealerTarget',dealerTarget)
router.get('/pendingorderHistory',getpendingOrders)
module.exports = router;
