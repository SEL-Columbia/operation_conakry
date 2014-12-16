L.Icon.Default.imagePath = 'leaflet/images/';
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

function initMap() {
    var regions = getFilters().region;
    var map_div = 'map';
    var map = new L.Map(map_div);
    var osm_server = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    var osm_layer = L.tileLayer(osm_server, {
        attribution: "Open Street Map"
    });
    var style = function(feature) {
        return {
            fillColor: '#FEB24C',
            weight: 2,
            opacity: 1,
            color: 'grey',
            dashArray: '3',
            fillOpacity: 0.3
        };
    };
    var click_ev = function(ev) {
        var name = ev.target.feature.properties.ADM2_NAME;
        console.log(name);
    };
    var hightligt = function(ev) {
        var layer = ev.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
        // ie shame
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
    };
    var reset_style = function(ev) {
        return geojson_layer.resetStyle(ev.target);
    };
    
    var geojson_layer = L.geoJson(geojson, {
        style: style,
        onEachFeature: function(feature, layer) {
            layer.on({
                click: click_ev,
                mouseover: hightligt,
                mouseout: reset_style
            });
        }
    });
    geojson_layer.addTo(map);
    osm_layer.addTo(map);
    map.fitBounds(geojson_layer);
}
initMap();

function renderMap() {
    console.log('hello');
}

