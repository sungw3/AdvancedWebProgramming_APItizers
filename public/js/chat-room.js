const token = localStorage.getItem('accessToken');
if (!token) {
    alert("Please log in first!");
    window.location.replace('login.html');
}

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('roomId');
const roomTitle = urlParams.get('title');

if (!roomId) {
    alert("Invalid room approach.");
    window.location.replace('search-room.html');
}

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

// switch
// here
const USE_MOCK_SERVER = true; 

class MockWebSocket {
    constructor(url) {
        console.log(`[Mock Server] connecting: ${url}`);
        
        setTimeout(() => {
            if (this.onopen) this.onopen();
        }, 500);

        this.botInterval = setInterval(() => {
            if (this.onmessage) {
                const randomMsg = [
                    "hi", 
                    "good", 
                    "wow", 
                    "no"
                ];
                const randomEmotion = ['emotion_happy', 'emotion_surprise', 'emotion_neutral', 'emotion_fear'];
                this.onmessage({
                    data: JSON.stringify({
                        username: "bot",
                        message: randomMsg[Math.floor(Math.random() * randomMsg.length)],
                        emotion: randomEmotion[Math.floor(Math.random() * randomEmotion.length)]
                    })
                });
            }
        }, 1000);
    }

    send(dataStr) {
        const parsedData = JSON.parse(dataStr);
        
        setTimeout(() => {
            if (this.onmessage) {
                const randomEmotion = ['emotion_happy', 'emotion_sad', 'emotion_angry', 'emotion_fear', 'emotion_surprise', 'emotion_neutral', 'emotion_disgust'];
                this.onmessage({
                    data: JSON.stringify({
                        username: parsedData.username,
                        message: parsedData.message,
                        emotion: randomEmotion[Math.floor(Math.random() * randomEmotion.length)]
                    })
                });
            }
        }, 300);
    }
    
    close() {
        clearInterval(this.botInterval);
        if (this.onclose) this.onclose();
    }
}

function connectWebSocket() {
    const wsUrl = `ws://127.0.0.1:8000/ws/chat/${roomId}/?token=${token}`;
    
    try {
        if (USE_MOCK_SERVER) {
            socket = new MockWebSocket(wsUrl);
        } else {
            socket = new WebSocket(wsUrl);
        }

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
