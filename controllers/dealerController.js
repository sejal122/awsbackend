// async function readCSVFileAsJSON() {
//     try {
//       await sftp.connect(config);
//       const remoteFilePath = '/DIR_MAGICAL/DIR_MAGICAL_Baramati/Customer/Customer_1010.csv';
//       const fileBuffer = await sftp.get(remoteFilePath);
//       const csvString = fileBuffer.toString('utf8');
  
//       const lines = csvString.trim().split('\n');
//       const headers = lines[0].split(',').map(h => h.trim());
      
//       const jsonData = lines.slice(1).map(line => {
//         const values = line.split(',').map(v => v.trim());
//         const obj = {};
//         headers.forEach((header, idx) => {
//           obj[header] = values[idx] || '';
//         });
//         return obj;
//       });
  
//       console.log('✅ Manually parsed JSON:', jsonData);
//       await sftp.end();
//       return jsonData;
  
//     } catch (err) {
//       console.error('❌ Error:', err.message);
//     }
// }
// module.exports = readCSVFileAsJSON;
const { fetchAndParseCSV } = require('../services/sftpService');
const cacheManager = require('cache-manager');
let cache;
(async () => {
  cache = await cacheManager.caching({
    store: "memory",
    ttl: 900, // 15 minutes in seconds
  });
})();

const getDealers = async (req, res) => {
  let dealers = await cache.get('dealers');
  if (dealers) {
    // If data is cached, send it
    console.log('Returning cached dealers data');
    return res.json(dealers);
  }else{
    try {
      const data = await fetchAndParseCSV();
      
      await cache.set('dealers', res.json(data));
      res.json(data);
      console.log(data)
    } catch (err) {
      console.error('Error fetching dealers:', err.message);
      res.status(500).json({ error: 'Failed to fetch dealer data' });
    }
  }
 
};

module.exports = { getDealers };
