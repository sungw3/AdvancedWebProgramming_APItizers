
const navStyles = `
<style>
    /* style will be more detailed in the future. */

    // default styles for the navbar
    .navbar {
        min-height: 56px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
    }
    
    /* modifiy the logo size and spacing for mobile */
    .navbar-brand { 
        font-size: 1.1rem !important;
        margin-right: 0.5rem;
    }

    /* container */
    .container-fluid {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
    }

    /* adjust for 768px and above */
    @media (min-width: 768px) {
        .navbar { min-height: 80px; }
        .navbar-brand { font-size: 1.5rem !important; }
        .container-fluid {
            padding-left: 2rem !important;
            padding-right: 2rem !important;
        }
    }

    /* adjust for 1200px and above */
    @media (min-width: 1200px) {
        .navbar { min-height: 100px; }
        .navbar-brand { font-size: 1.8rem !important; }
        .nav-link { font-size: 1.1rem; }
    }

    /* adjust for 1920px and above */
    @media (min-width: 1920px) {
        .navbar .container-fluid {
            max-width: 1800px;
            margin-left: auto;
            margin-right: auto;
        }
    }
</style>
`;

const navHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom sticky-top">

        <div class="container-fluid px-4">
            <a class="navbar-brand fw-bold" href="index.html">Chatting with Emotion</a>

            <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title fw-bold" id="offcanvasNavbarLabel">Menu</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                
                <div class="offcanvas-body">
                    <ul class="navbar-nav justify-content-start flex-grow-1 pe-3">
                        <li class="nav-item">
                            <a class="nav-link active" href="room-list.html">Browse Rooms</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="create-room.html">Host Room</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="about.html">Getting Started</a>
                        </li>
                    </ul>

                    <div class="d-flex align-items-center mt-3 mt-lg-0">
                        <div id="login-section">
                            <a href="login.html" class="btn btn-primary w-100">Log In</a>
                        </div>

                        <div id="user-section" style="display: none;">
                            <div class="dropdown">
                                <button class="btn btn-outline-secondary dropdown-toggle btn-sm w-100" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                                    <span id="user-nickname">Welcome!</span>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                                    <li><a class="dropdown-item text-danger" href="#" id="logout-btn">Log Out</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>

    </nav>
`;

// nav-bar styles and HTML update
document.head.insertAdjacentHTML('beforeend', navStyles);
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