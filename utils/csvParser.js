// function parseCSV(csvString) {
//   const lines = csvString.trim().split('\n');

//   if (lines.length < 2) {
//     return []; // no data
//   }

//   // Extract and clean headers
//   const headers = lines[0].split(',').map(header => header.trim());

//   // Map each line to an object
//   const data = lines.slice(1).map(line => {
//     const values = line.split(',').map(val => val.trim());
//     const obj = {};

//     headers.forEach((header, index) => {
//       obj[header] = values[index] || '';
//     });
     
//     return obj;
//   });

//   return data;
//   }
  
//   module.exports = { parseCSV };
function parseCSV(csvString) {
  const lines = csvString.trim().split('\n');

  if (lines.length < 2) return [];

  // Clean header line
  // const headers = lines[0].split(',').map(header =>
  //   header.trim()
  // );
  const headers = lines[0].split(',').map(header =>
    header.trim()
  );
  // const data = lines.slice(1).map(line => {
  //   const values = line.split(',').map(val =>
  //     val.trim()
  //   );
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(val =>
        val.trim()
      );

    const obj = {};
    headers.forEach((key, index) => {
      obj[key] = values[index] || '';
    });
    console.log( obj)
    
    
    return obj;
   
  });

  return data;
  
}


function parseOutstandingCSV(csvString) {
  const lines = csvString.trim().split('\n');

  if (lines.length < 2) return [];

  // Clean header line
  // const headers = lines[0].split(',').map(header =>
  //   header.trim()
  // );
  const headers = lines[0].split(',').map(header =>
    header.trim()
  );
  // const data = lines.slice(1).map(line => {
  //   const values = line.split(',').map(val =>
  //     val.trim()
  //   );
    const data = lines.slice(1).map(line => {
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(val =>
      val.trim().replace(/^"+|"+$/g, '')
    ) || [];

    const obj = {};
    headers.forEach((key, index) => {
      obj[key] = values[index] || '';
    });
    console.log( obj)
    
    
    return obj;
   
  });

  return data;
  
}
module.exports = {parseCSV,parseOutstandingCSV};
