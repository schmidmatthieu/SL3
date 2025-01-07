import { API_CONFIG } from '../config/api.config';
import { Speaker } from '../../types/speaker';

interface CreateSpeakerDto {
  name: string;
  bio?: string;
  imageUrl?: string;
  eventSlug: string;
  languages?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

interface UpdateSpeakerDto extends Partial<CreateSpeakerDto> {}

class SpeakerService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    console.log('SpeakerService: Fetching URL:', url);
    
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    if (!token) {
      console.error('SpeakerService: No access token found in cookies');
      throw new Error('Authentication required');
    }

    console.log('SpeakerService: Token found, adding to headers');
    
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('SpeakerService: API Error:', { 
          status: response.status, 
          url,
          headers: headers,
          errorData 
        });
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('SpeakerService: API Response:', { url, data });
      return data;
    } catch (error) {
      console.error('SpeakerService: Request failed:', error);
      throw error;
    }
  }

  async getAll(eventSlug: string): Promise<Speaker[]> {
    const response = await this.fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventSlug}/speakers`
    );
    const speakers = Array.isArray(response) ? response : response?.data || [];
    console.log('SpeakerService: Processed speakers:', speakers);
    return speakers;
  }

  async getById(eventSlug: string, speakerSlug: string): Promise<Speaker> {
    const response = await this.fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventSlug}/speakers/${speakerSlug}`
    );
    return response?.data || response;
  }

  async create(eventSlug: string, data: CreateSpeakerDto): Promise<Speaker> {
    const response = await this.fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventSlug}/speakers`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response?.data || response;
  }

  async update(eventSlug: string, speakerSlug: string, data: UpdateSpeakerDto): Promise<Speaker> {
    const response = await this.fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventSlug}/speakers/${speakerSlug}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response?.data || response;
  }

  async delete(eventSlug: string, speakerSlug: string): Promise<void> {
    console.log('SpeakerService: Deleting speaker:', speakerSlug, 'from event:', eventSlug);
    await this.fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventSlug}/speakers/${speakerSlug}`,
      {
        method: 'DELETE',
      }
    );
  }

  async uploadImage(eventSlug: string, speakerSlug: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventSlug}/speakers/${speakerSlug}/image`,
      {
        method: 'POST',
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data?.data || data;
  }
}

export const speakerService = new SpeakerService();
