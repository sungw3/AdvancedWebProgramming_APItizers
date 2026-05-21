

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
    return String(str).replace(/[&<>'"]/g, function(tag) {
        const charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
        return charsToReplace[tag] || tag;
    });
}


if (roomTitle) {
    document.getElementById('room-title').innerText = escapeHTML(roomTitle);
}
const myName = localStorage.getItem('userName') || 'Me';
const mySidebarName = document.getElementById('my-sidebar-name');
if (mySidebarName) mySidebarName.innerText = escapeHTML(myName) + ' (Me)';

const chatContainer = document.getElementById('chatContainer');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');


async function loadChatHistory() {
    try {
        // await fetchAPI(`/rooms/${roomId}/messages`);
        await new Promise(resolve => setTimeout(resolve, 800)); // demo loading
        
        chatContainer.innerHTML = "";

        const welcomeMessage = `
            <div class="message-row other">
                <div>
                    <span class="sender-name">System</span>
                    <div class="bubble emotion_happy">
                        Welcome to the room! Let's chat with emotion.
                    </div>
                </div>
            </div>
        `;
        chatContainer.insertAdjacentHTML('beforeend', welcomeMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (error) {
        showToast('Failed to load chat history.', 'error');
    }
}
loadChatHistory();


chatForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    const safeText = escapeHTML(text);
    
    messageInput.value = '';
    sendBtn.disabled = true;

    try {
        /*
        const response = await fetchAPI(`/rooms/${roomId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message: safeText })
        });
        const emotionClass = response.emotion; // 서버의 AI가 분석해준 감정 클래스
        */

        // code for demo
        await new Promise(resolve => setTimeout(resolve, 300));
        const emotions = ['emotion_happy', 'emotion_sad', 'emotion_angry', 'emotion_fear', 'emotion_surprise', 'emotion_neutral'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];

        const newMessage = `
            <div class="message-row me">
                <div class="bubble ${randomEmotion}">
                    ${safeText}
                </div>
            </div>
        `;

        chatContainer.insertAdjacentHTML('beforeend', newMessage);
        
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });

    } catch (error) {
        showToast('Failed to send message.', 'error');
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
});
