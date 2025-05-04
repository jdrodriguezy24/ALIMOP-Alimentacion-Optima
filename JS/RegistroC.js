const container = document.querySelector(".container");
const btnIngreso = document.getElementById("btn-ingreso")
const btnRegistro = document.getElementById("btn-registro")

//Eventos de click
btnIngreso.addEventListener("click", () => {
  container.classList.remove("toggle");
});

btnRegistro.addEventListener("click",()=>{
  container.classList.add("toggle");
})

//Validación de formulario
document.getElementById('Ingreso').addEventListener('submit', function(event) {
  event.preventDefault(); // Evitar el envío del formulario por defecto

  //Verificar si el formulario está completo
  if (this.checkValidity()) {
    // Si el formulario es válido, puedes realizar la acción deseada
    alert('Inicio de sesión exitoso');
  // Redirigir a la página de inicio
    window.location.href = "/index.html";
  }
});

document.getElementById('Registro').addEventListener('submit', function(event) {
  event.preventDefault(); // Evitar el envío del formulario por defecto

  //Verificar si el formulario está completo
  if (this.checkValidity()) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password === confirmPassword) {
      alert('Registro exitoso');
      window.location.href = "/index.html";
    } else{
      alert('Las contraseñas no coinciden');
    }
  }
});