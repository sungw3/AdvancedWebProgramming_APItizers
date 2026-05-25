document.addEventListener("DOMContentLoaded", function () {
    const startChatBtn = document.getElementById('startChatBtn');

    if (startChatBtn) {
        startChatBtn.addEventListener('click', function(event) {
            event.preventDefault();

            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (isLoggedIn) {
                // 💡 로그인 되어 있으면 장고 방 목록 뷰 경로로 이동
                window.location.href = '/chat/';
            } else {
                // 💡 로그인 안 되어 있으면 장고 로그인 뷰 경로로 이동
                window.location.href = '/api/login/';
            }
        });
    }

    // 로그인 카드 상단에 있는 'Chatting with Emotion' 타이틀 링크도 안전하게 장고 메인(/chat/)으로 연결
    const rainbowBrandLink = document.querySelector('.rainbow-text');
    if (rainbowBrandLink) {
        rainbowBrandLink.setAttribute('href', '/chat/');
    }
});