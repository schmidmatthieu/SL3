export const getAuthHeaders = () => {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  const token = tokenCookie ? tokenCookie.split('=')[1] : null;

  // Don't set Content-Type for FormData, let the browser set it with the boundary
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
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
  console.log('API Response:', {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    contentType,
    headers: Object.fromEntries(response.headers.entries())
  });
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
    try {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        errorMessage = errorData.message || errorMessage;
        throw new ApiError(errorMessage, response.status, errorData);
      } else {
        const textError = await response.text();
        console.error('API Error Response (text):', {
          status: response.status,
          statusText: response.statusText,
          text: textError,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new ApiError(textError || errorMessage, response.status);
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
      console.error('Error handling API response:', e);
      throw new ApiError(errorMessage, response.status);
    }
  }

  try {
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('API Success Response:', {
        status: response.status,
        data
      });
      return data;
    } else if (response.status === 204) {
      return null; // No content
    } else {
      const text = await response.text();
      console.warn('Unexpected response type:', {
        contentType,
        text,
        status: response.status
      });
      return text;
    }
  } catch (e) {
    console.error('Error parsing response:', e);
    throw new ApiError('Invalid response format', response.status);
  }
};
