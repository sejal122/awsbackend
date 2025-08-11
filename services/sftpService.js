const Client = require('ssh2-sftp-client');
const { parseCSV,parseOutstandingCSV,parsePendingOrderCSV ,parsefinalorderCSV,parseLeads} = require('../utils/csvParser');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const csv=require('csv-parser')
const os = require('os');
const { stringify } = require('csv-stringify/sync');

//SATARA PLANT

async function addFollowupCSV(leadID, followup) {
  console.log("****** id *****");
  console.log(leadID);
  const remotePath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Leads/Leads_2010.csv';
  const tempLocal = path.join(__dirname, 'Leads_2010_temp.csv');
 const sftp = new Client();
  try {
    await sftp.connect({
      host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
    });

    // Download CSV
    await sftp.fastGet(remotePath, tempLocal);

    // Read CSV
    const leads = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(tempLocal)
        .pipe(csv())
        .on('data', (row) => leads.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    // Find matching lead by "ID" column
    const leadIndex = leads.findIndex(l => String(l.ID) === String(leadID));
    if (leadIndex === -1) {
      throw new Error('Lead not found');
    }

    // Parse followups from CSV
    let followups = [];
    try {
      followups = leads[leadIndex].Followups ? JSON.parse(leads[leadIndex].Followups) : [];
    } catch {
      followups = [];
    }

    // Append new followup
    followups.push(followup);
    leads[leadIndex].Followups = JSON.stringify(followups);

    // Write back to CSV
    const csvData = stringify(leads, { header: true });
    fs.writeFileSync(tempLocal, csvData);
    await sftp.fastPut(tempLocal, remotePath);

    return leads[leadIndex];
  } finally {
    sftp.end();
    if (fs.existsSync(tempLocal)) fs.unlinkSync(tempLocal);
  }
}

async function fetchLeadsCSV() {
   const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Leads/Leads_2010.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
 console.log(csvText);
  return parseLeads(csvText);
}

async function uploadLeadCSV(leadData) {
  const sftp = new Client();
  const headerMap = {
    id: "ID",
    salesmanName: "Salesman Name",
    sectorName: "Sector Name",
    subSectorName: "Sub Sector Name",
    email: "Email",
    companyName: "Company Name",
    monthlyConsumption: "Monthly Consumption",
    competitor: "Competitor",
    potential: "Potential",
    ownerName: "Owner Name",
    address: "Address",
    productNames: "Product Names",
    followups: "Followups",
    createdAt: "Created At"
  };

  try {
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });

    const fileName = `Leads_2010.csv`;
    const tempPath = path.join(__dirname, "..", "uploads", fileName);
    const remotePath = `/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Leads/${fileName}`;

    let existingRows = [];

    // Step 1: Download existing CSV if exists
    const fileExists = await sftp.exists(remotePath);
    if (fileExists) {
      await sftp.fastGet(remotePath, tempPath);

      await new Promise((resolve, reject) => {
        fs.createReadStream(tempPath)
          .pipe(csvParser())
          .on("data", (row) => existingRows.push(row))
          .on("end", resolve)
          .on("error", reject);
      });
    }

    // Step 2: Ensure followups is always an array
    if (!Array.isArray(leadData.followups)) {
      if (leadData.followups) {
        // Wrap single followup into array
        leadData.followups = [leadData.followups];
      } else {
        // Empty array if nothing passed
        leadData.followups = [];
      }
    }

    // Step 3: Map incoming leadData to match CSV headers
    const newLeadRow = {};
    for (const key in headerMap) {
      if (Object.prototype.hasOwnProperty.call(headerMap, key)) {
        let value = leadData[key] ?? "";
        if (key === "followups") {
          // Always stringify the array
          value = JSON.stringify(value);
        }
        newLeadRow[headerMap[key]] = value;
      }
    }

    // Step 4: Merge and keep header order consistent
    const allRows = [...existingRows, newLeadRow];
    const json2csvParser = new Parser({ fields: Object.values(headerMap) });
    const csv = json2csvParser.parse(allRows);

    // Step 5: Save locally and upload
    fs.writeFileSync(tempPath, csv, "utf8");
    await sftp.put(tempPath, remotePath);
    await sftp.end();

    console.log("✅ Lead CSV uploaded successfully.");
    return { success: true };
  } catch (err) {
    console.error("❌ SFTP Error:", err);
    return { success: false, error: err.message };
  }
}





async function saveComplaintToSFTP({ ID, Name, date, filePath, fileName }) {
 const sftp = new Client();


  const remotePhotoDir = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Complaints/Photos';
const csvRemotePath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Complaints/complaints.csv';
  const localTempCsv = path.join(os.tmpdir(), 'Complaints_temp.csv');
  try {
  await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
   });
    // Upload photo to SFTP
    const remotePhotoPath = `${remotePhotoDir}/${fileName}`;
    await sftp.put(filePath, remotePhotoPath);
    console.log('✅ Photo uploaded:', remotePhotoPath);

    // Ensure CSV exists or create it locally
    await sftp.fastGet(csvRemotePath, localTempCsv).catch(async () => {
      await fs.writeFileSync(localTempCsv, `"DealerID","DealerName","Date","PhotoFileName","PhotoPath"\n`, 'utf8' );
    });

    const newLine = [
      ID,
      Name,
      date,
      fileName,
      remotePhotoPath
    ].map(v => `"${v.replace(/"/g, '""')}"`).join(',') + '\n';

    await fs.appendFileSync(localTempCsv, newLine,  'utf8' );

    // Upload updated CSV
    await sftp.fastPut(localTempCsv, csvRemotePath);
    console.log('✅ Complaint metadata saved');
  } catch (err) {
    console.error('❌ Failed to upload complaint:', err.message);
    throw err;
  } finally {
    await sftp.end();
  }
}



