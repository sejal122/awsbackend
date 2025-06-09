const Client = require('ssh2-sftp-client');
const { parseCSV,parseOutstandingCSV,parsePendingOrderCSV } = require('../utils/csvParser');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const csv=require('csv-parser')
async function fetchAndParseDealerTargetCSV() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_MAGICAL/DIR_MAGICAL_Satara/targets/SALES Target Vs Achievement.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}
async function fetchAndParseOrderHistoryCSV() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_MAGICAL/DIR_MAGICAL_Satara/Price/ORDER STATUS.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}
async function fetchAndParseCSV() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_MAGICAL/DIR_MAGICAL_Satara/Customer/Dealers.csv');
  console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}


async function fetchAndParseSubDealerCSV() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_MAGICAL/DIR_MAGICAL_Satara/Hierarchy/Dealer & Subdealer list From SAP.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}

async function fetchAndParseProductsCSV() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_MAGICAL/DIR_MAGICAL_Satara/Price/HANA TEMPLET GROUP WISE1.csv');
  console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}
   function cleanAndParse(str) {
  try {
    const unquoted = str.replace(/^"|"$/g, '');     // remove surrounding quotes
    const fixed = unquoted.replace(/""/g, '"');     // replace double double-quotes
    return JSON.parse(fixed);
  } catch (err) {
    console.error('Parsing failed:', str);
    return null;
  }
}
const csvParser = require("csv-parser");
const Papa = require('papaparse');
function formatDate(dateString) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}
async function placeOrderAndUploadFile(invoiceData) {
  const sftp = new Client();
  const orderJson = Array.isArray(invoiceData.orderItems)
    ? invoiceData.orderItems
    : [];

 
  try {
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });

    const fileName = `pendingOrders.csv`;
    const tempPath = path.join(__dirname, "..", "uploads", fileName);
    const remotePath = `/DIR_MAGICAL/DIR_MAGICAL_Satara/SO/${fileName}`;

    let existingRows = [];

    // Download existing file if it exists
    const fileExists = await sftp.exists(remotePath);
    if (fileExists) {
      await sftp.fastGet(remotePath, tempPath);
      const data = fs.readFileSync(tempPath);

      await new Promise((resolve, reject) => {
        fs.createReadStream(tempPath)
          .pipe(csvParser())
          .on("data", (row) => existingRows.push(row))
          .on("end", resolve)
          .on("error", reject);
      });
    }

    // Flatten order items
    const flattenedRows = [];
    let srNo = 1;
 const dealerId = invoiceData?.dealer?.id || "";
  const dealerName = invoiceData?.dealer?.name || "";
  const docDate = formatDate(invoiceData?.orderDate || "");
  const purch_no_c = invoiceData?.orderId || "";

    for (const order of orderJson) {
 
      const subDealerId = order.subDealerId || "";
      const docDate = formatDate(order.savedAt || new Date());
      const items = order.items || [];

      items.forEach((item, index) => {
        const product = item.product || {};
        const quantity = item.quantity || "";

        flattenedRows.push({
          "SR NO": srNo,
          "Doc type": "ZOR",
          "Sales org": "2000",
          "Sales off(Headquarter)": "",
          "Dist channel": "10",
          "Division": "10",
          "Sector": "",
          "Doc date": docDate,
          "Payment terms": "",
          "purch_no_c":purch_no_c || "",
          "purch_date": docDate,
          "req_date_h": "00.00.0000",
          "sold_to": dealerId,
          "Account Name": dealerName,
          "City": "",
          "Street Add": "NA",
          "Phone": "",
          "Sold_Region": "",
          "ship_to": subDealerId || dealerId,
          "Name": "",
          "City_name": "",
          "Street_Add": "",
          "PhoneNumber": "",
          "Ship_Region": "",
          "bill_to": "",
          "payer": "",
          "plant": "2010",
          "itm_number": (index + 1) * 10,
          "material": product["Material CODE"] || "",
          "target_qty": quantity,
          "target_qu": "BAG",
          "cust_mat35": product["Material Name"] || "",
          "sched_type": "CP",
          "sched_line": "1",
          "sch_DATE": "00.00.0000",
          "req_qty": quantity,
          "Incoterms": "",
          "Place": "",
          "Cond Type - ZPR0": product["Pricing Condition"] || "",
          "Cond Value": product["Price"] || "",
        });
      });

      srNo++;
    }

    const allRows = [...existingRows, ...flattenedRows];

    // Generate CSV
    const json2csvParser = new Parser({
      fields: Object.keys(allRows[0]),
    });

    const csv = json2csvParser.parse(allRows);
    fs.writeFileSync(tempPath, csv);

    // Upload CSV to SFTP
    await sftp.put(tempPath, remotePath);
    await sftp.end();

    console.log("CSV uploaded successfully.");
    return { success: true };
  } catch (err) {
    console.error("SFTP Error:", err);
    return { success: false, error: err };
  }
}


