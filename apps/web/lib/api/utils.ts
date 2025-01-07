export const getAuthHeaders = (isMultipart = false) => {
  try {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    const token = tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1].trim()) : null;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Ne pas ajouter Content-Type pour FormData car le navigateur le fait automatiquement
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

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
  const isMultipart = contentType?.includes('multipart/form-data');

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
    let errorData;

    try {
      if (isJson) {
        errorData = await response.json();
      } else if (isMultipart) {
        errorData = await response.formData();
      } else {
        errorData = await response.text();
      }
      errorMessage = errorData.message || errorData || errorMessage;
    } catch (e) {
      console.error('Error parsing error response:', e);
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
  }

  try {
    if (isJson) {
      return await response.json();
    } else if (isMultipart) {
      return await response.formData();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new ApiError('Failed to parse response', 500);
  }
};
