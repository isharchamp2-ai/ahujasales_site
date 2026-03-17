const xlsx = require('xlsx');
const fs = require('fs');
const wb = xlsx.readFile('AhujaSales-V1.1 website details.xls');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(ws);
console.log(JSON.stringify(data.slice(0, 10), null, 2)); // Show sample to understand format
fs.writeFileSync('parsed_data.json', JSON.stringify(data, null, 2));
