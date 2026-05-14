const BASE_URL = 'http://localhost:8080/api'; // This is backend API base local URL

// function to make API calls
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), 
        // if token exists, include it in the headers

        ...options.headers
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        throw new Error('API request failed');
    }
    return response.json();
}