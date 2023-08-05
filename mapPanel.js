var mymap = L.map('mapid').setView([0, 0], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(mymap);

let markers = [];

window.addEventListener('message', (event) => {
const message = event.data; // The JSON data our extension sent
switch (message.command) {
    case 'addMarkers':
    markers = [...markers, ...message.markers];
    message.markers.forEach((marker) => {
        addMarker(marker, mymap, L);
    });

    mymap.fitBounds(markers, { maxZoom: 12 });
    break;
}
});

function addMarker(marker, mymap, L) {
const newMarker = L.marker(marker).addTo(mymap);
newMarker.bindTooltip(`${marker[0]},${marker[1]}`, {
    permanent: false,
});

// add a circle to show new markers
const circleMarker = L.circleMarker(marker, {
    radius: 10,
    fillColor: '#ff7800',
    color: '#3287CC',
    weight: 2,
    opacity: 1,
    fillOpacity: 0,
}).addTo(mymap);

// Animate the marker
let originalRadius = circleMarker.getRadius();
let originalOpacity = circleMarker.options.fillOpacity;
let expandInterval = setInterval(() => {
    let currentRadius = circleMarker.getRadius();
    if (currentRadius < originalRadius + 30) {
    circleMarker.setRadius(currentRadius + 1);
    } else {
    clearInterval(expandInterval);
    mymap.removeLayer(circleMarker);
    }
}, 50);
}