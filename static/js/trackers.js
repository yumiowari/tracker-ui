document.addEventListener('DOMContentLoaded', () => {
    function loadTrackerList() {
        fetch('/trackers')
            .then(r => r.json())
            .then(trackers => {
                const ul = document.getElementById('tracker-list');
                ul.innerHTML = '';

                trackers.forEach(t => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex align-items-center gap-2';

                    const dot = document.createElement('span');
                    dot.className = `rounded-circle ${t.active ? 'bg-success' : 'bg-danger'}`;
                    dot.style.width = '10px';
                    dot.style.height = '10px';
                    dot.style.display = 'inline-block';

                    const name = document.createElement('span');
                    name.textContent = t.name;
                    name.style.fontWeight = '600';

                    const status = document.createElement('span');
                    status.textContent = t.active ? 'Ativo' : 'Inativo';
                    status.className = `${t.active ? 'text-success' : 'text-danger'} ms-auto`;

                    li.appendChild(dot);
                    li.appendChild(name);
                    li.appendChild(status);

                    ul.appendChild(li);
                });
            })
            .catch(err => {
                console.error('Erro ao carregar os rastreadores:', err);
            });
    }

    loadTrackerList();
});