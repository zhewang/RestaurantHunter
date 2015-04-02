var data; //[business_id, name, lon, lat]

d3.json("./az100.json", function(error, json) {
    if (error) return console.warn(error);
    data = json; 
      
    // create a map in the "map" div, set the view to a given place and zoom
    lon = data[0][2]
    lat = data[0][3]
    var map = L.map('map').setView([lon, lat], 10);

    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // add a marker in the given location
    clickfunction = function onClick(e) {
        alert(this._leaflet_id);
    }

    var markers = []
    for (var i = 0; i < data.length; i ++) {
         var marker = L.marker([data[i][2], data[i][3]]).on('click', clickfunction);
         marker._leaflet_id = data[i][0];
         marker.addTo(map);
         markers[markers.length] = marker
    }

    var redMarker = L.icon({
        iconUrl: './leaflet-0.8-dev/images/marker-red.png',
        shadowUrl: './leaflet-0.8-dev/images/marker-shadow.png',

        iconSize:    [25, 41],
        iconAnchor:  [12, 41],
        popupAnchor: [1, -34],
        shadowSize:  [41, 41]
    });

    var SelectedMarkerIndex = new Array();
    var AddedRedMarkers = new Array();
    map.on("boxzoomend", function(e) {
        for (var i = 0; i < markers.length; i++) {

            if (e.boxZoomBounds.contains(markers[i].getLatLng())) {

                // already selected or not
                var flag = 0;
                for (var j = 0; j < SelectedMarkerIndex.length; j ++) {
                    if (SelectedMarkerIndex[j] == i) {
                        flag = 1
                    }
                }

                if (flag == 0) {
                    map.removeLayer(markers[i]); 
                    SelectedMarkerIndex.push(i);                   

                    var marker = L.marker(markers[i].getLatLng(), {icon: redMarker}).on('click', clickfunction);
                    marker._leaflet_id = markers[i]._leaflet_id;
                    marker.addTo(map);
                    AddedRedMarkers.push(marker);
                }
                
            }
        }

    });

    d3.select("#reset")
        .on("click", function() {
            for (var i = 0; i < AddedRedMarkers.length; i ++) {
                map.removeLayer(AddedRedMarkers[i])
                markers[SelectedMarkerIndex[i]].addTo(map);
            }

            AddedRedMarkers = [];
            SelectedMarkerIndex = [];
            
        }); 

});  