// // const Client = require('ssh2-sftp-client');
// // const sftp = new Client();

// // const config = {
// //   host: '10.60.1.126',
// //   port: 22,
// //   username: 'root',
// //   password: '&7Yta#$1', 
// // };

// // async function listFiles() {
// //   try {
// //     await sftp.connect(config);
    
// //     // List files in remote directory
// //     const fileList = await sftp.list('/DIR_MAGICAL/DIR_MAGICAL_Baramati/Customer'); // Change to your folder path
// //     console.log('Files:', fileList);
// //     const content = fileList.toString('utf8');
// //     console.log('File content:\n', content);

// //     // Example: Download a file
// //     //const product= await sftp.get('/root/Documents', './docs');

// //     // // Example: Upload a file
// //     // await sftp.put('./upload.txt', '/root/uploaded.txt');

// //     await sftp.end();
// //   } catch (err) {
// //     console.error('SFTP Error:', err);
// //   }
// // }

// // listFiles();
// const express = require('express');
// const app = express();
// const port = 3001; // You can change this
// const cors = require('cors');
// app.use(cors());
// const routes = require('./routes/routes');
// app.use('/api', routes); 

// require('dotenv').config();

// // app.get('/api/customer-data', async (req, res) => {
// //   const data = await readCSVFileAsJSON(); // Your function
// //   res.json(data); // Sends parsed JSON to frontend
// // });

// app.listen(port, () => {
//   console.log(`✅ Server is running at http://localhost:${port}`);
// });

// const Client = require('ssh2-sftp-client');
// const csv = require('csvtojson');

// const sftp = new Client();

// const config = {
//   host: process.env.SERVER_IP,
//   port: process.env.PORT,
//   username: process.env.SERVER_USER,
//   password: process.env.SERVER_PASS,
// };
// // async function readCSVFileAsJSON() {
// //   try {
// //     await sftp.connect(config);
// //     const remoteFilePath = '/DIR_MAGICAL/DIR_MAGICAL_Baramati/Customer/Customer_1010.csv';
// //     const fileBuffer = await sftp.get(remoteFilePath);
// //     const csvString = fileBuffer.toString('utf8');

// //     const lines = csvString.trim().split('\n');
// //     const headers = lines[0].split(',').map(h => h.trim());
    
// //     const jsonData = lines.slice(1).map(line => {
// //       const values = line.split(',').map(v => v.trim());
// //       const obj = {};
// //       headers.forEach((header, idx) => {
// //         obj[header] = values[idx] || '';
// //       });
// //       return obj;
// //     });

// //     console.log('✅ Manually parsed JSON:', jsonData);
// //     await sftp.end();
// //     return jsonData;

// //   } catch (err) {
// //     console.error('❌ Error:', err.message);
// //   }
// //}


require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./routes/routes');
const cors=require('cors')
const bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use('/api', routes);

app.listen(process.env.PORT, () => console.log(`Server running on port 3001`));


