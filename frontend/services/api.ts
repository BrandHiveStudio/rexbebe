import { API_BASE_URL } from '../utils/constants';

function getEffectiveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    const protocol = window.location.protocol;
    try {
      const parsed = new URL(API_BASE_URL);
      // In browser over HTTPS (like Vercel production), avoid mixed-content blocks by falling back to same-origin /api if API_BASE_URL is insecure localhost
      if (
        protocol === 'https:' &&
        parsed.protocol === 'http:' &&
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
      ) {
        return '/api';
      }
      // If client is on 127.0.0.1, localhost, or LAN, match the hostname to avoid cross-loopback CORS mismatches
      if (
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
        currentHost &&
        !currentHost.includes('.vercel.app') &&
        !currentHost.includes('rexbebe.com')
      ) {
        parsed.hostname = currentHost;
        return parsed.toString().replace(/\/$/, '');
      }
    } catch {
      // ignore
    }
  }
  return API_BASE_URL.replace(/\/$/, '');
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getEffectiveApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const url = `${baseUrl}${cleanEndpoint}`;
  
  const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
  const adminMode = typeof window !== 'undefined' ? localStorage.getItem('admin_mode') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...(token ? { Authorization: `Bearer ${token}` } : { 'x-admin-role': 'ADMIN' }),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    let response: Response;
    try {
      response = await fetch(url, {
        cache: 'no-store',
        ...options,
        headers,
      });
    } catch (fetchErr: any) {
      // If direct backend request failed and we're in the browser with an absolute URL, try Next.js proxy rewrite at /api
      if (typeof window !== 'undefined' && url.startsWith('http')) {
        console.warn(`[fetchApi] Direct request to ${url} failed; falling back to same-origin rewrite /api${cleanEndpoint}`);
        response = await fetch(`/api${cleanEndpoint}`, {
          cache: 'no-store',
          ...options,
          headers,
        });
      } else {
        throw fetchErr;
      }
    }
    
    // Check if response has content before parsing JSON
    const text = await response.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Invalid JSON response from server (${response.status}): ${text.slice(0, 100)}`);
      }
    }

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `API request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data?.data !== undefined ? data.data : data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const helpfulMsg = `Failed to connect to backend API at ${baseUrl}. Please check that the backend is running on port 5000 and CORS is enabled.`;
      console.error(`[API Network Error] ${endpoint}:`, helpfulMsg, error);
      throw new Error(helpfulMsg);
    }
    console.error(`[API Fetch Error] ${endpoint}:`, error.message);
    throw error;
  }
}

