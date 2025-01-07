'use client';

import { Input } from '@/components/core/ui/input';
import { Label } from '@/components/core/ui/label';
import { ImageUploader } from '@/components/core/ui/image-uploader';

interface RoomBasicInfoProps {
  name: string;
  capacity: string;
  description: string;
  thumbnail: string;
  eventSlug: string;
  onNameChange: (value: string) => void;
  onCapacityChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onThumbnailChange: (value: string) => void;
}

export function RoomBasicInfo({
  name,
  capacity,
  description,
  thumbnail,
  eventSlug,
  onNameChange,
  onCapacityChange,
  onDescriptionChange,
  onThumbnailChange,
}: RoomBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Room name"
          value={name}
          onChange={e => onNameChange(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Max capacity"
          value={capacity}
          onChange={e => onCapacityChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          placeholder="Description"
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
        />
        <div className="space-y-2">
          <Label>Image de couverture</Label>
          <ImageUploader
            currentImage={thumbnail}
            onImageSelect={onThumbnailChange}
            mediaType="room"
            entityId={eventSlug}
            entityName={name}
          />
        </div>
      </div>
    </div>
  );
}