async function RejectOrderAndUploadFile(doc_number, approvedHistoryFormat) {
  const sftp = new Client();

  try {
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });

    const pendingordersoriginalpath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/SO/pendingOrders.csv';
    const temppendingorder = path.join(__dirname, "..", "uploads", "temppendingorder.csv");

    const orderstatustempPath = path.join(__dirname, "..", "uploads", "orderstatus.csv");
    const orderstatusoriginalpath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Price/ORDER STATUS.csv';

    // Step 1: Download files
    await sftp.fastGet(pendingordersoriginalpath, temppendingorder);
    await sftp.fastGet(orderstatusoriginalpath, orderstatustempPath);

    // Step 2: Parse files
    const rawCsv = fs.readFileSync(temppendingorder, 'utf-8');
    const pendingOrders = await parsePendingOrderCSV(rawCsv);
    const orderstatus = await parseCSVstatus(orderstatustempPath);

    // Step 3: Remove rejected order from pending list
    const updatedPending = pendingOrders.filter(order => order.purch_no_c !== doc_number);

    // Step 4: Add rejection entry to order status list
    orderstatus.push(approvedHistoryFormat);

    // Step 5: Write back updated data
    await writeCSV(temppendingorder, updatedPending);
    await writeOrderCSV(orderstatustempPath, orderstatus.flat());

    // Step 6: Upload updated files
    await sftp.fastPut(temppendingorder, pendingordersoriginalpath);
    await sftp.fastPut(orderstatustempPath, orderstatusoriginalpath);
    
    return { success: true, message: 'Order rejected and files updated' }; // important!
  } catch (err) {
    console.error('Reject error:', err);
    throw err;
  } finally {
    sftp.end();
  }
}

async function fetchAndParseInvoiceHistory() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Invoice/Invoice_2010.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}
async function replacePendingOrder(purch_no_c, updatedOrderArray) {
  const sftp = new Client();
  try {
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });

    const remotePath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/SO/pendingOrders.csv';
    const localPath = path.join(__dirname, '..', 'uploads', 'pendingOrders.csv');

    // Download current pending orders
    await sftp.fastGet(remotePath, localPath);
    const rawCSV = fs.readFileSync(localPath, 'utf-8');
    const existingOrders = await parsePendingOrderCSV(rawCSV);

    // Filter out the old version of this order
    const filteredOrders = existingOrders.filter(order => order.purch_no_c !== purch_no_c);

    // Ensure all items in updatedOrderArray include purch_no_c
    const normalized = updatedOrderArray.map(item => ({
      ...item
    }));

    // Combine filtered + updated
    const updatedCSV = [...filteredOrders, ...normalized];

    // Write and upload
    await writeCSV(localPath, updatedCSV);
    await sftp.fastPut(localPath, remotePath);

    console.log(`✅ Successfully replaced order with purch_no_c = ${purch_no_c}`);
  } catch (err) {
    console.error('❌ Error updating pendingOrders.csv:', err);
  } finally {
    sftp.end();
  }
}




async function fetchAndParseDealerTargetCSV() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/targets/SALES Target Vs Achievement.csv');
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

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Price/ORDER STATUS.csv');
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

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Customer/Dealers.csv');
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

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Hierarchy/Dealer & Subdealer list From SAP.csv');
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

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Price/HANA TEMPLET GROUP WISE1.csv');
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
    const remotePath = `/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/SO/${fileName}`;

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
  
 
    const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Customer/Dealers.csv');
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

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/on-account/custopen.csv');
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

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/SO/pendingOrders.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  //return parseCSV(csvText)
 return parsePendingOrderCSV(csvText);
 // return parseBrokenJsonFile(csvText)
}
const { createObjectCsvWriter } = require('csv-writer');
async function writeOrderCSV(filePath, data) {
  if (!data || data.length === 0) {
    fs.writeFileSync(filePath, '');
    return;
  }

  // ✅ Gather all unique keys across all rows to avoid missing columns like "Time"
  const keySet = new Set();
  data.forEach(row => {
    Object.keys(row).forEach(key => keySet.add(key));
  });

  // Convert Set to array
  const allKeys = Array.from(keySet);

  // Force SR NO to appear first (if present)
  const headers = ['SR NO', ...allKeys.filter(k => k !== 'SR NO')].map(key => ({
    id: key,
    title: key,
  }));

  const writer = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await writer.writeRecords(data);
}

async function writeCSV(filePath, data) {
  if (!data || data.length === 0) {
    fs.writeFileSync(filePath, '');
    return;
  }

  const allKeys = Object.keys(data[0]);

  // Force SR NO to appear first
  const headers = ['SR NO', ...allKeys.filter(k => k !== 'SR NO')].map(key => ({
    id: key,
    title: key,
  }));

  const writer = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await writer.writeRecords(data);
}


function parseBrokenJsonFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove line breaks and JS string concat artifacts
    content = content
      .replace(/\\n/g, '')                         // Remove literal \n
      .replace(/\r?\n\s*['|"]?\s*\+\s*/g, '')      // Remove newline + concat
      .replace(/^['"]+|['"]+$/g, '')               // Strip starting/ending quotes
      .replace(/\\"/g, '"')                        // Replace \" with "
      .trim();

    // Optional debug step
    // console.log("CLEANED CONTENT:", content);

    const parsed = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.error("❌ JSON parsing failed:", err.message);
    return null;
  }
}

const { parse } = require('csv-parse/sync');

async function parseCSVstatus(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Optional normalization (handles CRLF vs LF)
    const normalizedContent = content.replace(/\r\n/g, '\n');

    const records = parse(normalizedContent, {
      columns: true,           // Parse as key-value objects
      skip_empty_lines: true,  // Skip empty rows
      trim: true               // Trim whitespace
    });

    return records;
  } catch (err) {
    console.error("❌ Failed to parse CSV:", err);
    return [];
  }
}

async function approveOrderAndUploadFile(doc_number,approvedHistoryFormat) {
  const sftp = new Client();
  try{
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });
console.log('---------approvedHistoryFormat------')
console.log(approvedHistoryFormat)
    function cleanValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' && val.trim().replace(/"/g, '') === '') return '';
  return val;
}
    //original and temp for pending orders
    const pendingordersoriginalpath='/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/SO/pendingOrders.csv'
    const temppendingorder=path.join(__dirname, "..", "uploads", "temppendingorder.csv");

    //original and temp for order status
    const orderstatustempPath = path.join(__dirname, "..", "uploads", "orderstatus.csv");
    const orderstatusoriginalpath='/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Price/ORDER STATUS.csv'

    //original and temp for final order
    const fileName = `orders_2010.csv`;
    const pendingPath = path.join(__dirname,"..", 'uploads', 'Orders.csv');
    const remotePath = `/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/orders/data/${fileName}`;
   
    //download pending orders, order status
    await sftp.fastGet(pendingordersoriginalpath , temppendingorder);
    await sftp.fastGet(remotePath , pendingPath);
    await sftp.fastGet(orderstatusoriginalpath , orderstatustempPath);
const rawCsv = fs.readFileSync(temppendingorder, 'utf-8');
//const pendingOrders = parsePendingOrderCSV(rawCsv);
const pendingOrders = await parsePendingOrderCSV(rawCsv);
     const content = fs.readFileSync(pendingPath, 'utf-8');
const finalOrders = fs.existsSync(pendingPath)
  ? await parsefinalorderCSV(content)
  : [];
    
    const rawOrderStatusCSV = fs.readFileSync(orderstatustempPath, 'utf-8');
//console.log("📂 Raw ORDER STATUS CSV:\n", rawOrderStatusCSV);

const orderstatus = await parseCSVstatus(orderstatustempPath);
//console.log(orderstatus)
   // console.log('------')
    console.log('------****************----------')
    const rawFinalCsv = fs.readFileSync(pendingPath, 'utf-8');
console.log("📂 Raw Final Orders CSV:\n", rawFinalCsv);
     console.log('------****************----------')
 // console.log(pendingOrders)
   // console.log(finalOrders)
   // console.log(orderstatus)
    const pendingRaw = fs.readFileSync(temppendingorder, 'utf-8');
//console.log("📂 Raw Temp Pending Order File Content:\n", pendingRaw);

   // console.log("DOC_NUMBER RECEIVED:", doc_number);
//console.log("PENDING ORDER PURCH_NO_Cs:", pendingOrders.map(p => p.purch_no_c));

      // 3. Filter matching & non-matching orders
    const approvedOrders = pendingOrders.filter(order => order.purch_no_c == doc_number);
    const updatedPending = pendingOrders.filter(order => order.purch_no_c!== doc_number);
console.log('******')
    console.log(approvedOrders)
    console.log(updatedPending)

       // 4. Determine next sr_no
       const existingSrNos = finalOrders.map(o => o['SR NO']).filter(Boolean);
       const maxSrNo = existingSrNos.length > 0 ? Math.max(...existingSrNos) : 0;
       const nextSrNo = maxSrNo + 1;
   
       // 5. Add sr_no to all approved orders
const approvedWithSrNo = approvedOrders.map(order => {
  const cleaned = {};

  // 1. Add SR NO first
  cleaned['SR NO'] = nextSrNo;

  // 2. Add rest of the keys except Cond Type - ZPR0 and Cond Value
  for (let key in order) {
    if (key === 'SR NO') continue; // skip if already set manually
    if (key === 'Cond Type - ZPR0' || key === 'Cond Value') {
      cleaned[key] = ''; // blank out for final order
    } else {
      cleaned[key] = cleanValue(order[key]);
    }
  }

  return cleaned;
});

    finalOrders.push(...approvedWithSrNo);
    if (Array.isArray(approvedHistoryFormat)) {
  orderstatus.push(...approvedHistoryFormat);
} else {
  orderstatus.push(approvedHistoryFormat);
}

const cleanedFinalOrders = finalOrders.map(order => {
  const cleaned = {};
  for (let key in order) {
     if (key === 'Cond Type - ZPR0' || key === 'Cond Value') {
      cleaned[key] = ''; // force blank
    } else {
      cleaned[key] = cleanValue(order[key]);
    }
    cleaned[key] = cleanValue(order[key]);
  }
  return cleaned;
});
    //fs.writeFileSync(temppendingorder, JSON.stringify(updatedPending, null, 2));
    //fs.writeFileSync(pendingPath, JSON.stringify(finalOrders, null, 2));
   // fs.writeFileSync(orderstatustempPath, JSON.stringify(orderstatus, null, 2));
    //const updatedorderHistory=lastorderhistory.filter(order => order.purch_no_c !== doc_number);
await writeCSV(temppendingorder, updatedPending);
await writeCSV(pendingPath, cleanedFinalOrders);
await writeOrderCSV(orderstatustempPath, orderstatus.flat()); // flatten because you're pushing an array inside
 // 7. Upload updated files to server
 await sftp.fastPut(temppendingorder, pendingordersoriginalpath);
 await sftp.fastPut(pendingPath, remotePath);
 await sftp.fastPut(orderstatustempPath, orderstatusoriginalpath);

  }
  catch(err){
    console.error('Approval error:', err);
   
  }
  finally {
    sftp.end();
  }
}
async function uploadVisitsCSV(visit){
  const newfs = require('fs/promises');
  const sftp = new Client();
  try{
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });
 


    const visitsoriginalpath='/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara//Reports/Visits.csv'
    const tempvisits=path.join(__dirname, "..", "uploads", "tempvisits.csv");

    await sftp.fastGet(visitsoriginalpath, tempvisits);

    const existingData = await newfs.readFile(tempvisits, 'utf-8');
  
    const newLine = [
      visit.date,
      visit.SalespersonName,
      visit.dealerName,
      visit.checkInTime,
      visit.dashboardcheckoutTime,
      visit.visitInTime,
      visit.checkOutTime,
      visit.VisitInlocation,
      visit.VisitOutlocation,
      visit.journeyDistance,
      visit.duration,
      
    ].map(value =>  `"${(value ?? '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
         const isFirstLine = existingData.trim().length === 0;
const header = isFirstLine ? `"Date","SalespersonName","Dealer Name","Check-In","Check-Out","VisitInTime","VisitOutTime", "VisitInlocation" ,"VisitOutLocation" ,"journeyDistance","Duration"\n` : '';
const updatedData = header + existingData.trimEnd() + '\n' + newLine;
  
// Step 5: Write back to the temp file
await newfs.writeFile(tempvisits, updatedData,{ encoding: 'utf8' });

// Step 6: Upload the updated file back to SFTP
await sftp.fastPut(tempvisits, visitsoriginalpath);

console.log('✅ Visit appended and file uploaded to SFTP.');
  }catch(err){
    console.error('❌ Error saving visit to SFTP:', err.message);
    throw err;
  }finally {
    await sftp.end();
  }
}


//SHRIRAMPUR PLANT
//shrirampur 

async function saveComplaintToSFTPShrirampur({ ID, Name, date, filePath, fileName }) {
 const sftp = new Client();


  const remotePhotoDir = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/Complaints/Photos';
const csvRemotePath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/Complaints/complaints.csv';
  const localTempCsv = path.join(os.tmpdir(), 'Complaints_temp.csv');
  try {
  await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
   });
    // Upload photo to SFTP
    const remotePhotoPath = `${remotePhotoDir}/${fileName}`;
    await sftp.put(filePath, remotePhotoPath);
    console.log('✅ Photo uploaded:', remotePhotoPath);

    // Ensure CSV exists or create it locally
    await sftp.fastGet(csvRemotePath, localTempCsv).catch(async () => {
      await fs.writeFileSync(localTempCsv, `"DealerID","DealerName","Date","PhotoFileName","PhotoPath"\n`, 'utf8' );
    });

    const newLine = [
      ID,
      Name,
      date,
      fileName,
      remotePhotoPath
    ].map(v => `"${v.replace(/"/g, '""')}"`).join(',') + '\n';

    await fs.appendFileSync(localTempCsv, newLine,  'utf8' );

    // Upload updated CSV
    await sftp.fastPut(localTempCsv, csvRemotePath);
    console.log('✅ Complaint metadata saved');
  } catch (err) {
    console.error('❌ Failed to upload complaint:', err.message);
    throw err;
  } finally {
    await sftp.end();
  }
}



