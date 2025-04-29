const btnMenu = document.getElementById("btnMenu");
        const menuDesplegable = document.getElementById("menuDesplegable");
    
        btnMenu.addEventListener("click", () => {
            if (menuDesplegable.style.display === "block") {
                menuDesplegable.style.display = "none";
            } else {
                menuDesplegable.style.display = "block";
            }
        });