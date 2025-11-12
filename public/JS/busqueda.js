document.addEventListener('DOMContentLoaded', () => {
    console.log('Script de búsqueda cargado');
    
    const input = document.querySelector('.input-busqueda');
    const btn = document.querySelector('.btn-busqueda');
    const results = document.getElementById('search-results');
    const tbody = document.querySelector('#results-table tbody');
    const noResults = document.getElementById('no-results');

    if (!input || !btn || !results || !tbody) {
        console.error('Elementos no encontrados en el DOM');
        return;
    }

    console.log('Elementos encontrados correctamente');

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
        
        console.log('Búsqueda iniciada:', q);
        
        if (!q) {
            results.style.display = 'none';
            tbody.innerHTML = '';
            return;
        }

        try {
            const url = `/api/alimentos?q=${encodeURIComponent(q)}`;
            console.log('Fetching:', url);
            
            const res = await fetch(url);
            
            console.log('Response status:', res.status);
            
            if (!res.ok) throw new Error('Error en la petición');
            
            const items = await res.json();
            
            console.log('Resultados:', items);

            if (!items || items.length === 0) {
                tbody.innerHTML = '';
                noResults.style.display = 'block';
                results.style.display = 'block';
                return;
            }

            noResults.style.display = 'none';
            tbody.innerHTML = items.map(item => `
                <tr>
                    <td>${escapeHtml(item.nombre)}</td>
                    <td>${escapeHtml(item.categoria || item.tipoAlimento)}</td>
                    <td>$${escapeHtml(item.precio || item.valorUnidad)}</td>
                    <td style="text-align:center;">
                        <a href="/producto/${item.idAlimento || item.id}" class="btn btn-sm btn-primary">Ver</a>
                    </td>
                </tr>
            `).join('');
            
            results.style.display = 'block';
        } catch (err) {
            console.error('Error en búsqueda:', err);
            tbody.innerHTML = '<tr><td colspan="4" style="padding:10px; text-align:center; color:red;">Error en la búsqueda</td></tr>';
            results.style.display = 'block';
        }
    }

    btn.addEventListener('click', (e) => {
        console.log('Botón clickeado');
        e.preventDefault();
        doSearch();
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log('Enter presionado');
            e.preventDefault();
            doSearch();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-form') && 
            !e.target.closest('.search-results')) {
            results.style.display = 'none';
        }
    });
});