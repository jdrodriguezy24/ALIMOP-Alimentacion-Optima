document.addEventListener('DOMContentLoaded', function() {
    const btnMenu = document.getElementById('btnMenu');
    const menuDesplegable = document.getElementById('menuDesplegable');

    btnMenu.addEventListener('click', function() {
        menuDesplegable.classList.toggle('active');
    });

    // Cerrar el menú cuando se hace clic fuera de él
    document.addEventListener('click', function(event) {
        if (!btnMenu.contains(event.target) && !menuDesplegable.contains(event.target)) {
            menuDesplegable.classList.remove('active');
        }
    });
});

// Manejo del menú de registro
const registroBtn = document.querySelector('.registro-btn');
const registroMenu = document.querySelector('.registro-menu');

// Función para cerrar el menú cuando se hace clic fuera de él
document.addEventListener('click', (event) => {
    if (!registroBtn.contains(event.target) && !registroMenu.contains(event.target)) {
        registroMenu.classList.remove('active');
    }
});

// Toggle del menú al hacer clic en el botón
registroBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    registroMenu.classList.toggle('active');
});