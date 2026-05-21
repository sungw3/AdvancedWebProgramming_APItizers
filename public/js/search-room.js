/*
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('appToast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.innerText = message;
    toastEl.className = type === 'error' 
        ? 'toast align-items-center text-bg-danger border-0' 
        : 'toast align-items-center text-bg-success border-0';
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, function(tag) {
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

function enterRoom(roomId, urlSafeTitle) {
    if (!localStorage.getItem('accessToken')) {
        showToast('Please log in to enter the room.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        
        return;
    }
    window.location.href = `chat-room.html?roomId=${roomId}&title=${urlSafeTitle}`;
}


async function fetchAndRenderRooms(page, searchQuery = "") {
    if (isFetching) return;
    isFetching = true; 

    const container = document.getElementById('room-list');
    const emptyState = document.getElementById('empty-state');
    const errorState = document.getElementById('error-state');
    const paginationNav = document.getElementById('pagination-nav');

    container.innerHTML = `<div class="text-center my-5"><div class="spinner-border text-primary" role="status"></div></div>`;
    emptyState.style.display = "none";
    if(errorState) errorState.style.display = "none";
    paginationNav.style.display = "none";

    try {
        const queryParams = new URLSearchParams({
            page: page,
            limit: itemsPerPage,
            search: searchQuery
        });
        
        const responseData = await fetchAPI(`/rooms?${queryParams.toString()}`);
        
        const rooms = responseData.rooms || [];
        const totalRooms = responseData.totalRooms || 0;

        container.innerHTML = ""; 

        if (rooms.length === 0) {
            emptyState.style.display = "block";
            isFetching = false; 
            return;
        }

        paginationNav.style.display = "block";

        rooms.forEach(room => {
            const safeTitle = escapeHTML(room.title);
            const safeHost = escapeHTML(room.host);
            const urlSafeTitle = encodeURIComponent(room.title); 

            container.innerHTML += `
                <div class="card mb-3 room-card shadow-sm" onclick="enterRoom('${room.id}', '${urlSafeTitle}')">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title mb-1">${safeTitle}</h5>
                            <p class="card-text text-muted mb-0 small">Host: <strong>${safeHost}</strong></p>
                        </div>
                        <div class="text-end">
                            <span class="badge rounded-pill badge-count text-white">${room.count} / ${room.max}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        const totalPages = Math.ceil(totalRooms / itemsPerPage);
        renderPagination(totalPages, page);

    } catch (error) {
        container.innerHTML = "";
        emptyState.style.display = "none"; 
        
        if(errorState) errorState.style.display = "block";
        showToast('Failed to load room list. Please try again.', 'error');
    } finally {
        isFetching = false; 
    }
}

function renderPagination(totalPages, current) {
    const list = document.getElementById('pagination-list');
    list.innerHTML = "";

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
    if(event) event.preventDefault(); 
    if(isFetching) return; 
    currentPage = page;
    fetchAndRenderRooms(currentPage, currentSearchQuery);
    window.scrollTo(0, 0); 
}

function searchRooms() {
    if(isFetching) return; 
    const searchInput = document.getElementById('searchInput');
    currentSearchQuery = searchInput.value.trim();
    currentPage = 1; 
    fetchAndRenderRooms(currentPage, currentSearchQuery);
}

document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchRooms();
    }
});

fetchAndRenderRooms(currentPage);
*/
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('appToast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.innerText = message;
    toastEl.className = type === 'error' 
        ? 'toast align-items-center text-bg-danger border-0' 
        : 'toast align-items-center text-bg-success border-0';
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, function(tag) {
        const charsToReplace = {
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        };
        return charsToReplace[tag] || tag;
    });
}

const dummyRooms = Array.from({ length: 45 }, (_, i) => ({
    id: `room-${i + 1}`,
    title: `ㅎㅇ ${i + 1} 🎨`,
    host: `User${Math.floor(Math.random() * 1000)}`,
    count: Math.floor(Math.random() * 10),
    max: 10
}));

async function mockFetchAPI(queryParams) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const page = parseInt(queryParams.get('page')) || 1;
            const limit = parseInt(queryParams.get('limit')) || 20;
            const search = queryParams.get('search') || "";

            const filteredRooms = dummyRooms.filter(room =>
                room.title.toLowerCase().includes(search.toLowerCase())
            );
            
            const startIndex = (page - 1) * limit;
            const paginatedRooms = filteredRooms.slice(startIndex, startIndex + limit);

            resolve({
                rooms: paginatedRooms,
                totalRooms: filteredRooms.length
            });
        }, 500); 
    });
}



const itemsPerPage = 20;
let currentPage = 1;
let currentSearchQuery = "";
let isFetching = false; 

function enterRoom(roomId, urlSafeTitle) {
    window.location.href = `chat-room.html?roomId=${roomId}&title=${urlSafeTitle}`;
}


async function fetchAndRenderRooms(page, searchQuery = "") {
    if (isFetching) return;
    isFetching = true; 

    const container = document.getElementById('room-list');
    const emptyState = document.getElementById('empty-state');
    const errorState = document.getElementById('error-state');
    const paginationNav = document.getElementById('pagination-nav');

    container.innerHTML = `<div class="text-center my-5"><div class="spinner-border text-primary" role="status"></div></div>`;
    emptyState.style.display = "none";
    if(errorState) errorState.style.display = "none";
    paginationNav.style.display = "none";

    try {
        const queryParams = new URLSearchParams({
            page: page,
            limit: itemsPerPage,
            search: searchQuery
        });
        
        const responseData = await mockFetchAPI(queryParams);
        
        const rooms = responseData.rooms || [];
        const totalRooms = responseData.totalRooms || 0;

        container.innerHTML = ""; 

        if (rooms.length === 0) {
            emptyState.style.display = "block";
            isFetching = false; 
            return;
        }

        paginationNav.style.display = "block";

        rooms.forEach(room => {
            const safeTitle = escapeHTML(room.title);
            const safeHost = escapeHTML(room.host);
            const urlSafeTitle = encodeURIComponent(room.title); 

            container.innerHTML += `
                <div class="card mb-3 room-card shadow-sm" onclick="enterRoom('${room.id}', '${urlSafeTitle}')" style="cursor: pointer;">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title mb-1">${safeTitle}</h5>
                            <p class="card-text text-muted mb-0 small">Host: <strong>${safeHost}</strong></p>
                        </div>
                        <div class="text-end">
                            <span class="badge rounded-pill badge-count text-white bg-secondary">${room.count} / ${room.max}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        const totalPages = Math.ceil(totalRooms / itemsPerPage);
        renderPagination(totalPages, page);

    } catch (error) {
        container.innerHTML = "";
        emptyState.style.display = "none"; 
        
        if(errorState) errorState.style.display = "block";
        showToast('Failed to load room list. Please try again.', 'error');
    } finally {
        isFetching = false; 
    }
}

function renderPagination(totalPages, current) {
    const list = document.getElementById('pagination-list');
    list.innerHTML = "";

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
    if(event) event.preventDefault(); 
    if(isFetching) return; 
    currentPage = page;
    fetchAndRenderRooms(currentPage, currentSearchQuery);
    window.scrollTo(0, 0); 
}

function searchRooms() {
    if(isFetching) return; 
    const searchInput = document.getElementById('searchInput');
    currentSearchQuery = searchInput.value.trim();
    currentPage = 1; 
    fetchAndRenderRooms(currentPage, currentSearchQuery);
}

document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchRooms();
    }
});

fetchAndRenderRooms(currentPage);
