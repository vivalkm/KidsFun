mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
    center: activity.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

// const popup = new mapboxgl.Popup({ closeOnClick: false })
//     .setLngLat([lng, lat])
//     .setHTML('<h3>Hello World!</h3>')
//     .addTo(map);

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
    .setLngLat(activity.geometry.coordinates)
    .addTo(map);