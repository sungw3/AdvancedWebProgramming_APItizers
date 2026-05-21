    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        const loginForm = document.querySelector('.needs-validation');
        
        loginForm.addEventListener('submit', function(event) {
            
            // if login form is not valid, stop.
            if (!loginForm.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                loginForm.classList.add('was-validated');
                return;
            }

            // if login form is valid, next step.
            event.preventDefault();
            
            // get the entered ID value. (for demo purposes, we are not validating the password or checking against a database)
            const enteredId = document.getElementById('userId').value;

            // memo the login state and user name in localStorage (for demo purposes, we are not implementing actual authentication)
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', enteredId);

            // redirect to the room list page after successful login
            window.location.href = 'search-room.html'; 
        });
    </script>
