/*
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('appToast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.innerText = message;
    toastEl.className = type === 'error' 
        ? 'toast align-items-center text-bg-danger border-0' 
        : 'toast align-items-center text-bg-success border-0';
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!loginForm.checkValidity()) {
        event.stopPropagation();
        loginForm.classList.add('was-validated');
        return;
    }

    const enteredId = document.getElementById('userId').value;
    const enteredPw = document.getElementById('userPw').value;

    loginBtn.disabled = true;
    loginBtn.innerText = 'Loading...';

    try {
        const data = await fetchAPI('/login', {
            method: 'POST',
            body: JSON.stringify({ id: enteredId, password: enteredPw })
        });
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('userName', data.userName);

        showToast(`Welcome, ${data.userName}!`, 'success');
        setTimeout(() => {
            window.location.href = 'room-list.html';
        }, 1000);

    } catch (error) {
        showToast('Login failed. Please check your ID and password.', 'error');
        document.getElementById('userPw').value = '';
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerText = 'Enter';
    }
});
*/
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
