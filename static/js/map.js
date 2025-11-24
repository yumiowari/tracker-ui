let map;
const trackerMarkers = {};
let infoWindow;

// rotina de atualização dos marcadores
function refreshTrackers(map){
    fetch("/trackers")
        .then(r => r.json())
        .then(trackers => {

            trackers.forEach(t => {
                // usa o name como identificador
                const key = t.name

                // se o marcador ainda não existe, cria.
                if(!trackerMarkers[key]){
                    const marker = new google.maps.Marker({
                        position: { lat: t.lat, lng: t.lng },
                        map: map,
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
                        `.trim();

                        infoWindow.setContent(html);
                        infoWindow.open(map, marker);
                    });

                    trackerMarkers[key] = marker;
                } else {
                    // se já existe, só atualiza posição e título
                    trackerMarkers[key].setPosition({ lat: t.lat, lng: t.lng });
                    trackerMarkers[key].setTitle(t.name);
                }
            });
        });
}

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

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -15.78, lng: -47.93 }, // inicialmente em Brasília
        zoom: 5,
        clickableIcons: false, // evita que ícones nativos sejam clicáveis
        styles: nightmode
    });

    // tenta centralizar o mapa no usuário
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            pos => {
                const userPos = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };

                map.setCenter(userPos);
                map.setZoom(14);

                new google.maps.Marker({
                    position: userPos,
                    map,
                    icon: "/static/media/user.png"
                });
            },
            () => {
                console.log("Não foi possível centralizar o mapa no usuário.");
            }
        );
    }

    infoWindow = new google.maps.InfoWindow();

    // primeira carga imediata
    refreshTrackers(map);

    // recarrega a cada 1 segundo
    //setInterval(() => refreshTrackers(map), 1000);

    // (hack) observa o clique do usuário para retornar a latitude e longitude no ponto
    map.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        console.log(`Latitude: ${lat}\nLongitude: ${lng}`);
    });
}