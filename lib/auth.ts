'use client';

export function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') {
    return { 'Content-Type': 'application/json' };
  }

  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    // Set cookie with HttpOnly flag
    document.cookie = `token=${token}; path=/; secure; samesite=strict`;
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    // Remove token cookie by setting an expired date
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  if (!token) {
    console.warn('No auth token found in cookies');
    return null;
  }
  
  return token;
}

export function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error('API URL not configured');
    throw new Error('API URL not configured');
  }
  return apiUrl;
}

export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.error('Site URL not configured');
    throw new Error('Site URL not configured');
  }
  return siteUrl;
}
