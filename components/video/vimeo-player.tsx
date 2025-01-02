'use client';

import { useEffect, useRef } from 'react';
import Player from '@vimeo/player';

interface VimeoPlayerProps {
  videoId: string;
  autoplay?: boolean;
  quality?: string;
}

export function VimeoPlayer({ videoId, autoplay = true, quality = 'auto' }: VimeoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const qualityMap: { [key: string]: string } = {
      auto: 'auto',
      '4k': '4k',
      '1440p': '2k',
      '1080p': '1080p',
      '720p': '720p',
      '480p': '480p',
      '360p': '360p',
    };

    playerRef.current = new Player(containerRef.current, {
      id: videoId,
      autoplay,
      controls: true,
      responsive: true,
      quality: qualityMap[quality] || 'auto',
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, autoplay, quality]);

  return <div ref={containerRef} className="aspect-video w-full" />;
}
