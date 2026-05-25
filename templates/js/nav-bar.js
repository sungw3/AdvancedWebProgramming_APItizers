document.addEventListener("DOMContentLoaded", function () {
    // 1. 네비게이션 링크 장고 뷰 주소 및 홈 주소로 강제 매핑 고정
    const navbarBrand = document.querySelector('.navbar-brand');
    if (navbarBrand) {
        navbarBrand.setAttribute('href', '/');
    }

    const browseRoomsLinks = document.querySelectorAll('a[href*="search-room.html"], a[href="/chat/"]');
    browseRoomsLinks.forEach(link => {
        link.setAttribute('href', '/chat/');
    });

    const hostRoomLinks = document.querySelectorAll('a[href*="create-room.html"], a[href="/chat/create/"]');
    hostRoomLinks.forEach(link => {
        link.setAttribute('href', '/chat/create/');
    });

    const aboutLinks = document.querySelectorAll('a[href*="about.html"], a[href="/chat/about/"]');
    aboutLinks.forEach(link => {
        link.setAttribute('href', '/chat/about/');
    });

    // 2. 로그인 상태 동적 렌더링 UI 처리
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginSection = document.getElementById('login-section');
    const userSection = document.getElementById('user-section');
    const userNicknameEl = document.getElementById('user-nickname');

    if (isLoggedIn) {
        if (loginSection) loginSection.style.display = 'none';
        if (userSection) userSection.style.display = 'block';

        const myName = localStorage.getItem('userName');
        if (myName && userNicknameEl) {
            function escapeHTML(str) {
                if (!str) return '';
                return String(str).replace(/[&<>'"]/g, function (tag) {
                    const charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
                    return charsToReplace[tag] || tag;
                });
            }
            userNicknameEl.innerHTML = `Welcome, ${escapeHTML(myName)}!`;
        }
    } else {
        if (loginSection) loginSection.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
    }

    // 3. 로그아웃 버튼 이벤트 처리
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (event) {
            event.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userName');
            window.location.replace('/'); // 로그아웃 시에도 메인 화면으로 이동
        });
    }

    // 4. 테마 토글(배경화면 순환 전환) 처리
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

    let currentPath = window.location.pathname;
    let bgTargetPage = 'index.html';

    if (currentPath.includes('/create/')) {
        bgTargetPage = 'search-room.html';
    } else if (currentPath.includes('/search/') || (currentPath.endsWith('/chat/') || currentPath.endsWith('/chat'))) {
        bgTargetPage = 'search-room.html';
    } else if (currentPath.includes('/login') || currentPath.includes('/signup')) {
        bgTargetPage = 'index.html';
    }

    const backgroundImages = pageBackgrounds[bgTargetPage] || pageBackgrounds['index.html'];
    const storageKey = 'bgIndex_' + bgTargetPage;
    let currentBgIndex = parseInt(localStorage.getItem(storageKey), 10) || 0;

    if (backgroundImages[currentBgIndex]) {
        document.body.style.setProperty('--bg-image', backgroundImages[currentBgIndex]);
    }

    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            currentBgIndex = (currentBgIndex + 1) % backgroundImages.length;
            document.body.style.setProperty('--bg-image', backgroundImages[currentBgIndex]);
            localStorage.setItem(storageKey, currentBgIndex);

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