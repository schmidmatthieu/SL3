"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { VideoPlayer } from '@/components/video/video-player';
import { useStreamStore } from '@/lib/stores/stream-store';

interface StreamPreviewProps {
  roomId: string;
}

export function StreamPreview({ roomId }: StreamPreviewProps) {
  const config = useStreamStore(state => state.config);
  const viewerCount = 1234; // Replace with actual viewer count

  if (!config?.url) {
    return (
      <Card className="h-full">
        <CardHeader className="p-4 flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Stream Preview</CardTitle>
          <Badge variant="secondary">Offline</Badge>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0">
          <div className="h-full flex items-center justify-center bg-muted/50">
            <p className="text-muted-foreground">No stream configured</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="p-4 flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Stream Preview</CardTitle>
        <Badge variant="default">Live</Badge>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0 relative">
        <VideoPlayer
          url={config.url}
          type={config.type}
          vodSource={config.vodSource}
          autoplay={config.autoplay}
          quality={config.quality}
          className="h-full"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm">
          <Eye className="h-4 w-4" />
          <span>{viewerCount.toLocaleString()} watching</span>
        </div>
      </CardContent>
    </Card>
  );
}