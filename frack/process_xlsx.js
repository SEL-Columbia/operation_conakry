var xlsx = require('xlsx');
var fs = require('fs');

var sluggify = function(name) {
    return name
                .toLowerCase()
                .replace(/[^-a-zA-Z0-9\s+]+/ig, '')
 	            .replace(/\s+/gi, "_");
};

var defrench = function(name) {
    var fr_dict = {"á":"a", "ç":"c", "é":"e", "è":"e"};
    return name.replace(/[^\w ]/g, function(char) {
                     return fr_dict[char] || char;
               });
};

fs.readFile('data/operation_conakry.xlsx', function(err, dat) {
    var data = xlsx.read(dat);
    var sheet_list = data.SheetNames;
    sheet_list.forEach(function(sheet_name) {
        var write_data = xlsx.utils.sheet_to_csv(data.Sheets[sheet_name]);
        fs.writeFile('data/' + sluggify(defrench(sheet_name)) + '.csv', write_data, 'utf-8');
    });
});

