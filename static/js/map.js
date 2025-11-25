// tema escuro padrão: https://developers.google.com/maps/documentation/javascript/examples/style-array
const nightmode = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
    { // remove pontos de interesse!
        featureType: "poi",
        elementType: "all",
        stylers: [{ visibility: "off" }]
    }
]

window.MapApp = {
    map: null,
    trackerMarkers: {},
    infoWindow: null,
    initMap: function(){
        this.map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: -15.78, lng: -47.93 },
            zoom: 5,
            clickableIcons: false,
            styles: nightmode
        });

        this.infoWindow = new google.maps.InfoWindow();

        // primeira carga
        this.refreshTrackers();

        // recarregar periodicamente
        // setInterval(() => this.refreshTrackers(), 1000);
    },
    refreshTrackers: function(){
        fetch("/trackers")
            .then(r => r.json())
            .then(trackers => {
                trackers.forEach(t => {
                    const key = t.name;
                    if(!this.trackerMarkers[key]){
                        const marker = new google.maps.Marker({
                            position: { lat: t.lat, lng: t.lng },
                            map: this.map,
                            icon: "/static/media/tracker.png",
                            title: t.name
                        });

                        marker.addListener("click", () => {
                            const html = `
                                <div class="text-dark">
                                    <strong>${t.name}</strong><br>
                                    Latitude: ${t.lat}<br>
                                    Longitude: ${t.lng}
                                </div>
                            `;
                            this.infoWindow.setContent(html);
                            this.infoWindow.open(this.map, marker);
                        });

                        this.trackerMarkers[key] = marker;
                    }else{
                        this.trackerMarkers[key].setPosition({ lat: t.lat, lng: t.lng });
                        this.trackerMarkers[key].setTitle(t.name);
                    }
                });
            });
    }
};

// callback do Google Maps
function initMap(){
    MapApp.initMap();
}