document.addEventListener("DOMContentLoaded", function () {
    const pageBackgrounds = {
        'index.html': [
            "url('images/bg-index-c5.png')",
            "url('images/bg-index-c6.png')",
            "url('images/bg-index-c2.png')"
        ],
        'search-room.html': [
            "url('images/bg-search-c1.png')",
            "url('images/bg-index-c5.png')",
            "url('images/bg-index-c6.png')"
        ],
        'create-room.html': [
            "url('images/bg-create-1.png')",
            "url('images/bg-create-2.png')"
        ]
    };

    let currentPageName = window.location.pathname.split('/').pop() || 'index.html';
    let bgTargetPage = currentPageName;

    if (currentPageName === 'login.html' || currentPageName === 'signup.html') {
        bgTargetPage = 'index.html';
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

                const currentPage = window.location.pathname.split('/').pop();
                const navLinks = document.querySelectorAll('.nav-link');

                navLinks.forEach(link => {
                    const linkHref = link.getAttribute('href');
                    if (linkHref === currentPage) {
                        link.classList.add('active');
                    } else if (currentPage === '' && linkHref === 'index.html') {
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
                            userNicknameEl.innerText = `${savedName}, Welcome!`;
                        }
                    }
                }

                const logoutBtn = document.getElementById('logout-btn');

                if (logoutBtn) {
                    logoutBtn.addEventListener('click', function (event) {
                        event.preventDefault();
                        localStorage.clear();
                        alert('Logged out successfully.');
                        window.location.href = 'index.html';
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
