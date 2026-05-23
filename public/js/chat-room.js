const token = localStorage.getItem('accessToken');
if (!token) {
    alert("Please log in first!");
    window.location.replace('login.html');
}

const urlParams = new URLSearchParams(window.location.search);
let roomId = urlParams.get('roomId') || 'test_room';
let roomTitle = urlParams.get('title') || 'test room';

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
const myName = localStorage.getItem('userName');


// ==============
//   WEB SOCKET
// ==============
let socket;
let isConnected = false;

function connectWebSocket() {
    isConnected = true;

    const loadingEl = document.getElementById('loadingChat');
    if (loadingEl) {
        loadingEl.innerText = 'Mock Connected! Ready to chat.';
        setTimeout(() => { loadingEl.style.display = 'none'; }, 1000);
    }

    socket = {
        send: function (dataString) {
            const parsedData = JSON.parse(dataString);
            
            renderChatMessage({
                senderName: parsedData.username,
                message: parsedData.message,
                emotion: 'emotion_neutral'
            });

            setTimeout(() => {
                renderChatMessage({
                    senderName: '가짜',
                    message: '프론트엔드 UI 테스트 중이시군요! 아주 잘 작동합니다.',
                    emotion: 'emotion_happy'
                });
            }, 1000);
        }
    };
    setTimeout(() => {
        renderChatMessage({
            senderName: 'System',
            message: 'front end testing chatting room.',
            emotion: 'emotion_neutral'
        });

        renderUserList([
            { name: myName, isOnline: true, lastSeen: new Date().toISOString() },
            { name: '가짜 유저', isOnline: true, lastSeen: new Date().toISOString() },
            { name: '오프라인 유저', isOnline: false, lastSeen: new Date(Date.now() - 3600000).toISOString() }
        ]);
    }, 500);
}
/*
function connectWebSocket() {
    // The URL is server domain..?!
    // Send access token as query parameter for authentication
    const wsUrl = `ws://127.0.0.1:8000/ws/chat/${roomId}/?token=${token}`;

    try {
        socket = new WebSocket(wsUrl);

        socket.onopen = function () {
            isConnected = true;
            document.getElementById('loadingChat').innerText = 'Connected! Ready to chat.';
            setTimeout(() => { document.getElementById('loadingChat').style.display = 'none'; }, 1000);
        };

        socket.onmessage = function (event) {
            const data = JSON.parse(event.data);

            if (data.message) {

                const chatData = {
                    senderName: data.username,
                    message: data.message,
                    // If emotion is not provided by backend, default to neutral color
                    emotion: data.emotion || 'emotion_neutral'
                };

                renderChatMessage(chatData);
            }
        };

        socket.onclose = function () {
            isConnected = false;
            showToast('Disconnected from server. Reconnecting...', 'error');
            setTimeout(connectWebSocket, 3000);
        };

        socket.onerror = function (error) {
            console.error('WebSocket Error:', error);
        };

    } catch (e) {
        showToast('WebSocket initialization failed.', 'error');
    }
}
*/

function renderChatMessage(data) {
    // api { senderId: "user_ex1", senderName: "User 1", message: "안녕", emotion: "emotion_happy" }
    const isMe = data.senderName === myName;
    const safeText = escapeHTML(data.message);
    const safeSender = escapeHTML(data.senderName);
    const emotionClass = escapeHTML(data.emotion) || 'emotion_neutral';

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

    chatContainer.insertAdjacentHTML('beforeend', messageHtml);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
}


function renderUserList(users) {
    // api [{ name: "User 1", isOnline: true, lastSeen: "2024-03-10T12:00:00Z" }, ...]
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

    const payload = {
        message: text,
        username: myName
    };
    socket.send(JSON.stringify(payload));

    messageInput.value = '';
    messageInput.focus();
});

connectWebSocket();
