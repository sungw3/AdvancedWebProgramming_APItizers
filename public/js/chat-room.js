if (!localStorage.getItem('accessToken')) {
    localStorage.setItem('accessToken', 'mock_token_123');
    localStorage.setItem('userName', 'me');
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
    return String(str).replace(/[&<>'"]/g, function(tag) {
        const charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
        return charsToReplace[tag] || tag;
    });
}

document.getElementById('room-title').innerText = escapeHTML(roomTitle);
const chatContainer = document.getElementById('chatContainer');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const myName = localStorage.getItem('userName');


// ==================
// Mock Server
// ==================
class MockWebSocket {
    constructor() {
        console.log("[Mock Server].");
        
        setTimeout(() => {
            if (this.onopen) this.onopen();
        }, 500);

        this.botInterval = setInterval(() => {
            if (this.onmessage) {
                const randomMsg = [
                    "good", 
                    "hi", 
                    "nice", 
                    "no"
                ];
                const randomEmotion = ['emotion_happy', 'emotion_surprise', 'emotion_neutral', 'emotion_sad'];
                
                this.onmessage({
                    data: JSON.stringify({
                        username: "bot",
                        message: randomMsg[Math.floor(Math.random() * randomMsg.length)],
                        emotion: randomEmotion[Math.floor(Math.random() * randomEmotion.length)]
                    })
                });
            }
        }, 5000);
    }

    send(dataStr) {
        const parsedData = JSON.parse(dataStr);
        const text = parsedData.message;
        
        setTimeout(() => {
            if (this.onmessage) {
                let emotionClass = 'emotion_neutral';
                if (text.includes('good')) emotionClass = 'emotion_happy';
                else if (text.includes('sorrow')) emotionClass = 'emotion_sad';
                else if (text.includes('mad')) emotionClass = 'emotion_angry';
                else if (text.includes('scary')) emotionClass = 'emotion_fear';
                else if (text.includes('wow')) emotionClass = 'emotion_surprise';
                else if (text.includes('no') || text.includes('no')) emotionClass = 'emotion_disgust';

                this.onmessage({
                    data: JSON.stringify({
                        username: parsedData.username,
                        message: text,
                        emotion: emotionClass
                    })
                });
            }
        }, 300);
    }
}

let socket;
let isConnected = false;

function connectWebSocket() {
    socket = new MockWebSocket();

    socket.onopen = function () {
        isConnected = true;
        const loadingEl = document.getElementById('loadingChat');
        if(loadingEl) {
            loadingEl.innerText = 'Connected! Ready to chat.';
            setTimeout(() => { loadingEl.style.display = 'none'; }, 800);
        }
    };

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.message) {
            const isMe = data.username === myName;
            const safeText = escapeHTML(data.message);
            const safeSender = escapeHTML(data.username);
            const emotionClass = escapeHTML(data.emotion);

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
    };
}

chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !isConnected) return;

    socket.send(JSON.stringify({
        message: text,
        username: myName
    }));
    
    messageInput.value = '';
    messageInput.focus();
});

connectWebSocket();
