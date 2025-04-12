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