async function RejectOrderAndUploadFileShrirampur(doc_number, approvedHistoryFormat) {
  const sftp = new Client();

  try {
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });

    const pendingordersoriginalpath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/SO/pendingOrders.csv';
    const temppendingorder = path.join(__dirname, "..", "uploads", "temppendingorder.csv");

    const orderstatustempPath = path.join(__dirname, "..", "uploads", "orderstatus.csv");
    const orderstatusoriginalpath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/SO/STATUS/orders_1020.csv';

    // Step 1: Download files
    await sftp.fastGet(pendingordersoriginalpath, temppendingorder);
    await sftp.fastGet(orderstatusoriginalpath, orderstatustempPath);

    // Step 2: Parse files
    const rawCsv = fs.readFileSync(temppendingorder, 'utf-8');
    const pendingOrders = await parsePendingOrderCSV(rawCsv);
    const orderstatus = await parseCSVstatus(orderstatustempPath);

    // Step 3: Remove rejected order from pending list
    const updatedPending = pendingOrders.filter(order => order.purch_no_c !== doc_number);

    // Step 4: Add rejection entry to order status list
    orderstatus.push(approvedHistoryFormat);

    // Step 5: Write back updated data
    await writeCSV(temppendingorder, updatedPending);
    await writeOrderCSV(orderstatustempPath, orderstatus.flat());

    // Step 6: Upload updated files
    await sftp.fastPut(temppendingorder, pendingordersoriginalpath);
    await sftp.fastPut(orderstatustempPath, orderstatusoriginalpath);
    
    return { success: true, message: 'Order rejected and files updated' }; // important!
  } catch (err) {
    console.error('Reject error:', err);
    throw err;
  } finally {
    sftp.end();
  }
}

async function fetchAndParseInvoiceHistoryShrirampur() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Satara/Invoice/Invoice_2010.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}
async function replacePendingOrderShrirampur(purch_no_c, updatedOrderArray) {
  const sftp = new Client();
  try {
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });

    const remotePath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/SO/pendingOrders.csv';
    const localPath = path.join(__dirname, '..', 'uploads', 'pendingOrders.csv');

    // Download current pending orders
    await sftp.fastGet(remotePath, localPath);
    const rawCSV = fs.readFileSync(localPath, 'utf-8');
    const existingOrders = await parsePendingOrderCSV(rawCSV);

    // Filter out the old version of this order
    const filteredOrders = existingOrders.filter(order => order.purch_no_c !== purch_no_c);

    // Ensure all items in updatedOrderArray include purch_no_c
    const normalized = updatedOrderArray.map(item => ({
      ...item
    }));

    // Combine filtered + updated
    const updatedCSV = [...filteredOrders, ...normalized];

    // Write and upload
    await writeCSV(localPath, updatedCSV);
    await sftp.fastPut(localPath, remotePath);

    console.log(`✅ Successfully replaced order with purch_no_c = ${purch_no_c}`);
  } catch (err) {
    console.error('❌ Error updating pendingOrders.csv:', err);
  } finally {
    sftp.end();
  }
}




async function fetchAndParseDealerTargetCSVShrirampur() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/targets/SALES Target Vs Achievement.csv ');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}
async function fetchAndParseOrderHistoryCSVShrirampur() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/SO/STATUS/orders_1020.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}
async function fetchAndParseCSVShrirampur() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/Customer/Dealers.csv');
  console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}


async function fetchAndParseSubDealerCSVShrirampur() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/Hierarchy/Dealer & Subdealer list From SAP.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}
function parseCSVshrirampurproducts(csvString) {
  const delimiter = csvString.includes('\t') ? '\t' : ',';

  return parse(csvString, {
    columns: (headerRow) =>
      headerRow.map(h =>
        h.replace(/\r?\n/g, ' ') // Replace line breaks with space
         .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
         .trim()
      ),
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    delimiter,
  });
}



async function fetchAndParseProductsCSVShrirampur() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/Price/HANA TEMPLET GROUP WISE1.csv');
  console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSVshrirampurproducts(csvText);
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

function formatDate(dateString) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}
async function placeOrderAndUploadFileShrirampur(invoiceData) {
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
    const remotePath = `/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/SO/${fileName}`;

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
          "Doc type": "ZOR",
          "Sales org": "1010",
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
          "plant": "1020",
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


async function verifyDealerShrirampur() {
 const sftp = new Client();
  try{
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });
  
 
    const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/Customer/Dealers.csv');
    //console.log(fileBuffer)
    await sftp.end();
  
    const csvText = fileBuffer.toString('utf-8');
   
   // console.log(csvText)

  

  }catch (err) {
    console.error('SFTP Error:', err);
  }

}
async function fetchOutstandingAndParseCSVShrirampur() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/on-account/custopen.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseOutstandingCSV(csvText);
}
async function fetchAndParsependingOrdersCSVShrirampur() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/SO/pendingOrders.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  //return parseCSV(csvText)
 return parsePendingOrderCSV(csvText);
 // return parseBrokenJsonFile(csvText)
}

async function writeOrderCSV(filePath, data) {
  if (!data || data.length === 0) {
    fs.writeFileSync(filePath, '');
    return;
  }

  // ✅ Gather all unique keys across all rows to avoid missing columns like "Time"
  const keySet = new Set();
  data.forEach(row => {
    Object.keys(row).forEach(key => keySet.add(key));
  });

  // Convert Set to array
  const allKeys = Array.from(keySet);

  // Force SR NO to appear first (if present)
  const headers = ['SR NO', ...allKeys.filter(k => k !== 'SR NO')].map(key => ({
    id: key,
    title: key,
  }));

  const writer = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await writer.writeRecords(data);
}

async function writeCSV(filePath, data) {
  if (!data || data.length === 0) {
    fs.writeFileSync(filePath, '');
    return;
  }

  const allKeys = Object.keys(data[0]);

  // Force SR NO to appear first
  const headers = ['SR NO', ...allKeys.filter(k => k !== 'SR NO')].map(key => ({
    id: key,
    title: key,
  }));

  const writer = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await writer.writeRecords(data);
}


function parseBrokenJsonFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove line breaks and JS string concat artifacts
    content = content
      .replace(/\\n/g, '')                         // Remove literal \n
      .replace(/\r?\n\s*['|"]?\s*\+\s*/g, '')      // Remove newline + concat
      .replace(/^['"]+|['"]+$/g, '')               // Strip starting/ending quotes
      .replace(/\\"/g, '"')                        // Replace \" with "
      .trim();

    // Optional debug step
    // console.log("CLEANED CONTENT:", content);

    const parsed = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.error("❌ JSON parsing failed:", err.message);
    return null;
  }
}



async function parseCSVstatus(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Optional normalization (handles CRLF vs LF)
    const normalizedContent = content.replace(/\r\n/g, '\n');

    const records = parse(normalizedContent, {
      columns: true,           // Parse as key-value objects
      skip_empty_lines: true,  // Skip empty rows
      trim: true               // Trim whitespace
    });

    return records;
  } catch (err) {
    console.error("❌ Failed to parse CSV:", err);
    return [];
  }
}

async function approveOrderAndUploadFileShrirampur(doc_number,approvedHistoryFormat) {
  const sftp = new Client();
  try{
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });
console.log('---------approvedHistoryFormat------')
console.log(approvedHistoryFormat)
    function cleanValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' && val.trim().replace(/"/g, '') === '') return '';
  return val;
}
    //original and temp for pending orders
    const pendingordersoriginalpath='/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/SO/pendingOrders.csv'
    const temppendingorder=path.join(__dirname, "..", "uploads", "temppendingorder.csv");

    //original and temp for order status
    const orderstatustempPath = path.join(__dirname, "..", "uploads", "orderstatus.csv");
    const orderstatusoriginalpath='/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/SO/STATUS/orders_1020.csv'

    //original and temp for final order
    const fileName = `orders_1020.csv`;
    const pendingPath = path.join(__dirname,"..", 'uploads', 'Orders.csv');
    const remotePath = `/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur/Orders/data/${fileName}`;
   
    //download pending orders, order status
    await sftp.fastGet(pendingordersoriginalpath , temppendingorder);
    await sftp.fastGet(remotePath , pendingPath);
    await sftp.fastGet(orderstatusoriginalpath , orderstatustempPath);
const rawCsv = fs.readFileSync(temppendingorder, 'utf-8');
//const pendingOrders = parsePendingOrderCSV(rawCsv);
const pendingOrders = await parsePendingOrderCSV(rawCsv);
     const content = fs.readFileSync(pendingPath, 'utf-8');
const finalOrders = fs.existsSync(pendingPath)
  ? await parsefinalorderCSV(content)
  : [];
    
    const rawOrderStatusCSV = fs.readFileSync(orderstatustempPath, 'utf-8');
//console.log("📂 Raw ORDER STATUS CSV:\n", rawOrderStatusCSV);

const orderstatus = await parseCSVstatus(orderstatustempPath);
//console.log(orderstatus)
   // console.log('------')
    console.log('------****************----------')
    const rawFinalCsv = fs.readFileSync(pendingPath, 'utf-8');
console.log("📂 Raw Final Orders CSV:\n", rawFinalCsv);
     console.log('------****************----------')
 // console.log(pendingOrders)
   // console.log(finalOrders)
   // console.log(orderstatus)
    const pendingRaw = fs.readFileSync(temppendingorder, 'utf-8');
//console.log("📂 Raw Temp Pending Order File Content:\n", pendingRaw);

   // console.log("DOC_NUMBER RECEIVED:", doc_number);
//console.log("PENDING ORDER PURCH_NO_Cs:", pendingOrders.map(p => p.purch_no_c));

      // 3. Filter matching & non-matching orders
    const approvedOrders = pendingOrders.filter(order => order.purch_no_c == doc_number);
    const updatedPending = pendingOrders.filter(order => order.purch_no_c!== doc_number);
console.log('******')
    console.log(approvedOrders)
    console.log(updatedPending)

       // 4. Determine next sr_no
       const existingSrNos = finalOrders.map(o => o['SR NO']).filter(Boolean);
       const maxSrNo = existingSrNos.length > 0 ? Math.max(...existingSrNos) : 0;
       const nextSrNo = maxSrNo + 1;
   
       // 5. Add sr_no to all approved orders
const approvedWithSrNo = approvedOrders.map(order => {
  const cleaned = {};

  // 1. Add SR NO first
  cleaned['SR NO'] = nextSrNo;

  // 2. Add rest of the keys except Cond Type - ZPR0 and Cond Value
  for (let key in order) {
    if (key === 'SR NO') continue; // skip if already set manually
    if (key === 'Cond Type - ZPR0' || key === 'Cond Value') {
      cleaned[key] = ''; // blank out for final order
    } else {
      cleaned[key] = cleanValue(order[key]);
    }
  }

  return cleaned;
});

    finalOrders.push(...approvedWithSrNo);
    if (Array.isArray(approvedHistoryFormat)) {
  orderstatus.push(...approvedHistoryFormat);
} else {
  orderstatus.push(approvedHistoryFormat);
}

const cleanedFinalOrders = finalOrders.map(order => {
  const cleaned = {};
  for (let key in order) {
     if (key === 'Cond Type - ZPR0' || key === 'Cond Value') {
      cleaned[key] = ''; // force blank
    } else {
      cleaned[key] = cleanValue(order[key]);
    }
    cleaned[key] = cleanValue(order[key]);
  }
  return cleaned;
});
    //fs.writeFileSync(temppendingorder, JSON.stringify(updatedPending, null, 2));
    //fs.writeFileSync(pendingPath, JSON.stringify(finalOrders, null, 2));
   // fs.writeFileSync(orderstatustempPath, JSON.stringify(orderstatus, null, 2));
    //const updatedorderHistory=lastorderhistory.filter(order => order.purch_no_c !== doc_number);
await writeCSV(temppendingorder, updatedPending);
await writeCSV(pendingPath, cleanedFinalOrders);
await writeOrderCSV(orderstatustempPath, orderstatus.flat()); // flatten because you're pushing an array inside
 // 7. Upload updated files to server
 await sftp.fastPut(temppendingorder, pendingordersoriginalpath);
 await sftp.fastPut(pendingPath, remotePath);
 await sftp.fastPut(orderstatustempPath, orderstatusoriginalpath);

  }
  catch(err){
    console.error('Approval error:', err);
   
  }
  finally {
    sftp.end();
  }
}
async function uploadVisitsCSVShrirampur(visit){
  const newfs = require('fs/promises');
  const sftp = new Client();
  try{
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });
 


    const visitsoriginalpath='/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Shrirampur//Reports/Visits.csv  '
    const tempvisits=path.join(__dirname, "..", "uploads", "tempvisits.csv");

    await sftp.fastGet(visitsoriginalpath, tempvisits);

    const existingData = await newfs.readFile(tempvisits, 'utf-8');
  
    const newLine = [
      visit.date,
      visit.SalespersonName,
      visit.dealerName,
      visit.checkInTime,
      visit.dashboardcheckoutTime,
      visit.visitInTime,
      visit.checkOutTime,
      visit.VisitInlocation,
      visit.VisitOutlocation,
      visit.journeyDistance,
      visit.duration,
      
    ].map(value =>  `"${(value ?? '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
         const isFirstLine = existingData.trim().length === 0;
const header = isFirstLine ? `"Date","SalespersonName","Dealer Name","Check-In","Check-Out","VisitInTime","VisitOutTime", "VisitInlocation" ,"VisitOutLocation" ,"journeyDistance","Duration"\n` : '';
const updatedData = header + existingData.trimEnd() + '\n' + newLine;
  
// Step 5: Write back to the temp file
await newfs.writeFile(tempvisits, updatedData,{ encoding: 'utf8' });

// Step 6: Upload the updated file back to SFTP
await sftp.fastPut(tempvisits, visitsoriginalpath);

console.log('✅ Visit appended and file uploaded to SFTP.');
  }catch(err){
    console.error('❌ Error saving visit to SFTP:', err.message);
    throw err;
  }finally {
    await sftp.end();
  }
}


//BARAMATI

async function saveComplaintToSFTPBaramati({ ID, Name, date, filePath, fileName }) {
 const sftp = new Client();


  const remotePhotoDir = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/Complaints/Photos';
const csvRemotePath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/Complaints/complaints.csv';
  const localTempCsv = path.join(os.tmpdir(), 'Complaints_temp.csv');
  try {
  await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
   });
    // Upload photo to SFTP
    const remotePhotoPath = `${remotePhotoDir}/${fileName}`;
    await sftp.put(filePath, remotePhotoPath);
    console.log('✅ Photo uploaded:', remotePhotoPath);

    // Ensure CSV exists or create it locally
    await sftp.fastGet(csvRemotePath, localTempCsv).catch(async () => {
      await fs.writeFileSync(localTempCsv, `"DealerID","DealerName","Date","PhotoFileName","PhotoPath"\n`, 'utf8' );
    });

    const newLine = [
      ID,
      Name,
      date,
      fileName,
      remotePhotoPath
    ].map(v => `"${v.replace(/"/g, '""')}"`).join(',') + '\n';

    await fs.appendFileSync(localTempCsv, newLine,  'utf8' );

    // Upload updated CSV
    await sftp.fastPut(localTempCsv, csvRemotePath);
    console.log('✅ Complaint metadata saved');
  } catch (err) {
    console.error('❌ Failed to upload complaint:', err.message);
    throw err;
  } finally {
    await sftp.end();
  }
}



