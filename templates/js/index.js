document.addEventListener("DOMContentLoaded", function () {
    const startChatBtn = document.getElementById('startChatBtn');

    if (startChatBtn) {
        startChatBtn.addEventListener('click', function(event) {
            event.preventDefault();

            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            // 버튼을 눌렀을 때만 로그인 판단해서 올바른 장고 URL 패턴으로 이동
            if (isLoggedIn) {
                window.location.href = '/chat/'; // 로그인 되어 있으면 방 목록 화면으로
            } else {
                window.location.href = '/api/login/'; // 기존 login.html이 열리는 올바른 주소 패턴으로 연동
            }
        });
    }
});