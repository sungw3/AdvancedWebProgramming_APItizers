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

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const roomData = {
        title: document.getElementById('roomTitle').value,
        subtitle: document.getElementById('roomSubtitle').value,
        maxParticipants: document.getElementById('maxParticipants').value,
        isPrivate: document.getElementById('privateSwitch').checked,
        password: document.getElementById('privateSwitch').checked ? document.getElementById('roomPassword').value : null
    };

    try {
        const response = await fetch('https://server/api/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(roomData)
        });

        if (response.ok) {
            const result = await response.json();
            alert('Room created! Moving to chat room.');
            location.href = `chat.html?roomId=${result.roomId}`;
        } else {
            alert('Failed to create room. Please try again.');
        }

    } catch (error) {
        console.error('Server communication error:', error);
        // Test purpose when server is not available
        alert('[test] Server not available, moving to chat room.');
        location.href = 'chat.html';
    }
});