async function verifyDealer() {
 const sftp = new Client();
  try{
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });
  
 
    const fileBuffer = await sftp.get('/DIR_MAGICAL/DIR_MAGICAL_Satara/Customer/Dealers.csv');
    //console.log(fileBuffer)
    await sftp.end();
  
    const csvText = fileBuffer.toString('utf-8');
   
   // console.log(csvText)

  

  }catch (err) {
    console.error('SFTP Error:', err);
  }

}
async function fetchOutstandingAndParseCSV() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_MAGICAL/DIR_MAGICAL_Satara/on-account/custopen.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseOutstandingCSV(csvText);
}
async function fetchAndParsependingOrdersCSV() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_MAGICAL/DIR_MAGICAL_Satara/SO/pendingOrders.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parsePendingOrderCSV(csvText);
}

function parseCsvforApproveorder(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}
async function approveOrderAndUploadFile(doc_number,approvedOrders) {
  const sftp = new Client();
  try{
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });


    
    //original and temp for pending orders
    const pendingordersoriginalpath='/DIR_MAGICAL/DIR_MAGICAL_Satara/SO/pendingOrders.csv'
    const temppendingorder=path.join(__dirname, "..", "uploads", "temppendingorder.csv");

    //original and temp for order status
    const orderstatustempPath = path.join(__dirname, "..", "uploads", "orderstatus.csv");
    const orderstatusoriginalpath='/DIR_MAGICAL/DIR_MAGICAL_Satara/Price/ORDER STATUS.csv'

    //original and temp for final order
    const fileName = `Orders.csv`;
    const pendingPath = path.join(__dirname,"..", 'uploads', 'Orders.csv');
    const remotePath = `/DIR_MAGICAL/DIR_MAGICAL_Satara/SO/${fileName}`;
   
    //download pending orders, order status
    await sftp.fastGet(pendingordersoriginalpath , temppendingorder);
    await sftp.fastGet(remotePath , pendingPath);
    await sftp.fastGet(orderstatusoriginalpath , orderstatustempPath);

const pendingOrders = await parseCsvforApproveorder(temppendingorder);
const finalOrders = fs.existsSync(pendingPath)
  ? await parseCsvforApproveorder(pendingPath)
  : [];
const orderstatus = await parseCsvforApproveorder(orderstatustempPath);

    console.log('------')
  console.log(pendingOrders)
    console.log(finalOrders)
    console.log(orderstatus)
      // 3. Filter matching & non-matching orders
    const approvedOrders = pendingOrders.filter(order => order['purch_no_c'] === purch_no_c);
    const updatedPending = pendingOrders.filter(order => order['purch_no_c']!== purch_no_c);


       // 4. Determine next sr_no
       const existingSrNos = finalOrders.map(o => o.Sr_no).filter(Boolean);
       const maxSrNo = existingSrNos.length > 0 ? Math.max(...existingSrNos) : 0;
       const nextSrNo = maxSrNo + 1;
   
       // 5. Add sr_no to all approved orders
    const approvedWithSrNo = approvedOrders.map(order => ({
      ...order,
      Sr_no: nextSrNo,
    }));

    finalOrders.push(...approvedWithSrNo);
    orderstatus.push(approvedOrders)

    fs.writeFileSync(temppendingorder, JSON.stringify(updatedPending, null, 2));
    fs.writeFileSync(pendingPath, JSON.stringify(finalOrders, null, 2));
    fs.writeFileSync(orderstatustempPath, JSON.stringify(orderstatus, null, 2));
    //const updatedorderHistory=lastorderhistory.filter(order => order.purch_no_c !== doc_number);

 // 7. Upload updated files to server
 await sftp.fastPut(temppendingorder, pendingordersoriginalpath);
 await sftp.fastPut(pendingPath, remotePath);
 await sftp.fastPut(orderstatustempPath, orderstatusoriginalpath);
 res.status(200).json({
  message: `Order ${purch_no_c} approved & updated`,
  sr_no: nextSrNo,
  
});
  }
  catch(err){
    console.error('Approval error:', err);
   
  }
  finally {
    sftp.end();
  }
}

module.exports = {approveOrderAndUploadFile , fetchAndParsependingOrdersCSV,fetchAndParseDealerTargetCSV, fetchAndParseOrderHistoryCSV,fetchAndParseSubDealerCSV,fetchOutstandingAndParseCSV,fetchAndParseCSV,fetchAndParseProductsCSV ,placeOrderAndUploadFile,verifyDealer};
