async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    
    // FormData 전송 시에는 브라우저가 자동으로 Content-Type과 boundary를 설정하도록 분기 처리
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