// Initialize multi select
$('.filter__select')
    .select2({
        multiple: true,
        query: function(query) {
            // Gather results
            var data = getFilteredData();
            var results = [];
            var key = this.element.data('key');
            _.each(data, function(item) {
                var value = item[key];
                if (value) results.push(value);
            });
            results = _.map(_.uniq(results), function(value) {
                return {id: value, text: value};
            });
            query.callback({results: results});
        }
    })
    .on('change', renderTable);


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


function getFilteredData() {
    var filters = getFilters();
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
    var headers = _.filter(
        ['region', 'category', 'category2', 'category3', 'value'],
        function(header) {
            // Don't display headers which have been filtered
            var values = filters[header];
            return !(values && values.length);
        });
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
    html += '</table>'
    
    // Add to DOM
    $('.table table').remove();
    $('.table').append(html);
}





    
