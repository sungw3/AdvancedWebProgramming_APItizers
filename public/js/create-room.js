

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

const rangeInput = document.getElementById('maxParticipants');
const rangeValue = document.getElementById('rangeValue');

rangeInput.addEventListener('input', function () {
    rangeValue.innerText = this.value;
});

const privateSwitch = document.getElementById('privateSwitch');
const passwordArea = document.getElementById('password-area');
const roomPassword = document.getElementById('roomPassword');

privateSwitch.addEventListener('change', function () {
    if (this.checked) {
        passwordArea.style.display = 'block';
        roomPassword.setAttribute('required', 'true');
    } else {
        passwordArea.style.display = 'none';
        roomPassword.removeAttribute('required');
        roomPassword.value = "";
    }
});

window.addEventListener('pageshow', function () {
    if (privateSwitch.checked) {
        passwordArea.style.display = 'block';
        roomPassword.setAttribute('required', 'true');
    } else {
        passwordArea.style.display = 'none';
        roomPassword.removeAttribute('required');
    }
    rangeValue.innerText = rangeInput.value;
});

const form = document.getElementById('createRoomForm');
const createBtn = document.getElementById('createBtn');

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    createBtn.disabled = true;
    createBtn.innerText = 'Creating...';

    const roomData = {
        title: document.getElementById('roomTitle').value.trim(),
        subtitle: document.getElementById('roomSubtitle').value.trim(),
        maxParticipants: parseInt(document.getElementById('maxParticipants').value, 10),
        isPrivate: document.getElementById('privateSwitch').checked,
        password: document.getElementById('privateSwitch').checked ? document.getElementById('roomPassword').value : null
    };

    try {
        const result = await fetchAPI('/rooms', {
            method: 'POST',
            body: JSON.stringify(roomData)
        });

        showToast('Room created successfully!', 'success');
        
        setTimeout(() => {
            const urlSafeTitle = encodeURIComponent(roomData.title);
            location.href = `chat-room.html?roomId=${result.roomId}&title=${urlSafeTitle}`;
        }, 1000);

    } catch (error) {
       showToast(error.message || 'Failed to create room. Please try again.', 'error');
    } finally {

        createBtn.disabled = false;
        createBtn.innerText = 'Create & Enter';
    }
});
