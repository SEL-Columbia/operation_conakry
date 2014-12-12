var fs = require('fs');
var csv = require('csv-streamify');
var through = require('through');
var JSONStream = require('JSONStream');
var path = require('path');

var get_relevant_files = function(pathname, cb) {
    fs.readdir(pathname, function (err, files) {
        var filtered = files.filter(function(i) {
            return i.match(/\.csv$/);
        });
        cb(filtered);
    });
};

global.ws = fs.createWriteStream('out.js');

var parse_csv = function(pathname) {
    var parser = csv({objectMode: true});
//    parser.category = pathname;
    var self = this;
    parser
        .on('readable', function() {
            if (this.lineNo === 0) {
                self.header = clean_column(parser.read());
            }
        });
    fs
        .createReadStream(pathname)
        .pipe(parser)
        .pipe(through(function write(data) {
            if (data !== self.header) {
                gen_line_obj(this, data, self.header, pathname);
            }
        }, function end() {
            this.queue(null);
        }))
        .pipe(JSONStream.stringify())
        .pipe(ws);

};

var gen_line_obj = function(th, line, header, cat) {
    var action = line[0];
    var noCat3 = header[1] === "National";

    objs = [];
    header.forEach(function(region, idx) {
        if (!region) 
            return;

        obj = {   
            region: region,
            category: clean_category(cat),
            category2: action,
            value: line[idx]
        };
    
        if (!noCat3) {
             obj.category3 = line[1];
        }

        if (obj.value && obj.value !== '?') {
            th.queue(obj);
        }

    });


};

var clean_column = function(column) {
    var fr_dict = {"á":"a", "ç":"c", "é":"e", "è":"e"};
    return column.map(function(name) {
        return name.replace(/\s$/, '', 'g')
                   .replace(/\*$/, '', 'g')
                   .replace(/[^\w ]/g, function(char) {
                         return fr_dict[char] || char;
                   });

    });
};

// run 
var clean_category = function(category) {
    return category.split("/")[1].split(".")[0];
};

get_relevant_files('data', function(list) {
    list.forEach(function(file) {
        var pathname = path.join('data', file);
        parse_csv(pathname);
    });

});

//parse_csv(path.join('data', 'communication.csv'))

