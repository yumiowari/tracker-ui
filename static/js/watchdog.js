document.addEventListener("DOMContentLoaded", () => {
    const CHECK_MS = 5000; // verifica a cada 5s
    const RADIUS_M = 50;   // limite em metros

    // posição inicial de cada rastreador
    const anchors = new Map();

    // rastreadores que já dispararam alerta
    const alerted = new Set();

    async function loadTrackers(){
        const res = await fetch("/tracker/list");
        if(!res.ok){
            console.error("Falha ao buscar os rastreadores");
            return [];
        }
        return res.json();
    }

    function toRad(v){
        return v * Math.PI / 180;
    }

    // fórmula de Haversine para medir distância em metros
    function distanceMeters(lat1, lng1, lat2, lng2){
        const R = 6371000; // raio da Terra em metros
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    async function createNotification(content){
        try{
            await fetch("/notification/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content })
            });
        }catch(err){
            console.error("Erro ao criar notificação:", err);
        }
    }

    async function checkMovement(){
        const trackers = await loadTrackers();

        trackers.forEach(t => {
            const name = t.name;
            const current = { lat: t.lat, lng: t.lng };

            // salva a âncora inicial
            if(!anchors.has(name)){
                anchors.set(name, current);
                return;
            }

            const start = anchors.get(name);
            const dist = distanceMeters(start.lat, start.lng, current.lat, current.lng);

            // verifica se saiu da área
            if(dist > RADIUS_M && !alerted.has(name)){
                alerted.add(name);

                createNotification(
                    `⚠️ O rastreador "${name}" saiu da área permitida (${dist.toFixed(1)}m)`
                );
            }
        });
    }

    // carga inicial
    loadTrackers().then(ts => {
        ts.forEach(t => anchors.set(t.name, { lat: t.lat, lng: t.lng }));
    });

    // monitoramento contínuo
    setInterval(checkMovement, CHECK_MS);
});