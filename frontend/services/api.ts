import { API_BASE_URL } from '../utils/constants';

function getEffectiveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    try {
      const parsed = new URL(API_BASE_URL);
      if (
        (parsed.hostname === 'localhost' && currentHost === '127.0.0.1') ||
        (parsed.hostname === '127.0.0.1' && currentHost === 'localhost')
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
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
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

