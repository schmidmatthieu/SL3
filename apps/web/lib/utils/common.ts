import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getApiUrl, getAuthToken } from '@/lib/api/auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const apiUrl = getApiUrl();

  // Ensure URL is properly formatted with API base URL
  const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`;

  if (!token) {    
    throw new Error('Authentication required');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });


    return response;
  } catch (error) {    
    throw new Error('Network error occurred');
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ status: number; data: T }> {
  try {
    const response = await fetchWithAuth(url, options);
    

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }

      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.message || errorData.error || '';
      } catch {
        errorDetails = response.statusText;
      }

      throw new Error(
        `HTTP error! status: ${response.status}${errorDetails ? ` - ${errorDetails}` : ''}`
      );
    }

    const data = await response.json();
    return {
      status: response.status,
      data,
    };
  } catch (error) {    
    throw error;
  }
}
