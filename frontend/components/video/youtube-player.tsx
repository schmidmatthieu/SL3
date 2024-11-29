"use client";

import { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';

interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  quality?: string;
}

export function YouTubePlayer({ videoId, autoplay = true, quality = 'auto' }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);

  const qualityLevels: { [key: string]: string } = {
    'auto': 'default',
    '4k': 'hd2160',
    '1440p': 'hd1440',
    '1080p': 'hd1080',
    '720p': 'hd720',
    '480p': 'large',
    '360p': 'medium',
    '240p': 'small',
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: autoplay ? 1 : 0,
      controls: 1,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
  };

  useEffect(() => {
    if (playerRef.current && quality !== 'auto') {
      playerRef.current.setPlaybackQuality(qualityLevels[quality]);
    }
  }, [quality]);

  const onReady = (event: any) => {
    playerRef.current = event.target;
    if (quality !== 'auto') {
      event.target.setPlaybackQuality(qualityLevels[quality]);
    }
  };

  return (
    <div className="aspect-video">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        className="w-full h-full"
      />
    </div>
  );
}