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
 
    
  
        const json2csvParser = new Parser();
      const csv = json2csvParser.parse(orderJson);
      const fileName = `pendingOrders.csv`;
      const tempPath = path.join(__dirname, '..', 'uploads', fileName);
      //const tempPath = path.join(__dirname, fileName);
      const targetFolder = '/DIR_MAGICAL/DIR_MAGICAL_Satara/SO'; // Change this if needed
      const finalPath = path.join(targetFolder, fileName);
  
    fs.writeFileSync(tempPath, csv, (err) => {
      if (err) {
        console.error('Error writing temp CSV file:', err);
        return;
      }
    
      console.log(`CSV file created at: ${tempPath}`);
  
    });
  await sftp.put(tempPath, finalPath);
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
