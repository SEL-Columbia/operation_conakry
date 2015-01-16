var fs = require('fs');
var csv = require('csv-streamify');
var through = require('through');
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
                self.header = resolve_header(parser.read(), pathname);
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

var resolve_header = function(header, pathname) {
    return header.reduce(function(pre, cur, ind, arr) {
        var pre_copy = pre,
            item = {'category': pathname},
            subcat_reg = cur.match(/^\[(s|S)\](.+)$/),
            action_reg = cur.match(/^\[(a|A)\](.+)$/),
            date_reg = cur.match(/Date Limite/i);
        if (cur === '') {
            pre_copy.push(cur);
            return pre_copy;
        }
        if (subcat_reg) {
            item.subcat = subcat_reg[2];
            pre_copy.push(item);
            return pre_copy;
        }
        if (action_reg) {
            var last_item = pre_copy[pre_copy.length - 1];
            item.action = action_reg[2];
            item.subcat = last_item.subcat || null;
            pre_copy.push(item);
            return pre_copy;
        }
        if (date_reg) {
            pre_copy.push('date');
            return pre_copy;
        }
    }, []);
};

var gen_line_obj = function(line, headers, category) {
    var region = clean_region(line[0]);
    var cat = clean_category(category);
    var print_list = line.reduce(function(pre, cur, ind, arr) {
        if (cur === '' || cur === '?') {
            return pre;
        }
        var pre_copy = pre;
        var cur_item = headers[ind];
        if (cur_item === '') return pre;
        if (cur_item !== 'date') {
            cur_item.region = region;
            cur_item.category = cat;
            cur_item.value = cur;
            pre_copy.push(cur_item);
            return pre_copy;
        } else {
            var pre_item = pre_copy.pop();
            if (!pre_item){ 
                throw new Error('no element associates with this date' + cur);
            }
            pre_item.date =  cur;
            pre_copy.push(pre_item);
            return pre_copy;
        }
    },[]);
    print_list.map(function(item) {
        ws.write(JSON.stringify(item));
        ws.write(',');
    });
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

