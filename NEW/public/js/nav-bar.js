document.addEventListener("DOMContentLoaded", function () {
    const pageBackgrounds = {
        'index.html': [
            "url('images/bg-index-c5.png')",
            "url('images/bg-index-c6.png')",
            "url('images/bg-index-c7.png')"
        ],
        'search-room.html': [
            "url('images/bg-search-c3.png')",
            "url('images/bg-search-c1.png')"
        ]
    };

    let currentPageName = window.location.pathname.split('/').pop() || 'index.html';
    let bgTargetPage = currentPageName;

    if (currentPageName === 'login.html' || currentPageName === 'signup.html') {
        bgTargetPage = 'index.html';
    } else if (currentPageName === 'create-room.html') {
        bgTargetPage = 'search-room.html';
    }

    const backgroundImages = pageBackgrounds[bgTargetPage] || pageBackgrounds['index.html'];
    const storageKey = 'bgIndex_' + bgTargetPage;
    const savedBgIndex = localStorage.getItem(storageKey);
    let currentBgIndex = savedBgIndex ? parseInt(savedBgIndex) : 0;

    if (currentBgIndex >= backgroundImages.length) {
        currentBgIndex = 0;
    }

    document.body.style.setProperty('--bg-image', backgroundImages[currentBgIndex]);

    const navPlaceholder = document.getElementById('nav-placeholder');

    if (navPlaceholder) {
        fetch('nav-bar.html')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load nav-bar.html');
                return response.text();
            })
            .then(data => {
                navPlaceholder.innerHTML = data;

                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    const linkHref = link.getAttribute('href');
                    if (linkHref === currentPageName || (currentPageName === 'index.html' && linkHref === 'index.html')) {
                        link.classList.add('active');
                    }
                });

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

                const logoutBtn = document.getElementById('logout-btn');

                if (logoutBtn) {
                    logoutBtn.addEventListener('click', function (event) {
                        event.preventDefault();
                        
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('userName');
                        
                        window.location.replace('index.html'); 
                    });
                }

                const themeButtons = document.querySelectorAll('.theme-toggle-btn');

                themeButtons.forEach(btn => {
                    btn.addEventListener('click', function () {
                        currentBgIndex = (currentBgIndex + 1) % backgroundImages.length;
                        document.body.style.setProperty('--bg-image', backgroundImages[currentBgIndex]);
                        localStorage.setItem(storageKey, currentBgIndex);
                    });
                });
            })
            .catch(error => console.error('Error loading nav bar:', error));
    }
});