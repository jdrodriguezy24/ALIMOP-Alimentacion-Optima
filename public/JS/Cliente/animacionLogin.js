document.addEventListener('DOMContentLoaded', () =>{
    // Elementos para animar
    const form = document.querySelector('.login-form');
    const inputs = document.querySelectorAll('.form-group');
    const title = document.querySelector('h2');
    const description = document.querySelector('.form-description');

    // timeline para la secuencia de la animacion
    const tl = gsap.timeline({defaults: {ease: 'power2.out'}});

    // Secuencia de las animaciones
    tl.from(title, {
        y: -50,
        opacity:0,
        duration: 0.8
    })

    .from(description, {
        y: -20,
        opacity: 0,
        duration: 0.5
    }, '-=0.3')

    .from(inputs, {
        y: 20,
        opacity: 0,
        stagger: 0.2,
        duration: 0.5
    }, '-=0.2');

    // Animacion de input al focus
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            gsap.to(input, {
                scale: 1.02,
                duration: 0.3
            });
        });

        input.addEventListener('blur', () => {
            gsap.to(input, {
                scale: 1,
                duration: 0.3
            });
        });
    });

    // Animacion para el boton de login
    const submitBtn = document.querySelector('.btn-registro');

    submitBtn.addEventListener('mouseenter', () => {
        gsap.to(submitBtn, {
            scale: 1.05,
            duration: 0.3
        });
    });

    submitBtn.addEventListener('mouseleave', () => {
        gsap.to(submitBtn, {
            scale: 1,
            duration: 0.3
        });
    });

    // Validación para el formulario con animacion de error
    form.addEventListener('submit', (e) => {
        const inputs = form.querySelectorAll('input');
        let esValido = true;

        inputs.forEach(input => {
            if(!input.value){
                esValido = false;
                gsap.to(input, {
                    x: [-10, 10, -10, 10, 0],
                    duration: 0.4,
                    backgroundColor: 'rgba(255, 0, 0, 0.1)'
                });
            }
        });

        if(!esValido){
            e.preventDefault();
        }
    });
});