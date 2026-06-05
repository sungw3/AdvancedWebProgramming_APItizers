async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    
    const isFormData = options.body instanceof FormData;
    const headers = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    try {
        const response = await fetch(`/api${safeEndpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: 'An unknown server error occurred.' };
            }

            // 로그인 페이지에서는 강제로 로그아웃시키지 않음
            if (response.status === 401 && !window.location.pathname.includes('login.html')) {
                alert('Your session has expired. Please log in again.');
                localStorage.clear();
                window.location.href = 'login.html';
                return;
            }

            throw new Error(errorData.message || `HTTP Error ${response.status}`);
        }

        if (response.status === 204) return null;
        
        return await response.json();
    } catch (error) {
        console.error(`[API Request Error - ${endpoint}]:`, error);
        throw error;
    }
}