document.addEventListener("DOMContentLoaded", function () {
    const pageBackgrounds = { /* 기존 코드 유지 */ };

    // ... (기존 배경 이미지 관련 코드 유지) ...

    const navPlaceholder = document.getElementById('nav-placeholder');

    if (navPlaceholder) {
        fetch('nav-bar.html')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load nav-bar.html');
                return response.text();
            })
            .then(data => {
                navPlaceholder.innerHTML = data;

                // 기존 nav-link active 처리 코드 유지
                // ... 

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
                            let displayName = savedName.length > 12 ? savedName.substring(0, 12) + '...' : savedName;
                            const safeName = displayName.replace(/[&<>'"]/g, tag => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag] || tag));
                            userNicknameEl.innerHTML = `${safeName}<br>Welcome!`;
                        }
                    }
                }

                // === 로그아웃 버튼 ===
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

                // === 회원 탈퇴 버튼 (추가) ===
                const deleteAccountBtn = document.getElementById('delete-account-btn');
                if (deleteAccountBtn) {
                    deleteAccountBtn.addEventListener('click', async function (event) {
                        event.preventDefault();

                        if (!confirm("정말로 계정을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.")) {
                            return;
                        }
                        if (!confirm("마지막 확인입니다. 정말 탈퇴하시겠습니까?")) {
                            return;
                        }

                        const token = localStorage.getItem('accessToken');
                        if (!token) {
                            alert("로그인 정보가 없습니다.");
                            return;
                        }

                        try {
                            const response = await fetch('/api/users/me', {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });

                            if (response.ok) {
                                alert("계정이 삭제되었습니다. 이용해 주셔서 감사합니다.");
                                localStorage.clear();
                                window.location.replace('index.html');
                            } else {
                                const errorData = await response.json().catch(() => ({}));
                                alert(errorData.detail || "계정 삭제에 실패했습니다.");
                            }
                        } catch (error) {
                            console.error(error);
                            alert("계정 삭제 중 오류가 발생했습니다.");
                        }
                    });
                }

                // 테마 버튼 관련 기존 코드 유지
                // ...
            })
            .catch(error => console.error('Error loading nav bar:', error));
    }
});