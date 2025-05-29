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
    //console.log( obj)
    
    
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
    //console.log( obj)
    
    
    return obj;
   
  });

  return data;
  
}
function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function parsePendingOrderCSV(csvString) {
const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]);

  const data = lines.slice(1).map(line => {
    const values = splitCSVLine(line);
    const obj = {};

    headers.forEach((key, index) => {
      let value = values[index]?.trim() || '';

      // Try to parse value if it's a stringified JSON object or array
      if (
        (value.startsWith('"{"') && value.endsWith('"}')) || // Object
        (value.startsWith('"[') && value.endsWith(']"'))     // Array
      ) {
        try {
          // Strip outer quotes
          value = value.slice(1, -1);
          // Unescape quotes
          value = value.replace(/\\"/g, '"');
          // Convert to object/array
          value = JSON.parse(value);
        } catch (e) {
          console.warn(`Could not parse JSON in field "${key}":`, value);
        }
      }

      obj[key] = value;
    });

    return obj;
  });

  return data;
}
module.exports = {parseCSV,parseOutstandingCSV,parsePendingOrderCSV};
