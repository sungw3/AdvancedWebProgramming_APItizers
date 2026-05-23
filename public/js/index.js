document.getElementById('startChatBtn').addEventListener('click', function(event) {
            event.preventDefault(); // 기본 링크 이동 기능 차단
            
            // 로그인 상태 확인 (nav-bar.js에서 사용하는 방식과 동일)
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (isLoggedIn) {
                // 로그인 되어있으면 방 찾기 페이지로 이동
                window.location.href = 'search-room.html'; 
            } else {
                // 로그인 안 되어있으면 로그인 페이지로 이동
                window.location.href = 'login.html'; 
            }
        });