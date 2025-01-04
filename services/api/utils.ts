export const getAuthHeaders = () => {
  try {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    const token = tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1].trim()) : null;

    console.log('Auth token status:', token ? 'Present' : 'Missing');

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (!token) {
      console.warn('No authentication token found in cookies');
      throw new ApiError('No authentication token found', 401);
    }

    headers['Authorization'] = `Bearer ${token}`;
    return headers;
  } catch (error) {
    console.error('Error getting auth headers:', error);
    throw new ApiError('Authentication failed', 401);
  }
};

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
    let errorData;

    try {
      if (isJson) {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        errorData = await response.text();
      }

      console.error('API Error:', {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        data: errorData,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Gérer spécifiquement les erreurs d'authentification
      if (response.status === 401) {
        window.location.href = '/login';
        throw new ApiError('Session expired. Please login again.', response.status, errorData);
      }

      throw new ApiError(errorMessage, response.status, errorData);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to process response', response.status, error);
    }
  }

  try {
    if (isJson) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new ApiError('Failed to parse response', 500, error);
  }
};
