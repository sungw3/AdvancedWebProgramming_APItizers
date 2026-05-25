document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname;

    // 1. 장고 URL 패턴에 맞게 배경 그룹화
    const pageBackgrounds = {
        'index': [
            "url('/static/bg-index-c6.png')",
            "url('/static/bg-index-c5.png')",
        ],
        'search': [
            "url('/static/bg-search-c3.png')",
            "url('/static/bg-search-c1.png')"
        ]
    };

    let bgTargetPage = 'index';
    if (currentPath.includes('/create/') || currentPath === '/chat/' || currentPath === '/chat' || currentPath.includes('/about/')) {
        bgTargetPage = 'search';
    }

    const backgroundImages = pageBackgrounds[bgTargetPage] || pageBackgrounds['index'];
    const storageKey = 'bgIndex_' + bgTargetPage;
    const savedBgIndex = localStorage.getItem(storageKey);
    let currentBgIndex = savedBgIndex ? parseInt(savedBgIndex, 10) : 0;

    if (currentBgIndex >= backgroundImages.length) {
        currentBgIndex = 0;
    }

    // 가상 요소 CSS 변수 제어 함수
    function applyBgStyle(bgUrl) {
        if (!bgUrl) return;
        document.documentElement.style.setProperty('--bg-image', bgUrl, 'important');
        document.body.style.setProperty('--bg-image', bgUrl, 'important');
        document.body.style.setProperty('background-image', bgUrl, 'important');
    }

    // 초기 배경 적용
    applyBgStyle(backgroundImages[currentBgIndex]);

    // 2. 네비게이션 active 클래스 매핑
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 3. 로그인 세션 상태 동적 UI 처리
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginSection = document.getElementById('login-section');
    const userSection = document.getElementById('user-section');

    if (isLoggedIn) {
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
                userNicknameEl.innerHTML = `Welcome, ${safeName}!`;
            }
        }
    } else {
        if (loginSection) loginSection.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
    }

    // 4. 로그아웃 기능 바인딩
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (event) {
            event.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userName');
            window.location.replace('/'); 
        });
    }

    // 5. 🎯 버튼 누를 때 배경만 순환 (아이콘은 CSS가 하드캐리함)
    const themeButtons = document.querySelectorAll('.theme-toggle-btn');

    themeButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Menu 버튼 간섭 방지 유지
            
            if (!backgroundImages || backgroundImages.length === 0) return;

            // 배경 이미지 인덱스 전환 및 저장
            currentBgIndex = (currentBgIndex + 1) % backgroundImages.length;
            applyBgStyle(backgroundImages[currentBgIndex]);
            localStorage.setItem(storageKey, currentBgIndex);
        });
    });
});