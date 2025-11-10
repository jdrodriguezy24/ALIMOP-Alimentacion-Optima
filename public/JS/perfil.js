function habilitarEdicion(boton) {
    const input = boton.previousElementSibling;
    const estaEditando = input.readOnly;

    if (estaEditando) {
        input.removeAttribute('readonly');
        boton.textContent = 'Listo';
        input.focus();

        // Si es campo de contraseña, mostrar el texto
        if (input.type === 'password') {
        input.type = 'text';
        }
    } else {
        input.setAttribute('readonly', 'true');
        boton.textContent = 'Editar';

        // Si es campo de contraseña, volver a ocultar
        if (input.id === 'contrasenia') {
        input.type = 'password';
        }
    }
}
function confirmarEliminacion() {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
        window.location.href = '/perfil/<%= usuario.idCliente %>/eliminar';
    }
}

