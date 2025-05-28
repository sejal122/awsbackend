const Client = require('ssh2-sftp-client');
const { parseCSV,parseOutstandingCSV } = require('../utils/csvParser');
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
async function placeOrderAndUploadFile(orderJson) {
 const sftp = new Client();
  try{
    await sftp.connect({
      host: process.env.SERVER_IP,
      port: process.env.SERVER_PORT,
      username: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
    });
   console.log(orderJson)
 
 
  
       // const json2csvParser = new Parser();
    //  const csv = json2csvParser.parse(orderJson);
      const fileName = `pendingOrders.csv`;
      const tempPath = path.join(__dirname, '..', 'uploads', fileName);
      //const tempPath = path.join(__dirname, fileName);
      const targetFolder = '/DIR_MAGICAL/DIR_MAGICAL_Satara/SO'; // Change this if needed
      const finalPath = path.join(targetFolder, fileName);
      const remotePath = `/DIR_MAGICAL/DIR_MAGICAL_Satara/SO/${fileName}`;

      let existingCsv = '';

    // 1. Try downloading the existing file (if it exists)
    try {
      existingBuffer = await sftp.get(finalPath)
      existingCsv=existingBuffer.toString()
      console.log('existingcsv')
      console.log(existingCsv)
    } catch (err) {
      if (err.code !== 2) {
        console.error('Error reading existing file:', err);
        throw err;
      } else {
        console.log('No existing file found. Creating new one.');
      }
    }
    
// 2. Convert new data to CSV
   const combinedOrders = [];
 try {
      const tempDownload = path.join(__dirname, '..', 'uploads', 'existing_' + fileName);
      await sftp.fastGet(finalPath, tempDownload);

      const fileContent = fs.readFileSync(tempDownload, 'utf-8').trim();
      const lines = fileContent.split('\n');
      const header = lines[0];
      const rows = lines.slice(1);

      for (let row of rows) {
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // split respecting quotes

        combinedOrders.push({
          orderItems: cleanAndParse(cols[0]),
          dealer: cleanAndParse(cols[1]),
          orderId: cols[2]?.replace(/^"|"$/g, ''),
          orderDate: cols[3]?.replace(/^"|"$/g, ''),
        });
      }
    } catch (err) {
      console.log('No existing file or error reading existing orders. Will create new file.');
    }

    // 3. Combine old and new CSV data
    combinedOrders.push(newOrder); // make sure orderJson is same structure
    
    // Step 4: Convert combined JSON to CSV
    const json2csvParser = new Parser({
      fields: ['orderItems', 'dealer', 'orderId', 'orderDate'],
      quote: '"',
    });
    
    const csv = json2csvParser.parse(
      combinedOrders.map(order => ({
        orderItems: JSON.stringify(order.orderItems),
        dealer: JSON.stringify(order.dealer),
        orderId: order.orderId,
        orderDate: order.orderDate,
      }))
    );


    
    fs.writeFileSync(tempPath, csv, (err) => {
      if (err) {
        console.error('Error writing temp CSV file:', err);
        return;
      }
    
      console.log(`CSV file created at: ${tempPath}`);
  
    });
  await sftp.put(tempPath, remotePath);
  await sftp.end();
  }catch (err) {
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
module.exports = {fetchAndParseDealerTargetCSV, fetchAndParseOrderHistoryCSV,fetchAndParseSubDealerCSV,fetchOutstandingAndParseCSV,fetchAndParseCSV,fetchAndParseProductsCSV ,placeOrderAndUploadFile,verifyDealer};
