var data = [
    {
        "region": "Beyla",
        "category": "Communication",
        "category2": "Campagne médiatique",
        "value": "PNUD\nInternews: en collaboration avec\nla radio rurale de Beyla"
    },
    {
        "region": "Boké",
        "category": "Communication",
        "category2": "Campagne médiatique",
        "value": "PNUD: Publication dans les médias (émissions radios, télé, presse écrite, presse en ligne etc.) \nInternews: en collaboration avec la radio rurale de Boké"
    },
    {
        "region": "Conakry",
        "category": "Transport & diagnostiques",
        "category2": "Financement/Fourniture",
        "value": "UNICEF\nPRG\nBM (2 pick up)\nOMS (3 pick up)\nUNICEF (3 pick up)"
    },
    {
        "region": "Beyla",
        "category": "Transport & diagnostiques",
        "category2": "Des laboratoires PCR avec une capacité suffisante d’accueil doivent être mis en place pour que tous les patients puissent être testés et obtenir leurs résultats le même jour.",
        "value": "Planifié"
    },
    {
        "region": "Beyla",
        "category": "Surveillance & suivi",
        "category2": "3. Investigation et Epidemiologie",
        "category3": "Chauffeur d'investigation",
        "value": "OMS/CDC"
    }
];


function getFilteredData() {
    var filters = {};
    $('.select2-container')
    .each(function() {
        var key = $(this).data('key');
        if (key) {
            filters[key] = $(this).select2('val');
        }
    });
    
    return _.filter(data, function(item) {
        for (var key in filters) {
            if (item[key] != filters[key])
                return false;
        }
        return true;
    });
}


function renderTable() {
    var data = getFilteredData();
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
    html += '</table>'
    
    // Add to DOM
    $('.table table').remove();
    $('.table').append(html);
}


// Initialize multi-select
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



    