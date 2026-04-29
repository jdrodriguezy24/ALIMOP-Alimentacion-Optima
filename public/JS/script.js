document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const inputId = this.getAttribute('data-target');
        const input = document.getElementById(inputId);
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    });
});