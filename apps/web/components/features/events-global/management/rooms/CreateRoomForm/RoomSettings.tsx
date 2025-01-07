'use client';

import { Switch } from '@/components/core/ui/switch';
import { Label } from '@/components/core/ui/label';

interface RoomSettingsProps {
  isPublic: boolean;
  chatEnabled: boolean;
  recordingEnabled: boolean;
  onPublicChange: (value: boolean) => void;
  onChatChange: (value: boolean) => void;
  onRecordingChange: (value: boolean) => void;
}

export function RoomSettings({
  isPublic,
  chatEnabled,
  recordingEnabled,
  onPublicChange,
  onChatChange,
  onRecordingChange,
}: RoomSettingsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center space-x-2">
        <Switch id="public" checked={isPublic} onCheckedChange={onPublicChange} />
        <Label htmlFor="public">Public Room</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="chat" checked={chatEnabled} onCheckedChange={onChatChange} />
        <Label htmlFor="chat">Enable Chat</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="recording"
          checked={recordingEnabled}
          onCheckedChange={onRecordingChange}
        />
        <Label htmlFor="recording">Enable Recording</Label>
      </div>
    </div>
  );
}
