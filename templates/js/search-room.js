document.addEventListener("DOMContentLoaded", function () {
    // 💡 장고 static 가상 경로(/static/)에 맞춘 이미지 파일 매핑
    const pageBackgrounds = {
        'index.html': [
            "url('/static/css/images/bg-index-c5.png')",
            "url('/static/css/images/bg-index-c6.png')",
            "url('/static/css/images/bg-index-c7.png')"
        ],
        'search-room.html': [
            "url('/static/css/images/bg-search-c3.png')",
            "url('/static/css/images/bg-search-c1.png')"
        ]
    };

    // 💡 장고 주소 패턴(/chat, /chat/create 등)을 판별하여 타겟 페이지 지정
    let currentPath = window.location.pathname;
    let bgTargetPage = 'index.html'; // 기본값

    if (currentPath.includes('/create/')) {
        bgTargetPage = 'search-room.html';
    } else if (currentPath.includes('/search/') || (currentPath.endsWith('/chat/') || currentPath.endsWith('/chat'))) {
        // 방 목록(Browse Rooms) 페이지와 메인화면 처리
        bgTargetPage = 'search-room.html';
    } else if (currentPath.includes('/login') || currentPath.includes('/signup')) {
        bgTargetPage = 'index.html';
    }

    const backgroundImages = pageBackgrounds[bgTargetPage] || pageBackgrounds['index.html'];
    const storageKey = 'bgIndex_' + bgTargetPage;
    const savedBgIndex = localStorage.getItem(storageKey);
    let currentBgIndex = savedBgIndex ? parseInt(savedBgIndex) : 0;

    if (currentBgIndex >= backgroundImages.length) {
        currentBgIndex = 0;
    }

    // 1. 초기 배경화면 적용
    document.body.style.setProperty('--bg-image', backgroundImages[currentBgIndex]);

    // 2. 현재 활성화된 메뉴 하이라이트(active) 처리
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (currentPath === linkHref) {
            link.classList.add('active');
        }
    });

    // 3. LocalStorage 기반 로그인 세션 연동 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        const loginSection = document.getElementById('login-section');
        const userSection = document.getElementById('user-section');

        if (loginSection) loginSection.style.display = 'none';
        if (userSection) {
            userSection.style.display = 'block';
            const savedName = localStorage.getItem('userName');
            const userNicknameEl = document.getElementById('user-nickname');
            
            if (savedName && userNicknameEl) {
                let displayName = savedName;
                if (displayName.length > 12) {
                    displayName = displayName.substring(0, 12) + '...';
                }
                
                const safeName = displayName.replace(/[&<>'"]/g, function (tag) {
                    const charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
                    return charsToReplace[tag] || tag;
                });
                userNicknameEl.innerHTML = `${safeName}<br>Welcome!`;
            }
        }
    }

    // 4. 로그아웃 버튼 이벤트 처리
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (event) {
            event.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userName');
            window.location.replace('/chat/'); 
        });
    }

    // 5. 💡 테마 토글(달/해 아이콘) 버튼 클릭 시 배경 화면 전환 이벤트 정상 작동 처리
    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            // 배경 순번 변경 순환 로직
            currentBgIndex = (currentBgIndex + 1) % backgroundImages.length;
            document.body.style.setProperty('--bg-image', backgroundImages[currentBgIndex]);
            localStorage.setItem(storageKey, currentBgIndex);

            // 아이콘 달<->해 모양 변경 커스터마이징 추가
            const icon = btn.querySelector('i');
            if (icon) {
                if (icon.classList.contains('bi-moon-fill')) {
                    icon.classList.replace('bi-moon-fill', 'bi-sun-fill');
                } else {
                    icon.classList.replace('bi-sun-fill', 'bi-moon-fill');
                }
            }
        });
    });
});