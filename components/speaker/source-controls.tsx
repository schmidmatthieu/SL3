"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Monitor,
  Film,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  StopCircle,
} from 'lucide-react';

type Source = 'camera' | 'screen' | 'media';

export function SourceControls() {
  const [activeSource, setActiveSource] = useState<Source>('camera');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold">Source Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={activeSource === 'camera' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setActiveSource('camera')}
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
          <Button
            variant={activeSource === 'screen' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setActiveSource('screen')}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Screen
          </Button>
          <Button
            variant={activeSource === 'media' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setActiveSource('media')}
          >
            <Film className="h-4 w-4 mr-2" />
            Media
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Audio Source</span>
            <Badge variant="secondary">Default Microphone</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Video Source</span>
            <Badge variant="secondary">HD Webcam</Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={isMuted ? 'destructive' : 'outline'}
            className="flex-1"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <MicOff className="h-4 w-4 mr-2" />
            ) : (
              <Mic className="h-4 w-4 mr-2" />
            )}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
          <Button
            variant={isVideoOff ? 'destructive' : 'outline'}
            className="flex-1"
            onClick={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? (
              <VideoOff className="h-4 w-4 mr-2" />
            ) : (
              <Video className="h-4 w-4 mr-2" />
            )}
            {isVideoOff ? 'Start Video' : 'Stop Video'}
          </Button>
        </div>

        {activeSource === 'screen' && (
          <Button className="w-full" variant="default">
            <ScreenShare className="h-4 w-4 mr-2" />
            Share Screen
          </Button>
        )}
      </CardContent>
    </Card>
  );
}