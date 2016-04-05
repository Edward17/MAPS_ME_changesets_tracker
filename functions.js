var map;
var changeset_ids = [];

function init() {
     map = L.map('map',
        {
            center: [0.0, 0.0],
            zoom: 1
        }
    );

    var bg_layer = L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 19
        }
    );
    map.addLayer(bg_layer);

    load();
    var loop = setInterval(load, 5000);
}

function load() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            show(xhttp.responseXML);
        }
    };
    xhttp.open('GET', 'http://api.openstreetmap.org/api/0.6/changesets?closed=true', true);
    xhttp.send();
}

function show(response) {
    var changesets_xml = response.getElementsByTagName('changeset');

    for (var i = 0; i < changesets_xml.length; i++) {        
        var changeset_tags = changesets_xml[i].getElementsByTagName('tag');
        var created_by;
        for (var j = 0; j < changeset_tags.length; j++) {
            if (changeset_tags[j].getAttribute('k') == 'created_by') {
                created_by = changeset_tags[j].getAttribute('v');

                if (created_by.search('MAPS.ME') != -1) {
                    if (changeset_ids.indexOf(changesets_xml[i].getAttribute('id')) == -1) {
                        var marker_lat = (parseFloat(changesets_xml[i].getAttribute('min_lat')) + parseFloat(changesets_xml[i].getAttribute('max_lat')))/2;
                        var marker_lng = (parseFloat(changesets_xml[i].getAttribute('min_lon')) + parseFloat(changesets_xml[i].getAttribute('max_lon')))/2;
                        var marker = L.marker([marker_lat, marker_lng]).addTo(map);
                        marker.bindPopup('<a href="https://www.openstreetmap.org/changeset/' + changesets_xml[i].getAttribute('id') + '" target="_blank">browse changeset</a><br>' + created_by);
                        changeset_ids.push(changesets_xml[i].getAttribute('id'));
                    }
                }
            }
        }

    }
}