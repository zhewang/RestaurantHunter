var restaurant_data; //[business_id, name, lon, lat, average_rating]

// custom marker for selected restaurant
var plainMarker = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-icon.png',
    shadowUrl: './leaflet-0.8-dev/images/marker-shadow.png',

    iconSize:    [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
    shadowSize:  [41, 41]
});

var starMarker1 = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-star1.png',
    shadowUrl: './leaflet-0.8-dev/images/marker-shadow.png',

    iconSize:    [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
    shadowSize:  [41, 41]
});

var starMarker2 = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-star2.png',
    shadowUrl: './leaflet-0.8-dev/images/marker-shadow.png',

    iconSize:    [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
    shadowSize:  [41, 41]
});

var starMarker3 = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-star3.png',
    shadowUrl: './leaflet-0.8-dev/images/marker-shadow.png',

    iconSize:    [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
    shadowSize:  [41, 41]
});

var starMarker4 = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-star4.png',
    shadowUrl: './leaflet-0.8-dev/images/marker-shadow.png',

    iconSize:    [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
    shadowSize:  [41, 41]
});

var starMarker5 = L.icon({
    iconUrl: './leaflet-0.8-dev/images/marker-star5.png',
    shadowUrl: './leaflet-0.8-dev/images/marker-shadow.png',

    iconSize:    [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
    shadowSize:  [41, 41]
});

function GetMarkerbyStar(star) {
    var marker = L.Marker;
    switch(Math.round(star)) {
        case 1: marker = starMarker1; break;
        case 2: marker = starMarker2; break;
        case 3: marker = starMarker3; break;
        case 4: marker = starMarker4; break;
        case 5: marker = starMarker5; break;
    }
    return marker;
};

var map

// area selection
var markers = []
var SelectedMarkers = new Array();
var SelectedMarkerZIndex = new Array();
var selectedID = new Array();

d3.json("./az100.json", function(error, json) {
    if (error) return console.warn(error);
    restaurant_data = json;

    // create a map in the "map" div, set the view to a given place and zoom
    lon = restaurant_data[0][2]
    lat = restaurant_data[0][3]
    map = L.map('map').setView([lon, lat], 10);

    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        detectRetina: true
    }).addTo(map);


    // draw the scatter plot (first rating vs average rating) axises
    xaxisRange = d3.scale.linear().domain([0, 5]).range([40,390]);
    yaxisRange = d3.scale.linear().domain([0, 5]).range([370,20]);
    var xAxis = d3.svg.axis().ticks(5).scale(xaxisRange);
    var yAxis = d3.svg.axis().ticks(5).scale(yaxisRange);

    d3.select("#scatter").append("line")
        .attr("x1", 40)
        .attr("y1", 370)
        .attr("x2", 390)
        .attr("y2", 20)
        .attr("stroke", "blue")
        .attr("stroke-width", 1);

    yAxis.orient("left");
    d3.select("#scatter") // or something else that selects the SVG element in your visualizations
        .append("g") // create a group node
        .attr("class", "axises")
        .attr("transform", "translate(40, 0)")
        .call(yAxis); // call the axis generator
     d3.select("#scatter") // or something else that selects the SVG element in your visualizations
        .append("g") // create a group node
        .attr("class", "axises")
        .attr("transform", "translate(0, 370)")
        .call(xAxis); // call the axis generator

    // Click on scatterplot
    d3.select("#scatter")
    .on("click", function()
    {
        var mouseC = d3.mouse(this);
        var onCircle = false;
        for (var k=0; k<firstRat.length; k++){
            if ((mouseC[0] + 5) > xaxisRange(firstRat[k]) && (mouseC[0] - 5) < xaxisRange(firstRat[k]))
            {
                if ((mouseC[1] + 5) > yaxisRange(ratMean[k]) && (mouseC[1] - 5) < yaxisRange(ratMean[k]))
                {
                    d3.select("body").select("#name").text(resName[k]);
                    d3.select("body").select("#weiRating").text(firstRat[k]);
                    d3.select("body").select("#aveRating").text(ratMean[k]);
                    d3.select("body").select("#numRating").text(numR[k]);
                    d3.select("body").select("#firRating").text(firstDate[k]);
                    d3.select("body").select("#lasRating").text(lastDate[k]);

                    onCircle = true
                    highlightInMap(resID[k]);

                    // TODO update the bar chart, can't use plotbyID because this also update the scatterplot
                }
            }
        }

        if (onCircle == false) { // click on blank area, show all selected restaurants
            for(var i = 0; i < SelectedMarkers.length; i ++) {
                SelectedMarkers[i].setOpacity(1);
                SelectedMarkers[i].setZIndexOffset(SelectedMarkerZIndex[i]);
            }
        }
    });

    // Add markers to map
    for (var i = 0; i < restaurant_data.length; i ++) {
         var marker = L.marker([restaurant_data[i][2], restaurant_data[i][3]], {icon: GetMarkerbyStar(restaurant_data[i][4])} ).on('click', onClick);
         marker._leaflet_id = restaurant_data[i][0];
         marker.addTo(map);
         markers[markers.length] = marker
    }

    map.on("boxzoomend", function(e) {
        // reset
        for (var i = 0; i < markers.length; i++) {
            markers[i].setOpacity(1);
        }
        selectedID = [];
        SelectedMarkers = [];
        SelectedMarkerZIndex = [];
        for (var i = 0; i < markers.length; i++) {

            // Not in the boundary or not selected
            if (! e.boxZoomBounds.contains(markers[i].getLatLng())) {
                markers[i].setOpacity(0);
            }
            else {
                selectedID.push(markers[i]._leaflet_id);
                SelectedMarkers.push(markers[i]);
                SelectedMarkerZIndex.push(markers[i]._zIndex);
            }
        }
        plotByID(selectedID);
    });

    // reset selection
    d3.select("#reset")
        .on("click", function() {
            // resume all markers
            for (var i = 0; i < markers.length; i++) {
                markers[i].setOpacity(1);
            }

            // clean all the plots and table entries
            d3.select("body").selectAll(".svgclass").remove();
            d3.select("#scatter").selectAll("circle").remove();
            d3.select("body").select("#name").text("");
            d3.select("body").select("#weiRating").text("");
            d3.select("body").select("#aveRating").text("");
            d3.select("body").select("#numRating").text("");
            d3.select("body").select("#firRating").text("");
            d3.select("body").select("#lasRating").text("");
        });

    // Highlight the marker when click on corresponding scatterplot
    function highlightInMap(resID) {
        for(var i = 0; i < SelectedMarkers.length; i ++) {
            if(SelectedMarkers[i]._leaflet_id == resID) {
                SelectedMarkers[i].setOpacity(1);
                SelectedMarkers[i].setZIndexOffset(10000);
            }
            else {
                SelectedMarkers[i].setOpacity(0.3);
                SelectedMarkers[i].setZIndexOffset(SelectedMarkerZIndex[i]);
            }
        }
    }

    // Click on a marker
    function onClick(e) {
        for(var i = 0; i < markers.length; i ++) {
            if(markers[i]._leaflet_id == this._leaflet_id)
                markers[i].setOpacity(1);
            else
                markers[i].setOpacity(0);
        }

        plotByID([this._leaflet_id]);
    }

});
