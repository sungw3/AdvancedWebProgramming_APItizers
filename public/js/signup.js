const signupForm = document.getElementById('signupForm');
const signupBtn = signupForm.querySelector('button[type="submit"]');
const newIdInput = document.getElementById('newId');

//Check for duplicate ID when the input loses focus
newIdInput.addEventListener('blur', async function() {
    const userId = this.value.trim();
    if (userId.length < 4) return; // Skip server request if the ID is too short

    try {
        // Assuming the backend has an endpoint like /check-id
        await fetchAPI(`/check-id?id=${userId}`);
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
    } catch (error) {
        alert('This ID is already in use.');
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        this.value = '';
    }
});

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

    signupBtn.disabled = true;
    signupBtn.innerText = 'Processing...';

    try {
        const data = await fetchAPI('/signup', {
            method: 'POST',
            body: JSON.stringify({ nickname: newNick, id: newId, password: newPw })
        });

        alert('Sign up successful! Please log in.');
        window.location.href = 'login.html';

    } catch (error) {
        alert(error.message || 'Failed to communicate with the server. Please try again later.');
    } finally {
        signupBtn.disabled = false;
        signupBtn.innerText = 'Sign Up';
    }
});