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

        // Tenta centralizar o mapa no usuário
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                // Sucesso na obtenção da localização
                pos => {
                    const userPos = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };

                    // 1. Centraliza e aplica zoom na posição do usuário
                    this.map.setCenter(userPos);
                    this.map.setZoom(14); // Um zoom mais próximo para a posição do usuário

                    // 2. Adiciona o marcador na posição do usuário
                    new google.maps.Marker({
                        position: userPos,
                        map: this.map,
                        icon: "/static/media/user.png"
                    });
                },
                // Falha na obtenção da localização
                () => {
                    console.log("Não foi possível centralizar o mapa no usuário.");
                }
            );
        }

        // primeira carga
        this.refreshTrackers();

        // recarregar periodicamente 
        setInterval(() => this.refreshTrackers(), 1000);
        // /!\ REMOVA O COMENTÁRIO PARA FUNCIONALIDADE COMPLETA

        // Observa o clique do usuário para retornar a latitude e longitude no console
        this.map.addListener("click", (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();

            console.log(`Latitude: ${lat}\nLongitude: ${lng}`);
        });
    },
    refreshTrackers: function(){
        fetch("/tracker/list")
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