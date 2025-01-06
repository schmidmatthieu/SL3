'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';

import 'video.js/dist/video-js.css';

import type Player from 'video.js/dist/types/player';

import { Card } from '@/components/core/ui/card';
import { VimeoPlayer } from '@/components/video/vimeo-player';
import { YouTubePlayer } from '@/components/video/youtube-player';

interface VideoPlayerProps {
  url: string;
  type: 'live' | 'vod';
  vodSource?: 'youtube' | 'vimeo' | 'custom';
  autoplay?: boolean;
  quality?: string;
  className?: string;
  playerSettings?: {
    theme?: string;
    playbackRates?: number[];
    fluid?: boolean;
    responsive?: boolean;
  };
}

export function VideoPlayer({
  url,
  type,
  vodSource,
  autoplay = true,
  quality = 'auto',
  className,
  playerSettings = {
    theme: 'city',
    playbackRates: [0.5, 1, 1.5, 2],
    fluid: true,
    responsive: true,
  },
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize VideoJS player for HLS/custom streams
    if (type === 'live' || (type === 'vod' && vodSource === 'custom')) {
      // Load the selected theme CSS
      const themeUrl = `/videojs-themes/${playerSettings.theme}.css`;
      if (!document.querySelector(`link[href="${themeUrl}"]`)) {
        const link = document.createElement('link');
        link.href = themeUrl;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      playerRef.current = videojs(videoRef.current, {
        autoplay,
        controls: true,
        responsive: playerSettings.responsive,
        fluid: playerSettings.fluid,
        playbackRates: playerSettings.playbackRates,
        sources: [
          {
            src: url,
            type: url.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4',
          },
        ],
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: true,
          },
        },
      });

      // Add quality selector if HLS stream
      if (url.includes('.m3u8')) {
        playerRef.current.qualityLevels();

        // Set initial quality if specified
        if (quality !== 'auto' && playerRef.current.qualityLevels()) {
          const levels = playerRef.current.qualityLevels();
          for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            level.enabled = level.height === parseInt(quality);
          }
        }
      }

      return () => {
        if (playerRef.current) {
          playerRef.current.dispose();
          playerRef.current = null;
        }
      };
    }
  }, [url, type, vodSource, autoplay, quality, playerSettings]);

  // Helper to extract video IDs
  const getVideoId = (url: string, source: 'youtube' | 'vimeo'): string => {
    if (source === 'youtube') {
      const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
      );
      return match?.[1] || '';
    } else {
      const match = url.match(/(?:vimeo\.com\/)(\d+)/);
      return match?.[1] || '';
    }
  };

  // Render appropriate player based on type and source
  if (type === 'vod') {
    if (vodSource === 'youtube') {
      const videoId = getVideoId(url, 'youtube');
      return (
        <Card className={className}>
          <YouTubePlayer videoId={videoId} autoplay={autoplay} quality={quality} />
        </Card>
      );
    }

    if (vodSource === 'vimeo') {
      const videoId = getVideoId(url, 'vimeo');
      return (
        <Card className={className}>
          <VimeoPlayer videoId={videoId} autoplay={autoplay} quality={quality} />
        </Card>
      );
    }
  }

  // Default VideoJS player for live streams and custom VOD
  return (
    <Card className={className}>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className={`video-js vjs-big-play-centered vjs-theme-${playerSettings.theme}`}
        />
      </div>
    </Card>
  );
}
