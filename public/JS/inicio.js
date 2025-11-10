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