function showToast(message, type = 'success') {
    const toastEl = document.getElementById('appToast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toastEl || !toastMessage) return;
    toastMessage.innerText = message;
    toastEl.className = type === 'error'
        ? 'toast align-items-center text-bg-danger border-0'
        : 'toast align-items-center text-bg-success border-0';
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, function (tag) {
        const charsToReplace = {
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        };
        return charsToReplace[tag] || tag;
    });
}

const itemsPerPage = 20;
let currentPage = 1;
let currentSearchQuery = "";
let isFetching = false;

// 💡 방 입장 라우팅 경로 장고 방식으로 전면 수정
function enterRoom(roomId, urlSafeTitle) {
    if (!localStorage.getItem('accessToken')) {
        showToast('Please log in to enter the room.', 'error');
        setTimeout(() => {
            window.location.href = '/api/login/';
        }, 1500);
        return;
    }
    // chat-room.html?roomId=... 구조를 장고 표준 뷰 구조로 변경
    window.location.href = `/chat/${roomId}/?title=${urlSafeTitle}`;
}

async function fetchAndRenderRooms(page, searchQuery = "") {
    if (isFetching) return;
    isFetching = true;

    const roomListContainer = document.getElementById('room-list');
    if (!roomListContainer) return;

    try {
        let endpoint = `/rooms?page=${page}&limit=${itemsPerPage}`;
        if (searchQuery) {
            endpoint += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const data = await fetchAPI(endpoint);
        roomListContainer.innerHTML = "";

        if (!data.rooms || data.rooms.length === 0) {
            roomListContainer.innerHTML = `<div class=\"col-12 text-center text-muted my-5\"><h5>No rooms found.</h5></div>`;
            renderPagination(0, page);
            return;
        }

        data.rooms.forEach(room => {
            const safeTitle = escapeHTML(room.title);
            const urlSafeTitle = escapeHTML(encodeURIComponent(room.title));
            const safeSubtitle = escapeHTML(room.subtitle || 'No description');
            const safeHost = escapeHTML(room.hostName);
            const currentUsers = room.currentParticipants || 0;
            const maxUsers = room.maxParticipants || 10;
            const isPrivate = room.isPrivate;

            const cardHtml = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm room-card" onclick="enterRoom('${room.roomId}', '${urlSafeTitle}')" style="cursor:pointer;">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="card-title text-truncate mb-0" style="max-width: 80%;">${safeTitle}</h5>
                                ${isPrivate ? '<span class="badge bg-warning text-dark"><i class="bi bi-lock-fill"></i> Private</span>' : '<span class="badge bg-success">Public</span>'}
                            </div>
                            <p class="card-text text-muted text-truncate small">${safeSubtitle}</p>
                        </div>
                        <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between align-items-center">
                            <span class="text-muted small">Host: <b>${safeHost}</b></span>
                            <span class="badge rounded-pill bg-light text-dark">${currentUsers} / ${maxUsers} <i class="bi bi-people-fill ms-1"></i></span>
                        </div>
                    </div>
                </div>
            `;
            roomListContainer.insertAdjacentHTML('beforeend', cardHtml);
        });

        renderPagination(data.totalPages, page);

    } catch (error) {
        console.error(error);
        showToast('Failed to load room list.', 'error');
    } finally {
        isFetching = false;
    }
}

function renderPagination(totalPages, current) {
    const list = document.getElementById('pagination-list');
    if (!list) return;
    list.innerHTML = "";

    if (totalPages <= 1) return;

    list.innerHTML += `<li class="page-item ${current === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${current - 1}, event)">&laquo;</a></li>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
            list.innerHTML += `<li class="page-item ${i === current ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}, event)">${i}</a></li>`;
        } else if (i === current - 3 || i === current + 3) {
            list.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    list.innerHTML += `<li class="page-item ${current === totalPages || totalPages === 0 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${current + 1}, event)">&raquo;</a></li>`;
}

function changePage(page, event) {
    if (event) event.preventDefault();
    if (isFetching) return;
    currentPage = page;
    fetchAndRenderRooms(currentPage, currentSearchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function searchRooms() {
    if (isFetching) return;
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    currentSearchQuery = searchInput.value.trim();
    currentPage = 1;
    fetchAndRenderRooms(currentPage, currentSearchQuery);
}

document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', searchRooms);
    }
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') searchRooms();
        });
    }

    if (document.getElementById('room-list')) {
        fetchAndRenderRooms(currentPage);
    }
});