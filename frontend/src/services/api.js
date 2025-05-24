// API service for URL shortener backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Helper method to handle API responses
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    // Shorten a URL
    async shortenUrl(longUrl) {
        try {
            const response = await fetch(`${this.baseURL}/data/shorten`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ longUrl }),
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error shortening URL:', error);
            throw error;
        }
    }

    // Get URL analytics
    async getUrlAnalytics(shortUrl) {
        try {
            const response = await fetch(`${this.baseURL}/info/${shortUrl}`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching URL analytics:', error);
            throw error;
        }
    }

    // Get all URLs with pagination
    async getAllUrls(page = 1, limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/urls?page=${page}&limit=${limit}`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching URLs:', error);
            throw error;
        }
    }

    // Health check
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error checking health:', error);
            throw error;
        }
    }

    // Get redirect URL (for preview purposes)
    getRedirectUrl(shortUrl) {
        return `${this.baseURL}/${shortUrl}`;
    }
}

export default new ApiService();