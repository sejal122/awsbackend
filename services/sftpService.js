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
function formatDate(dateString) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}
async function placeOrderAndUploadFile(orderJsonInput) {
 const orderJson = Array.isArray(orderJsonInput)
  ? orderJsonInput
  : orderJsonInput
  ? [orderJsonInput]
  : [];
   const sftp = new Client();

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

  // Step 1: Check if file exists and download it
  const fileExists = await sftp.exists(remotePath);
  if (fileExists) {
    await sftp.fastGet(remotePath, tempPath);

    // Step 2: Parse existing CSV to JSON
    const data = fs.readFileSync(tempPath);
    await new Promise((resolve, reject) => {
      fs.createReadStream(tempPath)
        .pipe(csvParser())
        .on("data", (row) => existingRows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });
  }
    // Flatten orderJson into individual item rows
    const flattenedRows = [];
    let srNo = 1;

    orderJson.forEach((order) => {
      const dealerId = order.dealerId || "";
      const dealerName = order.dealerName || "";
      const subDealerId = order.subDealerId || "";
      const subDealerName = order.subDealerName || "";
      const docDate = formatDate(order.savedAt || new Date());
      const items = order.items || [];
      items.forEach((item, index) => {
        const product = item.product || {};
        const quantity = item.quantity || "";

        flattenedRows.push({
          "SR NO": srNo,
          "Doc type": "ZOR",
          "Sales org": "2000",
          "Sales off(Headquarter)":  "",
          "Dist channel": "10",
          "Division": "10",
          "Sector": "",
          "Doc date": docDate,
          "Payment terms": "",
          "purch_no_c": order.orderId,
          "purch_date": docDate,
          "req_date_h": "00.00.0000",
          "sold_to":  dealerId,
          "Account Name": dealerName,
          "City":  "",
          "Street Add": "NA",
          "Phone": "",
          "Sold_Region":"",
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

      srNo++; // Increment for next dealer
    });
 const allRows = [...existingRows, ...flattenedRows];
    // Generate CSV
    const json2csvParser = new Parser({
     fields: allRows.length
  ? Object.keys(allRows[0])
  : ["SR NO", "Doc type", "Sales org", "Sales off(Headquarter)", "Dist channel", "Division", "Sector", "Doc date", "Payment terms", "purch_no_c", "purch_date", "req_date_h", "sold_to", "Account Name", "City", "Street Add", "Phone", "Sold_Region", "ship_to", "Name", "City_name", "Street_Add", "PhoneNumber", "Ship_Region", "bill_to", "payer", "plant", "itm_number", "material", "target_qty", "target_qu", "cust_mat35", "sched_type", "sched_line", "sch_DATE", "req_qty", "Incoterms", "Place", "Cond Type - ZPR0", "Cond Value"]
    });

    const csv = json2csvParser.parse(allRows);
    fs.writeFileSync(tempPath, csv);

    // Upload to SFTP
    await sftp.put(tempPath, remotePath);
    await sftp.end();

    console.log("CSV uploaded successfully.");

  } catch (err) {
    console.error("SFTP Error:", err);
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
