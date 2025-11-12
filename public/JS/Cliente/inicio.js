const btnMenu = document.getElementById("btnMenu");
const menuDesplegable = document.getElementById("menuDesplegable");

btnMenu.addEventListener("click", () => {
    if (menuDesplegable.style.display === "block") {
        menuDesplegable.style.display = "none";
    } else {
        menuDesplegable.style.display = "block";
    }
});

// Manejo del menú de usuario
const usuarioBtn = document.querySelector('.usuario-btn');
const usuarioMenu = document.querySelector('.usuario-menu');

// Función para cerrar el menú cuando se hace clic fuera de él
document.addEventListener('click', (event) => {
    if (!usuarioBtn.contains(event.target) && !usuarioMenu.contains(event.target)) {
        usuarioMenu.classList.remove('active');
    }
});

// Toggle del menú al hacer clic en el botón
usuarioBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    usuarioMenu.classList.toggle('active');
});

// Busqueda de alimentos
/*document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.input-busqueda');
    const btn = document.querySelector('.btn-busqueda');
    const results = document.getElementById('search-results');
    const tbody = document.querySelector('#results-table tbody');
    const noResults = document.getElementById('no-results');

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[c]);
    }

    async function doSearch() {
        const q = input.value.trim();
        
        if (!q) {
            results.style.display = 'none';
            tbody.innerHTML = '';
            return;
        }

        try {
            const res = await fetch(`/api/alimentos?q=${encodeURIComponent(q)}`);
            
            if (!res.ok) throw new Error('Error en la petición');
            
            const items = await res.json();

            if (!items || items.length === 0) {
                tbody.innerHTML = '';
                noResults.style.display = 'block';
                results.style.display = 'block';
                return;
            }

            noResults.style.display = 'none';
            tbody.innerHTML = items.map(item => `
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px;">${escapeHtml(item.nombre)}</td>
                    <td style="padding:10px;">${escapeHtml(item.categoria || item.tipoAlimento)}</td>
                    <td style="padding:10px;">$${escapeHtml(item.precio || item.valorUnidad)}</td>
                    <td style="padding:10px; text-align:center;">
                        <a href="/producto/${item.idAlimento || item.id}" class="btn btn-sm btn-primary">Ver</a>
                    </td>
                </tr>
            `).join('');
            
            results.style.display = 'block';
        } catch (err) {
            console.error('Error en búsqueda:', err);
            noResults.style.display = 'block';
            results.style.display = 'block';
        }
    }

    // Buscar al hacer clic en el botón
    btn.addEventListener('click', doSearch);
    
    // Buscar mientras escribe
    input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            doSearch();
        } else {
            // Búsqueda en tiempo real
            clearTimeout(input.searchTimeout);
            input.searchTimeout = setTimeout(doSearch, 300);
        }
    });

    // Cerrar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.d-flex.mx-auto.position-relative')) {
            results.style.display = 'none';
        }
    });
});*/