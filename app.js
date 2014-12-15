// Initialize multi select
$('.filter__select')
    .select2({
        multiple: true,
        query: function(query) {
            // Gather results
            var key = this.element.data('key');
            var data = getFilteredData(key);
            var matches = [];
            var others = [];
            _.each(data, function(item) {
                var value = item[key] || '';
                if (value) {
                    if (value.toLowerCase().indexOf(query.term) >= 0) {
                        matches.push(value);
                    } else {
                        others.push(value);
                    }
                }
            });
            matches.sort();
            others.sort();
            var results = matches.concat(others);
            results = _.map(_.uniq(results), function(value) {
                    return {id: value, text: value};
                });
            query.callback({results: results});
        }
    })
    .on('change', function() {
        renderTable();
        renderMap();
    });


function getFilters() {
    var filters = {};
    $('input.filter__select')
        .each(function() {
            var key = $(this).data('key');
            if (key) {
                filters[key] = $(this).select2('val');
            }
        });
    return filters;    
}


function getFilteredData(skip) {
    var filters = getFilters();
    if (skip) delete filters[skip];
    return _.filter(data, function(item) {
        // Check to see that item contains filtered value
        for (var key in filters) {
            var values = filters[key];
            if (values.length && !_.contains(values, item[key]))
                return false;
        }
        return true;
    });
}


function renderTable() {
    var data = getFilteredData();
    var filters = getFilters();
    var headers = ['region', 'category', 'category2', 'category3', 'value'];
    var html = '<table>';
    
    // Add headers
    html += '<thead>';
    _.each(headers, function(header) {
        html += '<th>' + header + '</th>';
    });
    html += '</thead>';
    
    // Add rows
    html += '<tbody>';
    _.each(data, function(item) {
        html += '<tr>';
        _.each(headers, function(header) {
            html += '<td>' + item[header] + '</td>';
        });
        html += '</tr>';
    });
    html += '</tbody>';
    html += '</table>';
    
    // Add to DOM
    $('.table table').remove();
    $('.table').append(html);
}

function renderMap() {
    var regions = getFilters().region;
    console.log(regions);
}

