// 1. 🎯 [해결] 로그인 체크 방어막 형성
// 메인 페이지(index)에서는 로그인 안 해도 비둘기처럼 볼 수 있도록, 
// 현재 주소가 방 생성(/create/) 등 권한이 필요한 곳일 때만 작동하게 가두거나 장고 주소로 매핑합니다.
const currentUrlPath = window.location.pathname;
if (!localStorage.getItem('accessToken') && (currentUrlPath.includes('/create/') || currentUrlPath.includes('/room/'))) {
    alert('Please log in first.');
    window.location.replace('/api/login/'); 
}

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('appToast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toastEl || !toastMessage) return; // 💡 태그가 없을 때 에러 방지
    
    toastMessage.innerText = message;
    toastEl.className = type === 'error' 
        ? 'toast align-items-center text-bg-danger border-0' 
        : 'toast align-items-center text-bg-success border-0';
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

// 2. 🎯 [해결] 메인 페이지에 방 생성 폼이 없어도 에러 나서 멈추지 않도록 무조건 if문 처리
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

if (privateSwitch && passwordArea && roomPassword) {
    privateSwitch.addEventListener('change', function () {
        if (this.checked) {
            passwordArea.style.display = 'block';
            roomPassword.setAttribute('required', 'true');
        } else {
            passwordArea.style.display = 'none';
            roomPassword.removeAttribute('required');
        }
    });
}

window.addEventListener('pageshow', function () {
    if (privateSwitch && passwordArea && roomPassword && rangeInput && rangeValue) {
        if (privateSwitch.checked) {
            passwordArea.style.display = 'block';
            roomPassword.setAttribute('required', 'true');
        } else {
            passwordArea.style.display = 'none';
            roomPassword.removeAttribute('required');
        }
        rangeValue.innerText = rangeInput.value;
    }
});

const form = document.getElementById('createRoomForm');
const createBtn = document.getElementById('createBtn');

if (form && createBtn) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        createBtn.disabled = true;
        createBtn.innerText = 'Creating...';

        const isPrivateRoom = document.getElementById('privateSwitch').checked;
        
        const roomData = {
            title: document.getElementById('roomTitle').value.trim(),
            subtitle: document.getElementById('roomSubtitle').value.trim(),
            maxParticipants: parseInt(document.getElementById('maxParticipants').value, 10),
            isPrivate: isPrivateRoom,
            password: isPrivateRoom ? document.getElementById('roomPassword').value : null
        };

        try {
            // fetchAPI가 정의되어 있다면 연동
            const result = await fetchAPI('/rooms', {
                method: 'POST',
                body: JSON.stringify(roomData)
            });

            showToast('Room created successfully!', 'success');
            
            setTimeout(() => {
                const urlSafeTitle = encodeURIComponent(roomData.title);
                location.href = `/chat/room/${result.roomId}?title=${urlSafeTitle}`; 
            }, 1000);

        } catch (error) {
            showToast(error.message || 'Failed to create room. Please try again.', 'error');
        } finally {
            createBtn.disabled = false;
            createBtn.innerText = 'Create & Enter';
        }
    });
}