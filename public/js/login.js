const loginForm = document.querySelector('.needs-validation');

loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!loginForm.checkValidity()) {
        event.stopPropagation();
        loginForm.classList.add('was-validated');
        return;
    }

    const enteredId = document.getElementById('userId').value;
    const enteredPw = document.getElementById('userPw').value;

    try {
        const data = await fetchAPI('/login', {
            method: 'POST',
            body: JSON.stringify({
                id: enteredId,
                password: enteredPw
            })
        });

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('accessToken', data.token); // token from server
        localStorage.setItem('userName', data.userName); // userName from server

        alert(`${data.userName}, welcome!`);
        window.location.href = 'room-list.html'; // go room list page

    } catch (error) {
        console.error('login error:', error);
        alert('wrong ID or Password or server error.');
        document.getElementById('userPw').value = '';
    }
});