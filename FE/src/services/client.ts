import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Debug Logging & Request Tracking
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const timestamp = new Date().toLocaleTimeString();
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `%c[API Request] %c${timestamp} %c${config.method?.toUpperCase()} %c${config.url}`,
        'color: #3b82f6; font-weight: bold;',
        'color: #94a3b8;',
        'color: #f59e0b; font-weight: bold;',
        'color: #10b981;',
        config.data ? { payload: config.data } : ''
      );
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Structured Error Handling & Response Logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `%c[API Response] %c${response.status} %c${response.config.url}`,
        'color: #10b981; font-weight: bold;',
        'color: #22c55e;',
        'color: #94a3b8;',
        response.data
      );
    }
    return response;
  },
  (error: AxiosError<any>) => {
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    };

    console.error(
      `%c[API Error ${errorDetails.status || 'Network'}] %c${errorDetails.method} ${errorDetails.url}`,
      'color: #ef4444; font-weight: bold;',
      'color: #f87171;',
      errorDetails.message,
      errorDetails
    );

    return Promise.reject(errorDetails);
  }
);

export default apiClient;
