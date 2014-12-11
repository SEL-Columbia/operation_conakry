var excel = require('node-xlsx');
var fs = require('fs');

var res = excel.parse('./3W_28Nov14.xlsx');
fs.writeFile('output.json', JSON.stringify(res, null, 4));


