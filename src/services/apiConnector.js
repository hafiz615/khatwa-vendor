import axios from 'axios'
import store from '../store/store'
import { setToken } from '../slices/auth';
import { authEndpoints } from './api';

const instance = axios.create({
    withCredentials: true,
});

// Separate instance to avoid infinite interceptor loop
const refreshInstance = axios.create({ 
    withCredentials: true 
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add request interceptor to attach token
instance.interceptors.request.use(
    (config) => {
        const token = store.getState().auth?.token || localStorage.getItem("token");
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for handling 401 errors globally
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 once per request
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Queue requests if already refreshing
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return instance(originalRequest);
                })
                .catch(err => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                
                const res = await refreshInstance.post(authEndpoints.REFRESH_API);
                
                if (res.data.success && res.data.accessToken) {
                    const newToken = res.data.accessToken;
                                        
                    // Update token in store and localStorage
                    store.dispatch(setToken(newToken));
                    localStorage.setItem("token", newToken);
                    
                    // Update default header
                    instance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    
                    // Process all queued requests
                    processQueue(null, newToken);
                    
                    // Retry the original request
                    return instance(originalRequest);
                } else {
                    // Token refresh failed
                    throw new Error(res.data.message || "Token refresh failed");
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError.message);
                
                // Process queued requests with error
                processQueue(refreshError, null);
                
                // Clear authentication
                store.dispatch(setToken(null));
                localStorage.removeItem("token");
                
                // Redirect to login on refresh failure
                if (!window.location.pathname.includes('/')) {
                    window.location.href = '/';
                }
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

const apiConnector = (method, url, bodyData, headers, params) => {
    return instance({
        method: `${method}`,
        url: `${url}`,
        headers: headers ? headers : null,
        data: bodyData ? bodyData : null,
        params: params ? params : null
    });
};

export default apiConnector;