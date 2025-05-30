const Client = require('ssh2-sftp-client');
const { parseCSV,parseOutstandingCSV,parsePendingOrderCSV } = require('../utils/csvParser');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
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
  //console.log(fileBuffer)
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

const Papa = require('papaparse');

async function placeOrderAndUploadFile(orderJson) {
  const sftp = new Client();
  const fileName = `pendingOrders.csv`;
  const tempPath = path.join(__dirname, '..', 'uploads', fileName);
  const remotePath = `/DIR_MAGICAL/DIR_MAGICAL_Satara/SO/${fileName}`;

  try {
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });

    // 1. Read existing file if any
    let existingRows = [];
    try {
      const tempDownload = path.join(__dirname, '..', 'uploads', 'existing_' + fileName);
      await sftp.fastGet(remotePath, tempDownload);

      const fileContent = fs.readFileSync(tempDownload, 'utf-8').trim();
      const parsed = Papa.parse(fileContent, { header: true });
      existingRows = parsed.data.filter(row => row['OrderID']); // ignore empty lines
    } catch (err) {
      console.log('No existing file or error reading existing orders. Creating new one.');
    }

    // 2. Determine current max Sr. No.
    let currentSrNo = 0;
    if (existingRows.length > 0) {
      const srNos = existingRows.map(row => parseInt(row['Sr. No.'] || '0')).filter(n => !isNaN(n));
      currentSrNo = srNos.length > 0 ? Math.max(...srNos) : 0;
    }

    // 3. Flatten incoming orderJson into rows
const newRows = orderJson.orderItems.map(item => ({
  "SR NO": currentSrNo + 1,
  "Doc type": "ZOR",
  "Sales org": "2000",
  "Sales off(Headquarter)": "",
  "Dist channel": "10",
  "Division": "10",
  "Sector": "",
  "Doc date": orderJson.orderDate || "",
  "Payment terms": "",
  "purch_no_c": orderJson.orderId || "",
  "purch_date": orderJson.orderDate || "",
  "req_date_h": "00.00.0000",
  "sold_to": orderJson.dealer?.id || "",
  "Account Name": orderJson.dealer?.name || "",
  "City": orderJson.dealer?.location || "",
  "Street Add": "NA",
  "Phone": "",
  "Sold_Region": "",
  "ship_to": orderJson.dealer?.subDealerId || orderJson.dealer?.id || ""
  "Name": "",
  "City_name": "",
  "Street_Add": "",
  "PhoneNumber": "",
  "Ship_Region": "",
  "bill_to": "",
  "payer": "",
  "plant": "2010",
  "itm_number": (index + 1) * 10, // Optional item number if you want
  "material": item.product?.["Material CODE"] || "",
  "target_qty": item.quantity || "",
  "target_qu": "BAG",
  "cust_mat35": item.product?.["Material Name"] || "",
  "sched_type": "",
  "sched_line": "1",
  "sch_DATE": "00.00.0000",
  "req_qty": item.quantity || "",
  "Incoterms": "",
  "Place": "",
  "Cond Type - ZPR0": "",
  "Cond Value": ""
}));

    const allRows = [...existingRows, ...newRows];

    // 4. Generate CSV
    const csv = Papa.unparse(allRows);
    fs.writeFileSync(tempPath, csv);

    // 5. Upload to SFTP
    await sftp.put(tempPath, remotePath);
    await sftp.end();

    console.log(`CSV uploaded successfully to: ${remotePath}`);
  } catch (err) {
    console.error('SFTP Error:', err);
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
    console.log(fileBuffer)
    await sftp.end();
  
    const csvText = fileBuffer.toString('utf-8');
   
    console.log(csvText)

  

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
module.exports = {fetchAndParsependingOrdersCSV,fetchAndParseDealerTargetCSV, fetchAndParseOrderHistoryCSV,fetchAndParseSubDealerCSV,fetchOutstandingAndParseCSV,fetchAndParseCSV,fetchAndParseProductsCSV ,placeOrderAndUploadFile,verifyDealer};
