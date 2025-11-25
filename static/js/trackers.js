document.addEventListener('DOMContentLoaded', () => {
    function loadTrackerList(){
        fetch('/trackers')
            .then(r => r.json())
            .then(trackers => {
                const ul = document.getElementById('tracker-list');
                ul.innerHTML = '';

                trackers.forEach(t => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex align-items-center gap-4';
                    li.style.cursor = 'pointer';

                    const dot = document.createElement('span');
                    dot.className = `rounded-circle ${t.active ? 'bg-success' : 'bg-danger'}`;
                    dot.style.width = '10px';
                    dot.style.height = '10px';
                    dot.style.display = 'inline-block';

                    const name = document.createElement('span');
                    name.textContent = t.name;
                    name.className = 'fw-bold'

                    const status = document.createElement('span');
                    status.textContent = t.active ? 'Ativo' : 'Inativo';
                    status.className = `${t.active ? 'text-success' : 'text-danger'} ms-auto`;

                    li.appendChild(dot);
                    li.appendChild(name);
                    li.appendChild(status);

                    li.addEventListener('click', () => {
                        const marker = window.MapApp.trackerMarkers[t.name];
                        if(marker){
                            window.MapApp.map.setCenter(marker.getPosition());
                            window.MapApp.map.setZoom(16);
                        }
                    });

                    ul.appendChild(li);
                });
            });
    }

    loadTrackerList();
});