async function RejectOrderAndUploadFileBaramati(doc_number, approvedHistoryFormat) {
  const sftp = new Client();

  try {
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });

    const pendingordersoriginalpath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/SO/pendingOrders.csv';
    const temppendingorder = path.join(__dirname, "..", "uploads", "temppendingorder.csv");

    const orderstatustempPath = path.join(__dirname, "..", "uploads", "orderstatus.csv");
    const orderstatusoriginalpath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/SO/STATUS/orders_1010.csv';

    // Step 1: Download files
    await sftp.fastGet(pendingordersoriginalpath, temppendingorder);
    await sftp.fastGet(orderstatusoriginalpath, orderstatustempPath);

    // Step 2: Parse files
    const rawCsv = fs.readFileSync(temppendingorder, 'utf-8');
    const pendingOrders = await parsePendingOrderCSV(rawCsv);
    const orderstatus = await parseCSVstatus(orderstatustempPath);

    // Step 3: Remove rejected order from pending list
    const updatedPending = pendingOrders.filter(order => order.purch_no_c !== doc_number);

    // Step 4: Add rejection entry to order status list
    orderstatus.push(approvedHistoryFormat);

    // Step 5: Write back updated data
    await writeCSV(temppendingorder, updatedPending);
    await writeOrderCSV(orderstatustempPath, orderstatus.flat());

    // Step 6: Upload updated files
    await sftp.fastPut(temppendingorder, pendingordersoriginalpath);
    await sftp.fastPut(orderstatustempPath, orderstatusoriginalpath);
    
    return { success: true, message: 'Order rejected and files updated' }; // important!
  } catch (err) {
    console.error('Reject error:', err);
    throw err;
  } finally {
    sftp.end();
  }
}

async function fetchAndParseInvoiceHistoryBaramati() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/Invoice/Invoice_1010.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}
async function replacePendingOrderBaramati(purch_no_c, updatedOrderArray) {
  const sftp = new Client();
  try {
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });

    const remotePath = '/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/SO/pendingOrders.csv';
    const localPath = path.join(__dirname, '..', 'uploads', 'pendingOrders.csv');

    // Download current pending orders
    await sftp.fastGet(remotePath, localPath);
    const rawCSV = fs.readFileSync(localPath, 'utf-8');
    const existingOrders = await parsePendingOrderCSV(rawCSV);

    // Filter out the old version of this order
    const filteredOrders = existingOrders.filter(order => order.purch_no_c !== purch_no_c);

    // Ensure all items in updatedOrderArray include purch_no_c
    const normalized = updatedOrderArray.map(item => ({
      ...item
    }));

    // Combine filtered + updated
    const updatedCSV = [...filteredOrders, ...normalized];

    // Write and upload
    await writeCSV(localPath, updatedCSV);
    await sftp.fastPut(localPath, remotePath);

    console.log(`✅ Successfully replaced order with purch_no_c = ${purch_no_c}`);
  } catch (err) {
    console.error('❌ Error updating pendingOrders.csv:', err);
  } finally {
    sftp.end();
  }
}




async function fetchAndParseDealerTargetCSVBaramati() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/targets/SALES Target Vs Achievement.csv ');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}
async function fetchAndParseOrderHistoryCSVBaramati() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/SO/STATUS/orders_1010.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}
async function fetchAndParseCSVBaramati() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/Customer/Dealers_1010.csv');
  console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}


async function fetchAndParseSubDealerCSVBaramati() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/Hierarchy/Dealer & Subdealer list From SAP.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSV(csvText);
}

