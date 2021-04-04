// Map for an individual campground

mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 8 // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl())

// read up docs
new mapboxgl.Marker()                                           // make a marker
            .setLngLat(campground.geometry.coordinates)         // set the latitude and longitude
            .setPopup(                                          // set popup on the marker
                new mapboxgl.Popup({ offset: 25 })              // make the popup and set it in
                            .setHTML(`<h3>${campground.title}</h3> <p>${campground.location}</p>`)
            )
            .addTo(map)                                         // add marker to the map