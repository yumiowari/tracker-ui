document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("notifications");
    const POLL_MS = 1000;
    const ANIM_MS = 300; // congruente à duração definida no CSS

    // map id -> li element
    function getExistingMap(){
        const map = new Map();
        list.querySelectorAll("li[data-id]").forEach(li => {
            const id = li.getAttribute("data-id");
            map.set(Number(id), li);
        });
        return map;
    }

    function createListItem(n){
        const li = document.createElement("li");
        li.setAttribute("data-id", n.id);
        li.className = "list-group-item bg-dark text-light d-flex justify-content-between align-items-center notification-slide-in";
        li.style.willChange = "transform, opacity";

        const span = document.createElement("span");
        span.textContent = n.content;

        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-outline-danger ms-3";
        removeBtn.innerHTML = '<i class="bi bi-x-lg"></i>';

        removeBtn.addEventListener("click", () => handleRemoveClick(n.id, li));

        li.appendChild(span);
        li.appendChild(removeBtn);

        return li;
    }

    async function handleRemoveClick(id, li){
        // se já estiver animando a saída, ignora.
        if(li.classList.contains("notification-slide-out"))return;

        // garante que a animação de saída "vença" a animação de entrada
        li.classList.remove("notification-slide-in-active");
        li.classList.add("notification-slide-out");

        // aguarda animação terminar, remove do backend e do DOM
        setTimeout(async () => {
            await removeNotification(id);
            // apenas remove do DOM se ainda estiver presente (evita race)
            if (li.parentElement) li.parentElement.removeChild(li);
        }, ANIM_MS);
    }

    async function removeNotification(id){
        try{
            await fetch("/notification/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
        }catch(err){
            console.error("Erro ao remover notificação:", err);
        }
    }

    async function loadNotifications(){
        try{
            const res = await fetch("/notification/list");
            if(!res.ok){
                console.error("Falha ao carregar notificações:", res.status);
                return;
            }

            const data = await res.json(); // array de {id, content}
            const newIds = new Set(data.map(n => n.id));
            const existing = getExistingMap();

            const toggler = document.getElementById("toggle-overlay");

            // atualiza o cor do botão
            if(toggler){
                if(data.length > 0){
                    toggler.classList.add("btn-danger");
                    toggler.classList.add("notification-wiggle");
                }else{
                    toggler.classList.remove("btn-danger");
                    toggler.classList.remove("notification-wiggle");
                }
            }

            // remoção de itens que não existem mais no servidor
            for(const [id, li] of existing.entries()){
                if(!newIds.has(id)){
                    // se já estiver saindo, pula
                    if(li.classList.contains("notification-slide-out"))continue;

                    // inicia animação de saída e remove do DOM após ANIM_MS
                    li.classList.remove("notification-slide-in-active");
                    li.classList.add("notification-slide-out");
                    setTimeout(() => {
                        if (li.parentElement) li.parentElement.removeChild(li);
                    }, ANIM_MS);
                }
            }

            // se já existe, atualiza o conteúdo se houve alteração
            for(const n of data){
                const id = n.id;
                if(existing.has(id)){
                    const li = existing.get(id);
                    // atualiza texto apenas se houve alteração
                    const span = li.querySelector("span");
                    if(span && span.textContent !== n.content){
                        span.textContent = n.content;
                    }
                    continue;
                }

                // novo item
                const li = createListItem(n);
                list.appendChild(li);

                // força reflow e ativa animação de entrada
                void li.offsetWidth;
                li.classList.add("notification-slide-in-active");
            }

        }catch(err){
            console.error("Erro ao buscar notificações:", err);
        }
    }

    // primeira carga e polling
    loadNotifications();
    setInterval(loadNotifications, POLL_MS);
});