var fs = require('fs');
var csv = require('csv-parser');
var JSONStream = require('JSONStream');
var through = require('through');

var parse_csv = function(input, output) {
    fs
        .createReadStream(input)
        .pipe(csv({
            headers: ["region",
                      "region_id",
                      "sector",
                      "activity_type",
                      "org",
                      "x_activity",
                      "from_date",
                      "to_date"]
        }))
        .pipe(JSONStream.stringify())
        .pipe(fs.createWriteStream(output));
};

parse_csv('data_jan/4W_30_janvier.csv', 'data.json');
