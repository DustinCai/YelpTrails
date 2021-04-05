// Map for an individual trail

mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
    center: trail.geometry.coordinates, // starting position [lng, lat]
    zoom: 8 // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl())

// read up docs
new mapboxgl.Marker()                                           // make a marker
            .setLngLat(trail.geometry.coordinates)              // set the latitude and longitude
            .setPopup(                                          // set popup on the marker
                new mapboxgl.Popup({ offset: 25 })              // make the popup and set it in
                            .setHTML(`<h3>${trail.title}</h3> <p>${trail.location}</p>`)
            )
            .addTo(map)                                         // add marker to the map