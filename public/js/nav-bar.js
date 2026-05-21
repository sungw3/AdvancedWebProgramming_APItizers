fetch('nav-bar.html')
    .then(response => {
        if (!response.ok) throw new Error('Failed to load nav-bar.html');
        return response.text();
    })
    .then(data => {
        document.getElementById('nav-placeholder').innerHTML = data;

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
            logoutBtn.addEventListener('click', function(event) {
                event.preventDefault();
                localStorage.clear();
                alert('Logged out successfully.');
                window.location.href = 'index.html';
            });
        }
    })
    .catch(error => console.error('Error loading nav bar:', error));