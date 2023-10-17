
//Store API as query URL
const QUERY_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
const CENTER_MCI=[39.2976111,-94.7138889];
const DEFAULT_ZOOM = 3;

//tiles
let tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
  
  
// Create a baseMaps object to hold the streetmap layer.
let baseMaps = {
    "Street Map": tiles
};
  
//Using Leaflet, create a map that plots all the earthquakes from your dataset based on their longitude and latitude
let map = L.map('map', {
    center: CENTER_MCI,
    zoom: DEFAULT_ZOOM,
    layers: [tiles]
});
  
// // Create a layer group for earthquake markers
let earthquakeLayer = L.layerGroup().addTo(map);

// Function to plot earthquakes on the map
function plotEarthquakes(data) {
    // Clear existing markers
    earthquakeLayer.clearLayers();

    // Access the features array from GeoJSON data
    let earthquakes = data.features;

    // Loop through each earthquake feature and add it to the map
    earthquakes.forEach((earthquake) => {
        let dot = makeDot(earthquake);

        // Create a circle marker and add it to the earthquake layer
        let marker = L.circleMarker([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]], dot)
            .bindPopup(makePopup(earthquake))
            .addTo(earthquakeLayer);
    });
}

// Create a layer control with base maps and overlay (earthquake) layer
L.control.layers(baseMaps, { "Earthquakes": earthquakeLayer }, { collapsed: false }).addTo(map);

//Ensure that the map is initially populated with earthquake data
d3.json(QUERY_URL).then((data)=>plotEarthquakes(data));


//Make data markers that reflect magnitude of the earthquake by their size and the depth by color 
function makeDot(feature) {
    let dot = {};

    // Set marker size based on magnitude
    let magnitude = feature.properties.mag
    if (magnitude) {
        dot.radius = magnitude *5;
    }

    // // Set marker color based on depth
    let depth = feature.geometry.coordinates[2];
    if (depth < 30) {
        dot.color = "green";
    } else if (depth < 50) {
        dot.color = "yellow";
    } else if (depth < 70) {
        dot.color = "orange";
    } else if (depth < 90) {
        dot.color = "red";
    } else {
        dot.color = "blue";
    }
return dot;
}

// Function to include popups that provide additional information
function makePopup(feature) {
    let properties = feature.properties;

    // Create HTML content for the popup
    let popupContent = `
        <strong>Location:</strong> ${properties.place}<br>
        <strong>Magnitude:</strong> ${properties.mag}<br>
        <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km
    `;

    // Create a Leaflet popup and bind it to the marker
    return L.popup().setContent(popupContent);
}


//Create a legend that will provide context for your map data.
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');

    // Define legend labels
    const labels = ['<strong>Depth Legend</strong><br>'];

    // Define legend colors and ranges
    const colors = ['green', 'yellow', 'orange', 'red', 'blue'];
    const ranges = ['< 30 km', '30-50 km', '50-70 km', '70-90 km', '>= 90 km'];

    // Loop through the ranges and add colored squares and labels
    for (let i = 0; i < ranges.length; i++) {
        div.innerHTML += `<i style="background:${colors[i]}"></i> ${ranges[i]}<br>`;
    }

    div.innerHTML = labels.join('<br>') + div.innerHTML;

    return div;
};

// // Add legend to the map
legend.addTo(map);




