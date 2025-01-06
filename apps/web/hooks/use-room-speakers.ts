'use client';

import { useEffect, useState } from 'react';
import { Speaker } from '@/types/speaker';
import { useSpeakerStore } from '@/lib/store/speaker.store';

export function useRoomSpeakers(eventId: string, speakerIds?: string[]) {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getSpeakers } = useSpeakerStore();

  useEffect(() => {
    const loadSpeakers = async () => {
      console.log('Loading speakers for room:', { eventId, speakerIds });
      
      if (!eventId || !speakerIds?.length) {
        console.log('No eventId or speakerIds, returning empty array');
        setSpeakers([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const allSpeakers = await getSpeakers(eventId);
        console.log('All speakers loaded:', allSpeakers);
        
        // Vérifier à la fois id et _id pour la compatibilité
        const roomSpeakers = allSpeakers.filter(speaker => 
          speakerIds.some(id => 
            id === speaker.id || 
            id === speaker._id || 
            id === speaker._id?.toString()
          )
        );
        console.log('Filtered room speakers:', roomSpeakers);
        
        setSpeakers(roomSpeakers);
      } catch (error) {
        console.error('Error loading room speakers:', error);
        setSpeakers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpeakers();
  }, [eventId, speakerIds, getSpeakers]);

  return { speakers, isLoading };
}
