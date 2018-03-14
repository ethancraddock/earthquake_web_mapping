// Store our API endpoint inside queryUrl
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

var plate = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

var seismic = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

var map = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");


// Layer Groups
var earthquakes = new L.layerGroup();
var faults = new L.layerGroup();

// Define a map object
var myMap = L.map("map", {
  center: [46.06, -114.34],
  zoom: 4,
  layers: [map]
});



d3.json(url, function(response) {
  // Once we get a response, send the data.features object to the createFeatures function
  // Loop through our data...
  function styleData(feature) {
  return {
    stroke: false,
    fillOpacity: .7,
    fillColor: getColor(feature.properties.mag),
    radius: circRad(feature.properties.mag)    
    };
  }


  function getColor(mag){
    switch(true){
      case mag < 1:
        return "#72FF81";
      case mag < 2:
        return "#C8FF72";
      case mag < 3:
        return "#F0FF72";
      case mag < 4:
        return "#FFD672";
      case mag < 5:
        return "#FE3B10";
      default:
        return "#E02800";
  }};

  function circRad(r) {
    return r*10;
  }


  
  L.geoJSON(response, {
      // needs to get called inside the L.geoJSON function
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleData,
    onEachFeature: function(feature, layer) {


      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

  }).addTo(earthquakes);
  earthquakes.addTo(myMap);
})



 // L.geoJSON(response, {
 //   style: polystyle
 // }).addTo(myMap);



d3.json(plate, function(response){

  function polystyle(feature){
    return {
     fillColor: 'yellow',
     weight: 2,
     opacity: 1,
     color: 'orange', //Outline color
     fillOpacity: 0.0
    };
  }

  L.geoJSON(response, {style: polystyle}).addTo(faults);
  faults.addTo(myMap);
})





// Define sat map

var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiYmJhbGVzMTEiLCJhIjoiY2plYmptdmFwMGRydzJybzdpdzBxazk1aiJ9.ASSE0faIpkFAu87MR5RM0g");


// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Map": map,
  "Satellite Map": satmap
};

// Create overlay object to hold our overlay layer
var overlayMaps = {
  "Earthquakes": earthquakes,
  "Plates": faults
};



// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);


// Legend
var legend = L.control({position: 'bottomright'});


function getColor(d) {
    return d <= 1 ? "#72FF81":
           d <= 2 ? "#C8FF72":
           d <= 3 ? "#F0FF72":
           d <= 4 ? "#FFD672":
           d <= 5 ? "#FF8B72":
           d > 5 ? "#FE3B10":
                    "#ffffff";
  }


  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);