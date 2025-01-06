import { API_CONFIG } from './config';
import { getAuthHeaders, handleApiResponse } from './utils';

const fetchWithAuth = async (url: string, options: RequestInit = {}, isMultipart = false) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(isMultipart),
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

export interface MediaUsage {
  type: string;
  entityId: string;
  usedAt: string;
  entityName?: string;
}

export interface Media {
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
  usages?: MediaUsage[];
}

export const mediaService = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Sending file upload request:', {
        filename: file.name,
        type: file.type,
        size: file.size,
      });

      const response = await fetchWithAuth(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.media}/upload`,
        {
          method: 'POST',
          body: formData,
        },
        true // isMultipart = true
      );

      if (!response.url) {
        throw new Error('Invalid response from server: missing URL');
      }

      return response;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Erreur lors de l'upload de l'image: ${error.message}`);
    }
  },

  async getAll(type?: string): Promise<MediaItem[]> {
    const url = new URL(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.media}`);
    if (type) {
      url.searchParams.append('type', type);
    }
    const response = await fetchWithAuth(url.toString());
    return response;
  },

  async getUnused(): Promise<MediaItem[]> {
    return mediaService.getAll('unused');
  },

  async delete(_id: string): Promise<void> {
    await fetchWithAuth(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.media}/${_id}`, {
      method: 'DELETE',
    });
  },

  async addUsage(mediaId: string, usage: Omit<MediaUsage, 'usedAt'>): Promise<Media> {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.media}/${mediaId}/usage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usage),
      }
    );
    return response;
  },

  async removeUsage(mediaId: string, entityId: string): Promise<Media> {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.media}/${mediaId}/usage/${entityId}`,
      {
        method: 'DELETE',
      }
    );
    return response;
  },

  async updateUsageEntityName(
    type: MediaUsage['type'],
    entityId: string,
    entityName: string
  ): Promise<void> {
    await fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.media}/usage/${type}/${entityId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entityName }),
      }
    );
  },

  async updateMetadata(_id: string, metadata: MediaItem['metadata']): Promise<MediaItem> {
    return fetchWithAuth(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.media}/${_id}/metadata`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata }),
    });
  },

  async uploadFromUrl(url: string): Promise<UploadResponse> {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.media}/upload-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.url) {
        throw new Error('Invalid response from server: missing URL');
      }

      return response;
    } catch (error) {
      console.error('Error uploading image from URL:', error);
      throw new Error(`Erreur lors de l'import de l'image depuis l'URL: ${error.message}`);
    }
  },

  getImageUrl(filename: string): string {
    if (!filename) return '';
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Si l'URL est déjà complète, la retourner telle quelle
    if (filename.startsWith('http')) {
      return filename;
    }
    
    // Construire l'URL complète
    return `${apiUrl}${filename.startsWith('/') ? '' : '/'}${filename}`;
  },
};
