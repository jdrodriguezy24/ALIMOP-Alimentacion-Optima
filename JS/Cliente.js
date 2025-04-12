document.getElementById('search').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        // Aquí puedes manejar la búsqueda
        const query = this.value;
        alert(`Buscando: ${query}`);
        // Redirigir o realizar la búsqueda según sea necesario
    }
});

document.getElementById('searchButton').addEventListener('click', function() {
    const query = document.getElementById('search').value;
    alert(`Buscando: ${query}`);
    // Redirigir o realizar la búsqueda según sea necesario
});