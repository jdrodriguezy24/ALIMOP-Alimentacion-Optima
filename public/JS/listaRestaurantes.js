const btnMenu = document.getElementById("btnMenu");
const menuDesplegable = document.getElementById("menuDesplegable");

btnMenu.addEventListener("click", () => {
    if (menuDesplegable.style.display === "block") {
        menuDesplegable.style.display = "none";
    } else {
        menuDesplegable.style.display = "block";
    }
});

// Menu desplegable de usuario
document.addEventListener('DOMContentLoaded', function() {
    const usuarioDropdown = document.querySelector('.usuario-dropdown');
    const usuarioMenu = usuarioDropdown.querySelector('.usuario-menu');
    
    usuarioDropdown.addEventListener('click', function(e) {
        if (e.target.closest('.usuario-btn')) {
            e.preventDefault();
            usuarioMenu.classList.toggle('active');
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.usuario-dropdown')) {
            usuarioMenu.classList.remove('active');
        }
    });
});

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