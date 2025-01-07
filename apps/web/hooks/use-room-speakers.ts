'use client';

import { useEffect, useState } from 'react';
import { Speaker } from '@/types/speaker';
import { useSpeakerStore } from '@/lib/store/speaker.store';

export function useRoomSpeakers(eventSlug: string, speakerIds?: string[]) {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSpeakers } = useSpeakerStore();

  useEffect(() => {
    const loadSpeakers = async () => {
      
      if (!eventSlug || !speakerIds?.length) {
        setSpeakers([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        const allSpeakers = await getSpeakers(eventSlug);
        
        if (!allSpeakers) {
          setSpeakers([]);
          return;
        }
        
        // Vérifier à la fois id et _id pour la compatibilité
        const roomSpeakers = allSpeakers.filter(speaker => 
          speakerIds.some(id => 
            id === speaker.id || 
            id === speaker._id || 
            id === speaker._id?.toString()
          )
        );
        
        setSpeakers(roomSpeakers);
      } catch (error) {
        console.error('useRoomSpeakers: Error loading room speakers:', error);
        setError(error instanceof Error ? error.message : 'Failed to load speakers');
        setSpeakers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpeakers();
  }, [eventSlug, speakerIds, getSpeakers]);

  return { speakers, isLoading, error };
}
