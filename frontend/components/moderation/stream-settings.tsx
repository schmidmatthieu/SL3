"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { useStreamStore } from '@/lib/stores/stream-store';
import type { StreamConfig } from '@/lib/stores/stream-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Play, Video, Youtube, Twitch } from 'lucide-react';

interface StreamSettingsProps {
  roomId: string;
}

export function StreamSettings({ roomId }: StreamSettingsProps) {
  const { toast } = useToast();
  const { config: savedConfig, updateConfig } = useStreamStore();
  const [config, setConfig] = useState<StreamConfig>(savedConfig || {
    type: 'live' as const,
    url: '',
    vodSource: 'youtube' as const,
    autoplay: true,
    quality: 'auto',
    playerSettings: {
      theme: 'city',
      playbackRates: [0.5, 1, 1.5, 2],
      fluid: true,
      responsive: true,
    },
  });

  // Update local state when store changes
  useEffect(() => {
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, [savedConfig]);

  const handleSave = () => {
    // Validate URL based on type and source
    if (!config.url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Update the stream store
    updateConfig(config);

    toast({
      title: "Settings Saved",
      description: "Stream settings have been updated successfully.",
    });
  };

  const handleUrlChange = (url: string) => {
    setConfig(prev => ({ ...prev, url }));
  };

  const handleTypeChange = (type: 'live' | 'vod') => {
    setConfig(prev => ({ 
      ...prev, 
      type,
      url: '', // Reset URL when changing types
      vodSource: type === 'vod' ? 'youtube' : undefined,
    }));
  };

  const handleVodSourceChange = (vodSource: 'youtube' | 'vimeo' | 'custom') => {
    setConfig(prev => ({ ...prev, vodSource, url: '' }));
  };

  const handlePlayerSettingChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      playerSettings: {
        ...prev.playerSettings,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Stream Settings
        </h2>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Stream Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={config.type}
            onValueChange={handleTypeChange}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="live"
                id="live"
                className="peer sr-only"
              />
              <Label
                htmlFor="live"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Play className="mb-3 h-6 w-6" />
                <div className="text-sm font-medium">Live Streaming</div>
                <div className="text-xs text-muted-foreground">HLS/RTMP Stream</div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="vod"
                id="vod"
                className="peer sr-only"
              />
              <Label
                htmlFor="vod"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Video className="mb-3 h-6 w-6" />
                <div className="text-sm font-medium">Video on Demand</div>
                <div className="text-xs text-muted-foreground">Pre-recorded Content</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {config.type === 'live' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Live Stream Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Stream URL</Label>
                <Input
                  placeholder="Enter HLS stream URL (e.g., https://stream.example.com/live/stream.m3u8)"
                  value={config.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the HLS stream URL provided by your streaming service
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Player Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Player Theme</Label>
                <Select
                  value={config.playerSettings.theme}
                  onValueChange={(value) => handlePlayerSettingChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">City (Default)</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                    <SelectItem value="forest">Forest</SelectItem>
                    <SelectItem value="sea">Sea</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quality</Label>
                <Select
                  value={config.quality}
                  onValueChange={(quality) => setConfig(prev => ({ ...prev, quality }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Playback Speed Options</Label>
                <div className="flex flex-wrap gap-2">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <Button
                      key={rate}
                      variant={config.playerSettings.playbackRates?.includes(rate) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const currentRates = config.playerSettings.playbackRates || [];
                        const newRates = currentRates.includes(rate)
                          ? currentRates.filter(r => r !== rate)
                          : [...currentRates, rate].sort();
                        handlePlayerSettingChange('playbackRates', newRates);
                      }}
                    >
                      {rate}x
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {config.type === 'vod' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">VOD Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Video Source</Label>
              <RadioGroup
                value={config.vodSource}
                onValueChange={handleVodSourceChange}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="youtube"
                    id="youtube"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="youtube"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Youtube className="mb-2 h-6 w-6" />
                    <div className="text-sm font-medium">YouTube</div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="vimeo"
                    id="vimeo"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="vimeo"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Video className="mb-2 h-6 w-6" />
                    <div className="text-sm font-medium">Vimeo</div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="custom"
                    id="custom"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="custom"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Play className="mb-2 h-6 w-6" />
                    <div className="text-sm font-medium">Custom URL</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>
                {config.vodSource === 'youtube' && 'YouTube Video URL'}
                {config.vodSource === 'vimeo' && 'Vimeo Video URL'}
                {config.vodSource === 'custom' && 'Custom Video URL'}
              </Label>
              <Input
                placeholder={
                  config.vodSource === 'youtube'
                    ? 'Enter YouTube video URL'
                    : config.vodSource === 'vimeo'
                    ? 'Enter Vimeo video URL'
                    : 'Enter custom video URL (HLS/MP4)'
                }
                value={config.url}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                {config.vodSource === 'youtube' && 'Example: https://www.youtube.com/watch?v=VIDEO_ID'}
                {config.vodSource === 'vimeo' && 'Example: https://vimeo.com/VIDEO_ID'}
                {config.vodSource === 'custom' && 'Enter the direct URL to your video file (HLS or MP4)'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Playback Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Autoplay</Label>
            <input
              type="checkbox"
              checked={config.autoplay}
              onChange={(e) => setConfig(prev => ({ ...prev, autoplay: e.target.checked }))}
              className="toggle"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}