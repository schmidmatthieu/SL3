import { Label } from '@/components/core/ui/label';
import { MultiSelect, Option } from '@/components/core/ui/multi-select';
import { Speaker } from '@/types/speaker';

interface RoomSpeakersSelectProps {
  speakers: Speaker[];
  selectedSpeakers: Option[];
  isLoading: boolean;
  onChange: (selected: Option[]) => void;
}

export function RoomSpeakersSelect({
  speakers,
  selectedSpeakers,
  isLoading,
  onChange,
}: RoomSpeakersSelectProps) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="speakers" className="text-right">
        Speakers
      </Label>
      <div className="col-span-3">
        <MultiSelect
          id="speakers"
          isLoading={isLoading}
          options={speakers?.map(speaker => ({
            value: speaker._id,
            label: `${speaker.firstName} ${speaker.lastName}`,
          })) || []}
          value={selectedSpeakers}
          onChange={onChange}
          placeholder="Select speakers..."
        />
      </div>
    </div>
  );
}
