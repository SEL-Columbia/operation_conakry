var geojson = require('./guinea_prefecture');
var data =require('./data');
var $ = require('jquery');
var _ = require('underscore');
var select2 = require('select2');
var L = require('leaflet');
L.Icon.Default.imagePath = 'node_modules/leaflet/images/';
// Initialize multi select

var selection = {
    multiple: true,
    initSelection: function (element, callback) {
        var arr = element.val().split(',');
        var results = _.map(_.uniq(arr), function(value) {
            return {id: value, text: value};
        });
        callback(results);
    },
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
};

$('.filter__select') 
    .select2(selection)
    .on('change', function() {
        renderTable();
        guinea_map.render();
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
    var headers = ['region', 'sector', 'activity_type', 'x_activity', 'org', 'from_date' , 'to_date'];
    var header_display = ["Préfecture", "Secteur", "Type D'activité", "Activité", "Organisation", "Date de Début", "Date de Fin"];
    var html = '<table>';

    // Add headers
    html += '<thead>';
    _.each(headers, function(header) {
        html += '<th>' + header_display[headers.indexOf(header)] + '</th>';
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

function Map() {
    var self = this;
    var regions = getFilters().region;
    this.current_select = regions || [];
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
        var idx = self.current_select.indexOf(name);
        var input = $('input.js-region');
        var val = input.select2('val');
        if (val.indexOf(name) === -1) {
            val.push(name);
        } else {
            val.splice(val.indexOf(name), 1); // removing if exists
        }
        input.select2('val', val, true);
    };
    this.highlight = function(layer) {
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
    };
    this.reset_style = function(target) {
        var name = target.feature.properties.ADM2_NAME;
        if (self.current_select.indexOf(name) === -1) {
            return self.geojson_layer.resetStyle(target);
        }
    };
    this.geojson_layer = L.geoJson(geojson, {
        style: style,
        onEachFeature: function(feature, layer) {
            layer.on({
                click: click_ev,
                mouseover: function(ev) {self.highlight(ev.target);},
                mouseout: function(ev) {self.reset_style(ev.target);}
            });
        }
    });
    self.geojson_layer.addTo(map);
    osm_layer.addTo(map);
    map.fitBounds(self.geojson_layer);
}

Map.prototype.render = function() {
    var self = this;
    this.current_select = getFilters().region;
    console.log(this.current_select);
    this.geojson_layer.eachLayer(function(layer) {
        var name = layer.feature.properties.ADM2_NAME;
        if (self.current_select.indexOf(name) > -1) {
            self.highlight(layer);
        } else {
            self.reset_style(layer);
        }
    });
};

var guinea_map = new Map();

