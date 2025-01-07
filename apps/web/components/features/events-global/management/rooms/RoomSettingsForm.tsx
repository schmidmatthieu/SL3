import { Label } from '@/components/core/ui/label';
import { Switch } from '@/components/core/ui/switch';
import { Input } from '@/components/core/ui/input';

interface RoomSettingsFormProps {
  isPublic: boolean;
  chatEnabled: boolean;
  recordingEnabled: boolean;
  allowQuestions: boolean;
  capacity: string;
  onIsPublicChange: (value: boolean) => void;
  onChatEnabledChange: (value: boolean) => void;
  onRecordingEnabledChange: (value: boolean) => void;
  onAllowQuestionsChange: (value: boolean) => void;
  onCapacityChange: (value: string) => void;
}

export function RoomSettingsForm({
  isPublic,
  chatEnabled,
  recordingEnabled,
  allowQuestions,
  capacity,
  onIsPublicChange,
  onChatEnabledChange,
  onRecordingEnabledChange,
  onAllowQuestionsChange,
  onCapacityChange,
}: RoomSettingsFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Max Capacity</Label>
          <Input
            type="number"
            placeholder="Max capacity"
            value={capacity}
            onChange={e => onCapacityChange(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Public Room</Label>
          <Switch checked={isPublic} onCheckedChange={onIsPublicChange} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Enable Chat</Label>
          <Switch checked={chatEnabled} onCheckedChange={onChatEnabledChange} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Enable Recording</Label>
          <Switch checked={recordingEnabled} onCheckedChange={onRecordingEnabledChange} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Allow Questions</Label>
          <Switch checked={allowQuestions} onCheckedChange={onAllowQuestionsChange} />
        </div>
      </div>
    </div>
  );
}
