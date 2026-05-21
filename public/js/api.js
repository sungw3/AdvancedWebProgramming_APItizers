async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        // endpoint가 '/login' 이면 브라우저가 알아서 '/api/login'으로 요청하는 방식.
        // if endpoint starts with '/login', fetch will automatically prepend '/api' to the request URL.
        const response = await fetch(`/api${endpoint}`, {
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

            if (response.status === 401) {
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