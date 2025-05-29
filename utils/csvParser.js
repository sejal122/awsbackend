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
    if (char === '"') {
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

// Try parsing rawValue or fix malformed JSON-like structure
function tryFixMalformedJSON(rawValue) {
  try {
    return JSON.parse(rawValue);
  } catch {
    // Attempt to fix keys & string values (add quotes)
    const fixed = rawValue
      .replace(/([{,])\s*([^":\[\]{},\s]+)\s*:/g, '$1"$2":') // fix keys
      .replace(/:\s*([^"\[{][^,\]}]*)/g, (match, val) => {
        // Add quotes only if the value is not number/boolean/null
        const trimmed = val.trim();
        if (
          /^-?\d+(\.\d+)?$/.test(trimmed) || // number
          /^(true|false|null)$/.test(trimmed) // boolean/null
        ) {
          return `:${trimmed}`;
        } else {
          return `:"${trimmed}"`;
        }
      });

    try {
      return JSON.parse(fixed);
    } catch (err) {
      // Still invalid, return original string
      return rawValue;
    }
  }
}


function parsePendingOrderCSV(csvString) {
    const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]);

  const data = lines.slice(1).map(line => {
    const values = splitCSVLine(line);
    const obj = {};

    headers.forEach((key, index) => {
      let rawValue = values[index] || '';

      // Remove outer quotes if present
      if (
        rawValue.startsWith('"') &&
        rawValue.endsWith('"')
      ) {
        rawValue = rawValue.slice(1, -1);
      }

      // Fix and parse malformed JSON
      const fixedJSON = tryFixMalformedJSON(rawValue);
      obj[key] = fixedJSON;
    });

    return obj;
  });

  return data;
}
module.exports = {parseCSV,parseOutstandingCSV,parsePendingOrderCSV};
