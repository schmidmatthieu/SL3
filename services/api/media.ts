import { API_CONFIG } from './config';
import { getAuthHeaders, handleApiResponse } from './utils';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    credentials: 'include',
  });
  return handleApiResponse(response);
};

export interface MediaItem {
  _id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  metadata?: {
    title?: string;
    description?: string;
    altText?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
  uploadedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
}

export const mediaService = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Sending file upload request:', {
      filename: file.name,
      type: file.type,
      size: file.size
    });

    const response = await fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.media}/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log('Upload response:', response);
    return response;
  },

  async getAll(): Promise<MediaItem[]> {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.media}`);
  },

  async delete(_id: string): Promise<void> {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.media}/${_id}`, {
      method: 'DELETE',
    });
  },

  async updateMetadata(_id: string, metadata: MediaItem['metadata']): Promise<MediaItem> {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.media}/${_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata }),
    });
  },

  getImageUrl(filename: string): string {
    return `${API_CONFIG.baseUrl}/uploads/${filename}`;
  }
};
