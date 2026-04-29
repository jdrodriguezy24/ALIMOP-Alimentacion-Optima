document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form');
    const inputs = document.querySelectorAll('.form-group');
    const title = document.querySelector('.card-title');
    const description = document.querySelector('.form-description');
    const submitBtn = document.querySelector('.btn-login');

    if (!form || !title) return;

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // Animación inicial
    tl.from(title, {
        y: -30,
        opacity: 0,
        duration: 0.6
    })
    .from(description, {
        y: -15,
        opacity: 0,
        duration: 0.4
    }, '-=0.2')
    .from(inputs, {
        y: 20,
        opacity: 0,
        stagger: 0.15,
        duration: 0.5
    }, '-=0.2');

    // Animación de inputs al focus
    inputs.forEach(input => {
        const field = input.querySelector('.form-control');
        
        if (field) {
            field.addEventListener('focus', () => {
                gsap.to(input, {
                    scale: 1.02,
                    duration: 0.3
                });
            });

            field.addEventListener('blur', () => {
                gsap.to(input, {
                    scale: 1,
                    duration: 0.3
                });
            });
        }
    });

    // Animación del botón
    if (submitBtn) {
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
    }

    // Validación con animación
    form.addEventListener('submit', (e) => {
        const formInputs = form.querySelectorAll('input');
        let esValido = true;

        formInputs.forEach(input => {
            if (!input.value.trim()) {
                esValido = false;
                gsap.to(input, {
                    x: [-10, 10, -10, 10, 0],
                    duration: 0.4,
                    backgroundColor: 'rgba(255, 0, 0, 0.1)'
                });
            }
        });

        if (!esValido) {
            e.preventDefault();
        }
    });
});