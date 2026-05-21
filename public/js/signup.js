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

const signupForm = document.getElementById('signupForm');
const signupBtn = signupForm.querySelector('button[type="submit"]');
const newIdInput = document.getElementById('newId');
const newPwInput = document.getElementById('newPw');
const confirmPwInput = document.getElementById('confirmPw');

newIdInput.addEventListener('input', function() {
    this.classList.remove('is-valid', 'is-invalid');
    this.setCustomValidity('');
});

newIdInput.addEventListener('blur', async function() {
    const userId = this.value.trim();
    if (userId.length < 4) return;

    try {
        await fetchAPI(`/check-id?id=${userId}`);
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        this.setCustomValidity('');
    } catch (error) {
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        this.setCustomValidity('Already in use');
        const feedbackDiv = this.parentNode.querySelector('.invalid-feedback');
        if (feedbackDiv) feedbackDiv.innerText = 'This ID is already in use.';
    }
});

function checkPasswordMatch() {
    const feedbackDiv = confirmPwInput.parentNode.querySelector('.invalid-feedback');
    
    if (confirmPwInput.value === '') {
        confirmPwInput.setCustomValidity(''); 
        if (feedbackDiv) feedbackDiv.innerText = 'Please confirm your password.';
    } else if (newPwInput.value !== confirmPwInput.value) {
        confirmPwInput.setCustomValidity('Mismatch');
        if (feedbackDiv) feedbackDiv.innerText = 'Passwords do not match. Please try again.';
    } else {
        confirmPwInput.setCustomValidity('');
        if (feedbackDiv) feedbackDiv.innerText = 'Please confirm your password.';
    }
}

newPwInput.addEventListener('input', checkPasswordMatch);
confirmPwInput.addEventListener('input', checkPasswordMatch);

signupForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const feedbackDiv = confirmPwInput.parentNode.querySelector('.invalid-feedback');

    if (newPwInput.value !== confirmPwInput.value) {
        confirmPwInput.setCustomValidity('Mismatch'); 
        if (feedbackDiv) feedbackDiv.innerText = 'Passwords do not match. Please try again.';
    } else {
        confirmPwInput.setCustomValidity(''); 
    }

    if (!signupForm.checkValidity()) {
        event.stopPropagation();
        signupForm.classList.add('was-validated');
        return;
    }

    const newNick = document.getElementById('newNick').value;
    const newId = newIdInput.value;
    const newPw = newPwInput.value;

    signupBtn.disabled = true;
    signupBtn.innerText = 'Processing...';

    try {
        const data = await fetchAPI('/signup', {
            method: 'POST',
            body: JSON.stringify({ nickname: newNick, id: newId, password: newPw })
        });

        showToast('Sign up successful! Please log in.', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);

    } catch (error) {
        showToast('Failed to communicate with the server. Please try again later.', 'error');
    } finally {
        signupBtn.disabled = false;
        signupBtn.innerText = 'Sign Up';
    }
});