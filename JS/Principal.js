// Obtener elementos del DOM
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const submitLogin = document.getElementById('submitLogin'); // Agregado para manejar el envío del formulario

// Abrir el modal al hacer clic en el botón "Ingresar"
loginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden'); // Muestra el modal
});

// Cerrar el modal al hacer clic en la "X"
closeModal.addEventListener('click', () => {
    loginModal.classList.add('hidden'); // Oculta el modal
});

// Cerrar el modal al hacer clic fuera del contenido del modal
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.classList.add('hidden');
    }
});

// Alternar la visibilidad de la contraseña
togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.textContent = type === 'password' ? 'Mostrar' : 'Ocultar';
});

// Manejar el envío del formulario de inicio de sesión
submitLogin.addEventListener('click', (event) => {
    event.preventDefault(); // Evita el envío del formulario por defecto
    const email = document.getElementById('email').value; // Obtener el valor del correo
    const password = passwordInput.value; // Obtener el valor de la contraseña

    // Aquí puedes agregar la lógica para autenticar al usuario
    console.log('Correo:', email);
    console.log('Contraseña:', password);

    // Cerrar el modal después de intentar iniciar sesión
    loginModal.classList.add('hidden');
});