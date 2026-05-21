        const urlParams = new URLSearchParams(window.location.search);
        const roomTitle = urlParams.get('title');


        if (roomTitle) {
            // change the room title of the room
            document.querySelector('#room-title').innerText = roomTitle;
        }


        // handle chat form submission and add new message to the chat container
        const chatForm = document.getElementById('chatForm');
        const messageInput = document.getElementById('messageInput');
        const chatContainer = document.getElementById('chatContainer');

        // scroll should be at the bottom when the page loads.
        chatContainer.scrollTop = chatContainer.scrollHeight;

        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const text = messageInput.value.trim();
            if(!text) return;

            // send the message text to server
            // get the corresponding color.
            const newMessage = `
                <div class="message-row me">
                    <div class="bubble emotion_surprise">
                        ${text}
                    </div>
                </div>
            `;
            
            chatContainer.insertAdjacentHTML('beforeend', newMessage);
            messageInput.value = '';
            
            // scroll down after adding new message.
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        });
