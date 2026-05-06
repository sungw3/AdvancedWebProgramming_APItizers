const navHTML = `
    <nav style="display: flex; justify-content: space-between; align-items: center; padding: 0 50px; background: #eee; height: 70px; border-bottom: 1px solid #ddd;">
        
        <div class="menu-left">
            <a href="index.html" class="text-decoration-none text-dark fw-bold me-3">Chatting with Emotion</a>
            <a href="room-list.html" class="text-decoration-none me-3">Browse Rooms</a>
            <a href="create-room.html" class="text-decoration-none me-3">Host Room</a>
        </div>

        <div class="menu-right">

            <div id="login-section">
                <a href="login.html" class="btn btn-primary">Log In</a>
            </div>

            <div id="user-section" style="display: none;">
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle btn-sm" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                        <span id="user-nickname">Welcome!</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                        <li><a class="dropdown-item text-danger" href="#" id="logout-btn">Log Out</a></li>
                    </ul>
                </div>
            </div>

        </div>

    </nav>
`;

// nav-bar.js
document.body.insertAdjacentHTML('afterbegin', navHTML);

// after checking the login state, show the appropriate menu items
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

if (isLoggedIn) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'block';
    
    const savedName = localStorage.getItem('userName');
    if (savedName) {
        document.getElementById('user-nickname').innerText = `${savedName}, Welcome!`;
    }
}

// logout button event listener
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        alert('Logged out successfully.');
        window.location.href = 'index.html';
    });
}