const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!signupForm.checkValidity()) {
        event.stopPropagation();
        signupForm.classList.add('was-validated');
        return;
    }

    const newNick = document.getElementById('newNick').value;
    const newId = document.getElementById('newId').value;
    const newPw = document.getElementById('newPw').value;
    const confirmPw = document.getElementById('confirmPw').value;

    if (newPw !== confirmPw) {
        alert('Passwords do not match. Please try again.');
        document.getElementById('confirmPw').focus();
        return;
    }

    try {

        const data = await fetchAPI('/signup', {
            method: 'POST',
            body: JSON.stringify({
                nickname: newNick,
                id: newId,
                password: newPw
            })
        });

        console.log('Signup attempt:', { id: newId, nickname: newNick });
        alert('Signup successful! Please login.');
        window.location.href = 'login.html';

    } catch (error) {
        console.error('Communication error:', error);
        alert('Cannot connect to the server. Please try again later.');
    }
});