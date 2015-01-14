var fs = require('fs');
var csv = require('csv-streamify');
var through = require('through');
var JSONStream = require('JSONStream');
var path = require('path');

global.ws = fs.createWriteStream('out.js');

var get_relevant_files = function(pathname, cb) {
    fs.readdir(pathname, function (err, files) {
        var filtered = files.filter(function(i) {
            return i.match(/\.csv$/);
        });
        cb(filtered);
    });
};

var parse_csv = function(pathname) {
    var parser = csv({objectMode: true});
//    parser.category = pathname;
    var self = this;
    parser
        .on('readable', function() {
            if (this.lineNo === 0) { //title line
                self.header = resolve_header(parser.read());
            }
        });
    fs
        .createReadStream(pathname)
        .pipe(parser)
        .pipe(through(function write(data) {
            if (data !== self.header) {
                gen_line_obj(data, self.header, pathname);
            }
        }, function end() {
            this.queue(null);
        }));
};

var resolve_header = function(header) {
    console.log('here');
    return header.reduce(function(pre, cur, ind, arr) {
        var pre_copy = pre;
        var item = {};
        var subcat_reg = cur.match(/^\[(s|S)\](.+)$/);
        var action_reg = cur.match(/^\[(a|A)\](.+)$/);
        var date_reg = cur.match(/Date Limite/i);
        if (cur === '') {
            pre_copy.push(cur);
            return pre_copy;
        }
        if (subcat_reg) {
            item.subcat = cur;
            pre_copy.push(item);
            return pre_copy;
        }
        if (action_reg) {
            var last_item = pre_copy[pre_copy.length - 1];
            item.action = cur;
            item.subcat = last_item.subcat;
            pre_copy.push(item);
            return pre_copy;
        }
        if (date_reg) {
            var last_item = pre_copy[pre_copy.length - 1];
            item.date = cur;
        }
        console.log(pre);
    }, []);
};

var gen_line_obj = function(line, headers, category) {
    var region = clean_region(line[0]);
    var obj_lst = [];
};

var clean_region = function(name) {
    var fr_dict = {"á":"a", "ç":"c", "é":"e", "è":"e"};
    return name.replace(/\s$/, '', 'g')
               .replace(/\*$/, '', 'g')
               .replace(/[^\w ]/g, function(char) {
                     return fr_dict[char] || char;
               });
};

// run 
var clean_category = function(category) {
    return category.split("/")[1].split(".")[0];
};

get_relevant_files('data', function(list) {
    ws.write('var data=[');
    list.forEach(function(file) {
        var pathname = path.join('data', file);
        parse_csv(pathname);
    });

});

//parse_csv(path.join('data', 'communication.csv'))

