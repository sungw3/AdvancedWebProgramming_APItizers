const startChatBtn = document.getElementById('startChatBtn');

if (startChatBtn) {
    startChatBtn.addEventListener('click', function(event) {
        event.preventDefault();
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn) {
            window.location.href = 'search-room.html'; 
        } else {
            window.location.href = 'login.html'; 
        }
    });
}