const startChatBtn = document.getElementById('startChatBtn');

if (startChatBtn) {
    startChatBtn.addEventListener('click', function(event) {
        event.preventDefault();

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (isLoggedIn) {
            // 로그인 되어 있으면 search-room 화면으로 이동
            window.location.href = '/chat/';
        } else {
            // 로그인 안 되어 있으면 로그인 화면으로 이동
            window.location.href = '/api/login/';
        }
    });
}