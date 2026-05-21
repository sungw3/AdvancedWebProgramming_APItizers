fetch('nav-bar.html')
  .then(response => response.text())
  .then(data => {
      document.getElementById('nav-placeholder').innerHTML = data;


      const currentPage = window.location.pathname.split('/').pop();

      const navLinks = document.querySelectorAll('.nav-link');

      navLinks.forEach(link => {
          const linkHref = link.getAttribute('href');

          if (linkHref === currentPage) {
              link.classList.add('active');
          } 
          else if (currentPage === '' && linkHref === 'index.html') {
              link.classList.add('active');
          }
      });


      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

      if (isLoggedIn) {
          document.getElementById('login-section').style.display = 'none';
          document.getElementById('user-section').style.display = 'block';
          
          const savedName = localStorage.getItem('userName');
          if (savedName) {
              document.getElementById('user-nickname').innerText = `${savedName}, Welcome!`;
          }
      }

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
  })
  .catch(error => console.error('error loading nav bar:', error));