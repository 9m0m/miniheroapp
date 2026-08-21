import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export class ApiError extends Error {
  public status?: number;
  public url?: string;
  public method?: string;
  public data?: any;
  public traceId?: string;
  public errorCode?: string;

  constructor(
    message: string,
    status?: number,
    url?: string,
    method?: string,
    data?: any,
    traceId?: string,
    errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.method = method;
    this.data = data;
    this.traceId = traceId;
    this.errorCode = errorCode;
  }
}

// In-memory token cache for SSR/Client safety
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('world_hero_token', token);
    } else {
      localStorage.removeItem('world_hero_token');
    }
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('world_hero_token');
  }
  return authToken;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Single-flight re-authentication manager
let isRecoveringSession = false;
let sessionRecoveryQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processRecoveryQueue = (error: any, newToken: string | null) => {
  sessionRecoveryQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (newToken) {
      prom.resolve(newToken);
    }
  });
  sessionRecoveryQueue = [];
};

// Request Interceptor: Attach Bearer Token & Debug Logging
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isAuthEndpoint = config.url?.includes('/auth/local-login') || config.url?.includes('/auth/world-id');

    // Auth endpoints should start a clean exchange without attaching a stale bearer token
    if (!isAuthEndpoint) {
      let token = getAuthToken();
      if (typeof window !== 'undefined' && config.url && (config.url.includes('/admin') || config.url.includes('/arena/admin'))) {
        const adminToken = localStorage.getItem('wh_admin_session_token') || sessionStorage.getItem('wh_admin_session_token');
        if (adminToken) {
          token = adminToken;
        }
      }
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toLocaleTimeString();
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

// Response Interceptor: Structured Error Handling & Automatic Session Recovery
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
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = originalRequest?.url;
    const method = originalRequest?.method?.toUpperCase();
    const data = error.response?.data;
    const message = data?.message || error.message || 'An unexpected API error occurred';
    const traceId = data?.traceId;
    const errorCode = data?.errorCode || (message.toLowerCase().includes('user not found') ? 'USER_NOT_FOUND' : undefined);

    const isSessionDead =
      status === 401 ||
      status === 403 ||
      errorCode === 'USER_NOT_FOUND' ||
      (status === 404 && message.toLowerCase().includes('user'));

    const isAuthRoute = url?.includes('/auth/local-login') || url?.includes('/auth/world-id');

    // Automatic Session Recovery for stale database generations (e.g., after backend create-drop restart)
    if (isSessionDead && !isAuthRoute && !originalRequest._retry) {
      if (isRecoveringSession) {
        return new Promise((resolve, reject) => {
          sessionRecoveryQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRecoveringSession = true;

      try {
        console.log('🔄 Session expired or stale user UUID detected. Re-authenticating session...');
        setAuthToken(null); // Clear stale token

        // In production/World App, session expiration requires re-authentication via MiniKit/World ID
        const isDev = process.env.NODE_ENV !== 'production';
        if (!isDev) {
          try {
            const { useGameStore } = await import('../store/useGameStore');
            useGameStore.getState().resetUserSession();
          } catch {}
          throw new Error('Production session expired. Please sign in with World ID.');
        }

        // In development/testing, re-authenticate cleanly via local-login
        const reAuthRes = await apiClient.post<{ token: string }>('/auth/local-login');
        const newToken = reAuthRes.data?.token;

        if (newToken) {
          setAuthToken(newToken);
          console.log('✅ Session recovered successfully with fresh token.');
          // Invalidate, reset, and await re-bootstrap of store before retrying queued requests
          try {
            const { useGameStore } = await import('../store/useGameStore');
            useGameStore.getState().resetUserSession();
            await useGameStore.getState().fetchInitialData();
          } catch {}

          processRecoveryQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          isRecoveringSession = false;
          return apiClient(originalRequest);
        } else {
          throw new Error('Failed to acquire token during session recovery');
        }
      } catch (recoveryErr) {
        processRecoveryQueue(recoveryErr, null);
        isRecoveringSession = false;
        console.warn('⚠️ Session recovery failed:', recoveryErr);
      }
    }

    const apiError = new ApiError(message, status, url, method, data, traceId, errorCode);

    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `%c[API Error ${status || 'Network'}] %c${method} ${url}`,
        'color: #ef4444; font-weight: bold;',
        'color: #f87171;',
        message
      );
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