async function fetchAndParseProductsCSVBaramati() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/Price/HANA TEMPLET GROUP WISE1.csv');
  console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseCSVshrirampurproducts(csvText);
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

function formatDate(dateString) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}
async function placeOrderAndUploadFileBaramati(invoiceData) {
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
    const remotePath = `/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/SO/${fileName}`;

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
          "Doc type": "ZOR",
          "Sales org": "1000",
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
          "plant": "1010",
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


async function verifyDealerBaramati() {
 const sftp = new Client();
  try{
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });
  
 
    const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/Customer/Dealers_1010.csv');
    //console.log(fileBuffer)
    await sftp.end();
  
    const csvText = fileBuffer.toString('utf-8');
   
   // console.log(csvText)

  

  }catch (err) {
    console.error('SFTP Error:', err);
  }

}
async function fetchOutstandingAndParseCSVBaramati() {
 const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/on-account/custopen.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  return parseOutstandingCSV(csvText);
}
async function fetchAndParsependingOrdersCSVBaramati() {
  const sftp = new Client();
  await sftp.connect({
    host: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USER,
    password: process.env.SERVER_PASS,
  });

  const fileBuffer = await sftp.get('/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/SO/pendingOrders.csv');
  //console.log(fileBuffer)
  await sftp.end();

  const csvText = fileBuffer.toString('utf-8');
  //return parseCSV(csvText)
 return parsePendingOrderCSV(csvText);
 // return parseBrokenJsonFile(csvText)
}

async function writeOrderCSV(filePath, data) {
  if (!data || data.length === 0) {
    fs.writeFileSync(filePath, '');
    return;
  }

  // ✅ Gather all unique keys across all rows to avoid missing columns like "Time"
  const keySet = new Set();
  data.forEach(row => {
    Object.keys(row).forEach(key => keySet.add(key));
  });

  // Convert Set to array
  const allKeys = Array.from(keySet);

  // Force SR NO to appear first (if present)
  const headers = ['SR NO', ...allKeys.filter(k => k !== 'SR NO')].map(key => ({
    id: key,
    title: key,
  }));

  const writer = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await writer.writeRecords(data);
}

async function writeCSV(filePath, data) {
  if (!data || data.length === 0) {
    fs.writeFileSync(filePath, '');
    return;
  }

  const allKeys = Object.keys(data[0]);

  // Force SR NO to appear first
  const headers = ['SR NO', ...allKeys.filter(k => k !== 'SR NO')].map(key => ({
    id: key,
    title: key,
  }));

  const writer = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await writer.writeRecords(data);
}


function parseBrokenJsonFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove line breaks and JS string concat artifacts
    content = content
      .replace(/\\n/g, '')                         // Remove literal \n
      .replace(/\r?\n\s*['|"]?\s*\+\s*/g, '')      // Remove newline + concat
      .replace(/^['"]+|['"]+$/g, '')               // Strip starting/ending quotes
      .replace(/\\"/g, '"')                        // Replace \" with "
      .trim();

    // Optional debug step
    // console.log("CLEANED CONTENT:", content);

    const parsed = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.error("❌ JSON parsing failed:", err.message);
    return null;
  }
}



async function parseCSVstatus(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Optional normalization (handles CRLF vs LF)
    const normalizedContent = content.replace(/\r\n/g, '\n');

    const records = parse(normalizedContent, {
      columns: true,           // Parse as key-value objects
      skip_empty_lines: true,  // Skip empty rows
      trim: true               // Trim whitespace
    });

    return records;
  } catch (err) {
    console.error("❌ Failed to parse CSV:", err);
    return [];
  }
}

async function approveOrderAndUploadFileBaramati(doc_number,approvedHistoryFormat) {
  const sftp = new Client();
  try{
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });

    function cleanValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' && val.trim().replace(/"/g, '') === '') return '';
  return val;
}
    //original and temp for pending orders
    const pendingordersoriginalpath='/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/SO/pendingOrders.csv'
    const temppendingorder=path.join(__dirname, "..", "uploads", "temppendingorder.csv");

    //original and temp for order status
    const orderstatustempPath = path.join(__dirname, "..", "uploads", "orderstatus.csv");
    const orderstatusoriginalpath='/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/SO/STATUS/orders_1010.csv'

    //original and temp for final order
    const fileName = `orders_1010.csv`;
    const pendingPath = path.join(__dirname,"..", 'uploads', 'Orders.csv');
    const remotePath = `/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/Orders/data/${fileName}`;
   console.log(remotePath)
    //download pending orders, order status
    await sftp.fastGet(pendingordersoriginalpath , temppendingorder);
    await sftp.fastGet(remotePath , pendingPath);
    await sftp.fastGet(orderstatusoriginalpath , orderstatustempPath);
const rawCsv = fs.readFileSync(temppendingorder, 'utf-8');
//const pendingOrders = parsePendingOrderCSV(rawCsv);
const pendingOrders = await parsePendingOrderCSV(rawCsv);
     const content = fs.readFileSync(pendingPath, 'utf-8');
const finalOrders = fs.existsSync(pendingPath)
  ? await parsefinalorderCSV(content)
  : [];
    
    const rawOrderStatusCSV = fs.readFileSync(orderstatustempPath, 'utf-8');
//console.log("📂 Raw ORDER STATUS CSV:\n", rawOrderStatusCSV);

const orderstatus = await parseCSVstatus(orderstatustempPath);
//console.log(orderstatus)
   // console.log('------')
    //console.log('------****************----------')
    const rawFinalCsv = fs.readFileSync(pendingPath, 'utf-8');
//console.log("📂 Raw Final Orders CSV:\n", rawFinalCsv);
    // console.log('------****************----------')
 // console.log(pendingOrders)
   // console.log(finalOrders)
   // console.log(orderstatus)
    const pendingRaw = fs.readFileSync(temppendingorder, 'utf-8');
//console.log("📂 Raw Temp Pending Order File Content:\n", pendingRaw);

   // console.log("DOC_NUMBER RECEIVED:", doc_number);
//console.log("PENDING ORDER PURCH_NO_Cs:", pendingOrders.map(p => p.purch_no_c));

      // 3. Filter matching & non-matching orders
    const approvedOrders = pendingOrders.filter(order => order.purch_no_c == doc_number);
    const updatedPending = pendingOrders.filter(order => order.purch_no_c!== doc_number);
console.log('******')
    console.log(approvedOrders)
    console.log(updatedPending)

       // 4. Determine next sr_no
       const existingSrNos = finalOrders.map(o => o['SR NO']).filter(Boolean);
       const maxSrNo = existingSrNos.length > 0 ? Math.max(...existingSrNos) : 0;
       const nextSrNo = maxSrNo + 1;
   
       // 5. Add sr_no to all approved orders
const approvedWithSrNo = approvedOrders.map(order => {
  const cleaned = {};

  // 1. Add SR NO first
  cleaned['SR NO'] = nextSrNo;

  // 2. Add rest of the keys except Cond Type - ZPR0 and Cond Value
  for (let key in order) {
    if (key === 'SR NO') continue; // skip if already set manually
    if (key === 'Cond Type - ZPR0' || key === 'Cond Value') {
      cleaned[key] = ''; // blank out for final order
    } else {
      cleaned[key] = cleanValue(order[key]);
    }
  }

  return cleaned;
});

    finalOrders.push(...approvedWithSrNo);
    if (Array.isArray(approvedHistoryFormat)) {
  orderstatus.push(...approvedHistoryFormat);
} else {
  orderstatus.push(approvedHistoryFormat);
}

const cleanedFinalOrders = finalOrders.map(order => {
  const cleaned = {};
  for (let key in order) {
     if (key === 'Cond Type - ZPR0' || key === 'Cond Value') {
      cleaned[key] = ''; // force blank
    } else {
      cleaned[key] = cleanValue(order[key]);
    }
    cleaned[key] = cleanValue(order[key]);
  }
  return cleaned;
});
    //fs.writeFileSync(temppendingorder, JSON.stringify(updatedPending, null, 2));
    //fs.writeFileSync(pendingPath, JSON.stringify(finalOrders, null, 2));
   // fs.writeFileSync(orderstatustempPath, JSON.stringify(orderstatus, null, 2));
    //const updatedorderHistory=lastorderhistory.filter(order => order.purch_no_c !== doc_number);
await writeCSV(temppendingorder, updatedPending);
await writeCSV(pendingPath, cleanedFinalOrders);
await writeOrderCSV(orderstatustempPath, orderstatus.flat()); // flatten because you're pushing an array inside
 // 7. Upload updated files to server
 await sftp.fastPut(temppendingorder, pendingordersoriginalpath);
 await sftp.fastPut(pendingPath, remotePath);
 await sftp.fastPut(orderstatustempPath, orderstatusoriginalpath);

  }
  catch(err){
    console.error('Approval error:', err);
   
  }
  finally {
    sftp.end();
  }
}
async function uploadVisitsCSVBaramati(visit){
  const newfs = require('fs/promises');
  const sftp = new Client();
  try{
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });
 


    const visitsoriginalpath='/DIR_SALESTRENDZ/DIR_SALESTRENDZ_Baramati/Reports/Visits.csv'
    const tempvisits=path.join(__dirname, "..", "uploads", "tempvisits.csv");

    await sftp.fastGet(visitsoriginalpath, tempvisits);

    const existingData = await newfs.readFile(tempvisits, 'utf-8');
  
    const newLine = [
      visit.date,
      visit.SalespersonName,
      visit.dealerName,
      visit.checkInTime,
      visit.dashboardcheckoutTime,
      visit.visitInTime,
      visit.checkOutTime,
      visit.VisitInlocation,
      visit.VisitOutlocation,
      visit.journeyDistance,
      visit.duration,
      
    ].map(value =>  `"${(value ?? '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
         const isFirstLine = existingData.trim().length === 0;
const header = isFirstLine ? `"Date","SalespersonName","Dealer Name","Check-In","Check-Out","VisitInTime","VisitOutTime", "VisitInlocation" ,"VisitOutLocation" ,"journeyDistance","Duration"\n` : '';
const updatedData = header + existingData.trimEnd() + '\n' + newLine;
  
// Step 5: Write back to the temp file
await newfs.writeFile(tempvisits, updatedData,{ encoding: 'utf8' });

// Step 6: Upload the updated file back to SFTP
await sftp.fastPut(tempvisits, visitsoriginalpath);

console.log('✅ Visit appended and file uploaded to SFTP.');
  }catch(err){
    console.error('❌ Error saving visit to SFTP:', err.message);
    throw err;
  }finally {
    await sftp.end();
  }
}



module.exports = {addFollowupCSV,fetchLeadsCSV,uploadLeadCSV,RejectOrderAndUploadFileShrirampur,saveComplaintToSFTPShrirampur , fetchAndParseDealerTargetCSVShrirampur , fetchAndParseOrderHistoryCSVShrirampur , fetchAndParseCSVShrirampur , fetchAndParseSubDealerCSVShrirampur , fetchAndParseProductsCSVShrirampur , placeOrderAndUploadFileShrirampur,verifyDealerShrirampur,fetchAndParsependingOrdersCSVShrirampur,
approveOrderAndUploadFileShrirampur , uploadVisitsCSVShrirampur,fetchOutstandingAndParseCSVShrirampur,RejectOrderAndUploadFileBaramati,fetchAndParseInvoiceHistoryBaramati,replacePendingOrderBaramati,fetchAndParseDealerTargetCSVBaramati,fetchAndParseOrderHistoryCSVBaramati,fetchAndParseCSVBaramati,fetchAndParseSubDealerCSVBaramati,fetchAndParseProductsCSVBaramati,placeOrderAndUploadFileBaramati,verifyDealerBaramati,fetchOutstandingAndParseCSVBaramati,fetchAndParsependingOrdersCSVBaramati , approveOrderAndUploadFileBaramati,uploadVisitsCSVBaramati,saveComplaintToSFTPBaramati,uploadVisitsCSVBaramati, approveOrderAndUploadFileBaramati ,fetchAndParsependingOrdersCSVBaramati,fetchAndParseDealerTargetCSVBaramati,
fetchOutstandingAndParseCSVBaramati , verifyDealerBaramati , placeOrderAndUploadFileBaramati, fetchAndParseProductsCSVBaramati , fetchAndParseSubDealerCSVBaramati,fetchAndParseCSVBaramati,fetchAndParseOrderHistoryCSVBaramati , replacePendingOrderBaramati , fetchAndParseInvoiceHistoryBaramati, RejectOrderAndUploadFileBaramati, saveComplaintToSFTPBaramati,saveComplaintToSFTP,RejectOrderAndUploadFile,fetchAndParseInvoiceHistory,replacePendingOrder,uploadVisitsCSV,approveOrderAndUploadFile , fetchAndParsependingOrdersCSV,fetchAndParseDealerTargetCSV, fetchAndParseOrderHistoryCSV,fetchAndParseSubDealerCSV,fetchOutstandingAndParseCSV,fetchAndParseCSV,fetchAndParseProductsCSV ,placeOrderAndUploadFile,verifyDealer};
