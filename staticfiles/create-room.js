if (!localStorage.getItem('accessToken')) {
    alert('Please log in first.');
    // 💡 장고 로그인 정식 경로로 수정
    window.location.replace('/api/login/');
}

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('appToast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toastEl || !toastMessage) return;
    toastMessage.innerText = message;
    toastEl.className = type === 'error' 
        ? 'toast align-items-center text-bg-danger border-0' 
        : 'toast align-items-center text-bg-success border-0';
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, function (tag) {
        const charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
        return charsToReplace[tag] || tag;
    });
}

const rangeInput = document.getElementById('maxParticipants');
const rangeValue = document.getElementById('rangeValue');

if (rangeInput && rangeValue) {
    rangeInput.addEventListener('input', function () {
        rangeValue.innerText = this.value;
    });
}

const privateSwitch = document.getElementById('privateSwitch');
const passwordArea = document.getElementById('password-area');
const roomPassword = document.getElementById('roomPassword');

if (privateSwitch) {
    privateSwitch.addEventListener('change', function () {
        if (this.checked) {
            if (passwordArea) passwordArea.style.display = 'block';
            if (roomPassword) roomPassword.setAttribute('required', 'true');
        } else {
            if (passwordArea) passwordArea.style.display = 'none';
            if (roomPassword) roomPassword.removeAttribute('required');
        }
    });
}

window.addEventListener('pageshow', function () {
    if (privateSwitch && privateSwitch.checked) {
        if (passwordArea) passwordArea.style.display = 'block';
        if (roomPassword) roomPassword.setAttribute('required', 'true');
    } else {
        if (passwordArea) passwordArea.style.display = 'none';
        if (roomPassword) roomPassword.removeAttribute('required');
    }
    if (rangeInput && rangeValue) rangeValue.innerText = rangeInput.value;
});

const form = document.getElementById('createRoomForm');
const createBtn = document.getElementById('createBtn');

if (form) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        createBtn.disabled = true;
        createBtn.innerText = 'Creating...';

        const isPrivateRoom = privateSwitch ? privateSwitch.checked : false;
        
        const roomData = {
            title: document.getElementById('roomTitle').value.trim(),
            subtitle: document.getElementById('roomSubtitle').value.trim(),
            maxParticipants: parseInt(rangeInput.value, 10),
            isPrivate: isPrivateRoom,
            password: isPrivateRoom ? roomPassword.value : null
        };

        try {
            const result = await fetchAPI('/rooms', {
                method: 'POST',
                body: JSON.stringify(roomData)
            });

            showToast('Room created successfully!', 'success');
            
            setTimeout(() => {
                const urlSafeTitle = escapeHTML(encodeURIComponent(roomData.title));
                // 💡 HTML 주소창 파라미터 맵핑 방식 대신 장고의 실제 라우팅 주소 체계인 /chat/룸ID/ 주소로 다이렉트 랜딩
                window.location.href = `/chat/${result.roomId}/?title=${urlSafeTitle}`;
            }, 1000);

        } catch (error) {
            showToast(error.message || 'Failed to create room. Please try again.', 'error');
        } finally {
            createBtn.disabled = false;
            createBtn.innerText = 'Create & Enter';
        }
    });
}