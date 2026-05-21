

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    

        // Example data!
        const allRooms = Array.from({ length: 2000 }, (_, i) => ({
            id: i + 1,
            title: `Example Room ${i + 1}`,
            host: `User_${Math.floor(Math.random() * 100)}`,
            count: Math.floor(Math.random() * 10),
            max: 15
        }));

        // const allRooms = [];

        const itemsPerPage = 20;
        let currentPage = 1;

        function renderRooms(page) {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pagedRooms = allRooms.slice(start, end);
            
            const container = document.getElementById('room-list');
            const emptyState = document.getElementById('empty-state');
            const paginationNav = document.getElementById('pagination-nav');

            container.innerHTML = "";

            if (allRooms.length === 0) {
                emptyState.style.display = "block";
                paginationNav.style.display = "none";
                return;
            }

            emptyState.style.display = "none";
            paginationNav.style.display = "block";

            pagedRooms.forEach(room => {
                container.innerHTML += `
                    <div class="card mb-3 room-card shadow-sm" onclick="location.href='chat-room.html?title=${encodeURIComponent(room.title)}'">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="card-title mb-1">${room.title}</h5>
                                <p class="card-text text-muted mb-0 small">Host: <strong>${room.host}</strong></p>
                            </div>
                            <div class="text-end">
                                <span class="badge rounded-pill badge-count text-white">${room.count} / ${room.max}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            renderPagination(Math.ceil(allRooms.length / itemsPerPage), page);
        }

        // This is pagination rendering function
        function renderPagination(totalPages, current) {
            const list = document.getElementById('pagination-list');
            list.innerHTML = "";

            list.innerHTML += `<li class="page-item ${current === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${current - 1})">&laquo;</a></li>`;

            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
                    list.innerHTML += `<li class="page-item ${i === current ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`;
                } else if (i === current - 3 || i === current + 3) {
                    list.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }

            list.innerHTML += `<li class="page-item ${current === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${current + 1})">&raquo;</a></li>`;
        }

        function changePage(page) {
            currentPage = page;
            renderRooms(page);
            window.scrollTo(0, 0);
        }

        renderRooms(currentPage);

        function searchRooms() {
            alert("Backend connection required!");
        }

        
