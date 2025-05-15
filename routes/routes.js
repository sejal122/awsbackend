
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
router.get('/dealers', getDealers);
router.get('/products', getProducts);
app.post('/api/upload-csv',appendData)
module.exports = router;
