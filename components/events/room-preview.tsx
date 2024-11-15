"use client";

import { RoomStatus } from '@/types/room';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Play, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface RoomPreviewProps {
  status: RoomStatus;
  thumbnail: string;
  title: string;
}

export function RoomPreview({ status, thumbnail, title }: RoomPreviewProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
      <Image
        src={thumbnail}
        alt={title}
        fill
        className="object-cover transition-transform hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      {status === 'live' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/40 p-4">
            <Play className="h-8 w-8 text-white" fill="white" />
          </div>
        </div>
      )}
      
      {status === 'upcoming' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/40 p-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
        </div>
      )}
      
      {status === 'ended' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/40 p-4">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
        </div>
      )}
      
      {status === 'off' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/40 p-4">
            <XCircle className="h-8 w-8 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}