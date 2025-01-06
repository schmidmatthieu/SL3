import { CreateSpeakerDto, Speaker, UpdateSpeakerDto } from '@/types/speaker';
import { API_CONFIG } from './config';
import { getAuthHeaders, handleApiResponse } from './utils';

class SpeakerService {
  private async fetchWithAuth(url: string, options: RequestInit = {}, isMultipart = false) {
    const headers = await getAuthHeaders(isMultipart);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });
    return handleApiResponse(response);
  }

  async getAll(eventId: string): Promise<Speaker[]> {
    return this.fetchWithAuth(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers`);
  }

  async getById(eventId: string, speakerId: string): Promise<Speaker> {
    return this.fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers/${speakerId}`
    );
  }

  async create(eventId: string, data: CreateSpeakerDto): Promise<Speaker> {
    const payload = {
      ...data,
      eventId, // S'assurer que l'eventId est inclus
    };

    return this.fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
  }

  async update(eventId: string, speakerId: string, data: UpdateSpeakerDto): Promise<Speaker> {
    const payload = {
      ...data,
      eventId, // S'assurer que l'eventId est inclus
    };

    return this.fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers/${speakerId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
  }

  async delete(eventId: string, speakerId: string): Promise<void> {
    return this.fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers/${speakerId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async uploadImage(eventId: string, speakerId: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers/${speakerId}/image`,
      {
        method: 'POST',
        body: formData,
      },
      true // isMultipart = true
    );
  }
}

export const speakerService = new SpeakerService();
