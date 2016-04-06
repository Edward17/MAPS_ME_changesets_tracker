var map;
var changeset_ids = [];

function init() {
     map = L.map('map',
        {
            center: [48.25, 31.2],
            zoom: 5
        }
    );

    var bg_layer = L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 19,
            attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, under ODbL | Tiles under <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>'
        }
    );
    map.addLayer(bg_layer);

    load('');
}

function load(time) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            show(xhttp.responseXML);
        }
    };
    xhttp.open('GET', 'http://api.openstreetmap.org/api/0.6/changesets?bbox=22.000,44.000,40.400,52.500&closed=true' + time, true);
    xhttp.send();
}

function show(response) {
    var changesets_xml = response.getElementsByTagName('changeset');

    for (var i = 0; i < changesets_xml.length; i++) {        
        var changeset_tags = changesets_xml[i].getElementsByTagName('tag');
        var created_by;
        var comment;
        for (var j = 0; j < changeset_tags.length; j++) {
            if (changeset_tags[j].getAttribute('k') == 'created_by') {
                created_by = changeset_tags[j].getAttribute('v');
            } else if (changeset_tags[j].getAttribute('k') == 'comment'){
                comment = changeset_tags[j].getAttribute('v');
            }
        }
                if (created_by.search('MAPS.ME') != -1) {
                    if (changeset_ids.indexOf(changesets_xml[i].getAttribute('id')) == -1) {
                        var marker_lat = (parseFloat(changesets_xml[i].getAttribute('min_lat')) + parseFloat(changesets_xml[i].getAttribute('max_lat')))/2;
                        var marker_lng = (parseFloat(changesets_xml[i].getAttribute('min_lon')) + parseFloat(changesets_xml[i].getAttribute('max_lon')))/2;
                        var marker = L.marker([marker_lat, marker_lng]).addTo(map);
                        var marker_html = 
                        '<div style="font-size: 14px;"><b><a href="https://www.openstreetmap.org/user/' + changesets_xml[i].getAttribute('user') + '" target="_blank">' + changesets_xml[i].getAttribute('user') +'</a></b><br>' + 
                        comment + '<br>' + created_by + '<br>' + 
                        '<a href="https://www.openstreetmap.org/changeset/' + changesets_xml[i].getAttribute('id') + '" target="_blank">browse changeset</a></div>';
                        marker.bindPopup(marker_html);
                        changeset_ids.push(changesets_xml[i].getAttribute('id'));
                    }
                }
    }

    var last_changeset_time = changesets_xml[changesets_xml.length - 1].getAttribute('closed_at');
    if (last_changeset_time.search('2016-04-05T07') == -1 && last_changeset_time.search('2016-04-05T06') == -1) {
        load('&time=2016-04-05T05:00:00Z,' + last_changeset_time);
    } else {
        alert('Loaded!');
    }
}