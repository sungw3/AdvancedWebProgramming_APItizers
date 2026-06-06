const token = localStorage.getItem('accessToken');
const myName = localStorage.getItem('userName');

if (!token || !myName) {
    alert("Please log in first!");
    window.location.replace('login.html');
}

const urlParams = new URLSearchParams(window.location.search);
let roomId = urlParams.get('roomId') || 'test_room';
let roomTitle = urlParams.get('title') || 'test room';

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host;
const wsUrl = `${protocol}//${host}/ws/chat/${roomId}/?token=${token}`;
const API_BASE_URL = `${window.location.protocol}//${host}/api`;

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('appToast');
    const toastMessage = document.getElementById('toastMessage');
    if(!toastEl || !toastMessage) return;
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

function timeSince(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "year ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "month ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "day ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "hour ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "minute ago";
    return "just now";
}

if (roomTitle) {
    document.getElementById('room-title').innerText = escapeHTML(roomTitle);
}

const chatContainer = document.getElementById('chatContainer');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

let socket;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT = 5;

async function checkRoomBeforeJoin() {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            alert("방 정보를 불러올 수 없습니다.");
            window.location.href = 'search-room.html';
            return false;
        }

        const data = await response.json();
        const currentOnlineUsers = data.onlineCount ?? (data.users ? data.users.length : 0);
        const maxUsers = data.maxParticipants || 6;

        if (currentOnlineUsers >= maxUsers) {
            alert("방이 가득 찼습니다. 입장할 수 없습니다.");
            window.location.href = 'search-room.html';
            return false;
        }

        return true;
    } catch (error) {
        alert("방 정보를 확인하는 중 오류가 발생했습니다.");
        window.location.href = 'search-room.html';
        return false;
    }
}

function connectWebSocket() {
    try {
        socket = new WebSocket(wsUrl);

        socket.onopen = function () {
            isConnected = true;
            reconnectAttempts = 0;
            document.getElementById('loadingChat').innerText = 'Connected! Ready to chat.';
            setTimeout(() => { document.getElementById('loadingChat').style.display = 'none'; }, 1000);

            fetchRoomInitialData();
        };

        socket.onmessage = function (event) {
            const data = JSON.parse(event.data);
            if (data.message) {
                const chatData = {
                    senderName: data.username,
                    message: data.message,
                    emotion: data.emotion || 'neutral'
                };
                renderChatMessage(chatData);
            }
        };

        socket.onclose = function (event) {
            isConnected = false;

            if (event.reason === "Room is full") {
                alert("방이 가득 찼습니다. 입장할 수 없습니다.");
                window.location.href = 'search-room.html';
                return;
            }

            if (reconnectAttempts < MAX_RECONNECT) {
                reconnectAttempts++;
                showToast(`Disconnected. Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT})`, 'error');
                setTimeout(connectWebSocket, 3000);
            } else {
                showToast('Connection permanently lost. Please refresh the page.', 'error');
            }
        };

        socket.onerror = function (error) {
            console.error('WebSocket Error:', error);
        };
    } catch (e) {
        showToast('WebSocket initialization failed.', 'error');
    }
}

function renderChatMessage(data) {
    const isMe = data.senderName === myName;
    const safeText = escapeHTML(data.message);
    const safeSender = escapeHTML(data.senderName);

    let rawEmotion = data.emotion || 'neutral';
    const emotionClass = rawEmotion.startsWith('emotion_') 
        ? rawEmotion 
        : `emotion_${rawEmotion.toLowerCase()}`;

    const messageHtml = `
        <div class="message-row ${isMe ? 'me' : 'other'}">
            <div>
                ${!isMe ? `<span class="sender-name">${safeSender}</span>` : ''}
                <div class="bubble ${emotionClass}">
                    ${safeText}
                </div>
            </div>
        </div>
    `;

    const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 50;
    chatContainer.insertAdjacentHTML('beforeend', messageHtml);
    
    if (isAtBottom || isMe) {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    }
}

