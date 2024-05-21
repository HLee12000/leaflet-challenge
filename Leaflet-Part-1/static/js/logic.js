console.log("step 1 process");
//Establish tile layer for background
let basemap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });
// Establish map
let map = L.map("map", {
    center: [
        40.7, -94.5
    ],
    zoom: 3
});
//Add background to map
basemap.addTo(map);

// Feth geojson data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then((data) => {
    // calc raidus and color, style info
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        }
    }
    // color for marker
    function getColor(depth) {
        switch (true) {
          case depth > 90:
            return "#ea2c2c";
          case depth > 70:
            return "#ea822c";
          case depth > 50:
            return "#ee9c00";
          case depth > 30:
            return "#eecc00";
          case depth > 10:
            return "#d4ee00";
          default:
            return "#98ee00";
        }
    }

    // fetch radius to for the marker, want to display even 0 magnitudes, so set to 1
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }

        return magnitude * 4;
    }

    //Add geojson data
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },

        style: styleInfo,

        onEachFeature: function(feature, layer) {
            layer.bindPopup(
                "Magnitude: " + feature.properties.mag +
                "<br>Depth: " + feature.geometry.coordinates[2] + 
                "<br>Location: " + feature.properties.place
            );
        }
    }).addTo(map);

    // Legend setup
    let legend = L.control({
        position: "bottomright"
    });

    // Legend add
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let grades = [-10, 10, 30, 50, 70, 90];
        let colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"
        ];

        // Loop to generate label for legend
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i>"
                + grades[i] + (grades[i+1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");        
        }
        return div;
    };
    legend.addTo(map);
});