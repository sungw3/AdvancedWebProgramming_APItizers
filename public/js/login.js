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

    // Disable button before sending the request to prevent double-clicking
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

        alert(`Welcome, ${data.userName}!`);
        window.location.href = 'room-list.html';

    } catch (error) {
        // Display the error message thrown from api.js to the user
        alert(error.message || 'Login failed. Please check your ID and password.');
        document.getElementById('userPw').value = ''; // Clear the password field only
    } finally {
        // Restore the button state regardless of success or failure
        loginBtn.disabled = false;
        loginBtn.innerText = 'Enter';
    }
});