function renderUserList(users) {
    const sidebarContainer = document.getElementById('online-members');
    document.getElementById('memberCount').innerText = users.length;

    let onlineHtml = `<small class="text-uppercase fw-bold text-muted d-block mb-2">Online</small>`;
    let offlineHtml = `<div class="mt-4"><small class="text-uppercase fw-bold text-muted d-block mb-2">Offline</small>`;

    users.forEach(user => {
        const safeName = escapeHTML(user.name);
        const isMe = user.name === myName ? ' (Me)' : '';
        const displayName = `<span class="${isMe ? 'fw-bold' : ''}">${safeName}${isMe}</span>`;

        if (user.isOnline) {
            onlineHtml += `
                <div class="d-flex align-items-center mb-2">
                    <span class="status-dot online-dot"></span> ${displayName}
                </div>
            `;
        } else {
            const timeString = timeSince(user.lastSeen);
            offlineHtml += `
                <div class="d-flex align-items-center mb-2">
                    <span class="status-dot offline-dot"></span> <span class="text-muted">${displayName}</span>
                    <span class="last-seen ms-auto">${timeString}</span>
                </div>
            `;
        }
    });

    offlineHtml += `</div>`;

    if (sidebarContainer) sidebarContainer.innerHTML = onlineHtml + offlineHtml;
    const mobileSidebarContainer = document.querySelector('#userListOffcanvas .offcanvas-body');
    if (mobileSidebarContainer) mobileSidebarContainer.innerHTML = onlineHtml + offlineHtml;
}

chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !isConnected) return;

    const payload = { message: text, username: myName };
    socket.send(JSON.stringify(payload));
    messageInput.value = '';
    messageInput.focus();
});

async function fetchRoomInitialData() {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load room data');
        
        const data = await response.json();
        const isHost = data.hostName === myName;

        // 방장 여부에 따라 UI 제어
        if (isHost) {
            document.getElementById('hostSettingsMenu').style.display = 'block';
            document.getElementById('leaveRoomBtn').style.display = 'none';
        } else {
            document.getElementById('hostSettingsMenu').style.display = 'none';
            document.getElementById('leaveRoomBtn').style.display = 'block';
        }

        if (data.users) renderUserList(data.users);
        if (data.messages) {
            data.messages.forEach(msg => renderChatMessage(msg));
        }
    } catch (error) {
        console.error(error);
        showToast('Error loading room data.', 'error');
    }
}

// 방 나가기 버튼
document.getElementById('leaveRoomBtn')?.addEventListener('click', async () => {
    if (!confirm("정말로 이 방에서 나가시겠습니까?")) return;

    try {
        if (socket && isConnected) {
            socket.close();
        }

        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/leave/`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert("방에서 나왔습니다.");
            window.location.replace('search-room.html');
        } else {
            showToast('방 나가기에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('방 나가기 중 오류가 발생했습니다.', 'error');
    }
});

document.getElementById('deleteRoomBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    if(!confirm("Warning: Deleting the room will remove all data. Are you sure you want to delete it?")) return;

    try {
        if (socket && isConnected) socket.close();

        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Room deleted successfully.');
            window.location.replace('search-room.html');
        } else {
            showToast('You do not have permission to delete the room or an error occurred.', 'error');
        }
    } catch (error) {
        console.error(error);
    }
});

document.getElementById('delegateHostBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const newHostName = prompt("Enter the nickname of the user you want to delegate host privileges to:");
    if (!newHostName || newHostName === myName) return;

    try {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/delegate/`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ new_host: newHostName })
        });

        if (response.ok) {
            showToast(`${newHostName}에게 방장 권한을 위임했습니다.`);
            document.getElementById('hostSettingsMenu').style.display = 'none';
            await fetchRoomInitialData();
        } else {
            const errorData = await response.json().catch(() => ({}));
            showToast(errorData.detail || '방장 위임에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('방장 위임 중 오류가 발생했습니다.', 'error');
    }
});

window.addEventListener('beforeunload', function () {
    if (socket && isConnected) {
        socket.close();
    }
});

(() => {
    const themeBtn = document.querySelector('.theme-toggle-btn');
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem('chatBackgroundTheme');
    if (savedTheme === 'alt-theme') {
        document.body.classList.add('bg-theme-alt');
    }

    themeBtn.addEventListener('click', () => {
        const isAltTheme = document.body.classList.toggle('bg-theme-alt');
        if (isAltTheme) {
            localStorage.setItem('chatBackgroundTheme', 'alt-theme');
        } else {
            localStorage.removeItem('chatBackgroundTheme');
        }
    });
})();

checkRoomBeforeJoin().then(canJoin => {
    if (canJoin) {
        connectWebSocket();
    }
});