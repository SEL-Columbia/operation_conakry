var fs = require('fs');
var csv = require('csv-streamify');
var through = require('through');
var path = require('path');

var get_relevant_files = function(pathname, cb) {
    fs.readdir(pathname, function (err, files) {
        var filtered = files.filter(function(i) {
            return i.match(/\.csv$/);
        });
        cb(filtered);
    });
};

var parse_csv = function(pathname) {
    var dummy = {};
    var existsSubaction = false;
    var parser = csv({objectMode: true});
    parser
        .on('readable', function() {
            if (this.lineNo === 0) {
                parser.header = clean_column(parser.read());
                parser.header.forEach(function(region, idx) {
                    if (region === "" || region === "National") {
                        console.log(idx, region);
                        return;
                    }

                });
            } else {
                var line = parser.read();
                objs.map(function(obj, idx) {
                });

            }

        });
    fs
        .createReadStream(pathname)
        .pipe(parser)

};

var clean_column = function(column) {
    return column;
};

// run 
get_relevant_files('data', function(list) {
    list.forEach(function(file) {
        var pathname = path.join('data', file);
        parse_csv(pathname);
    });
});

