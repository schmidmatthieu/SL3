"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Maximize2, Settings } from 'lucide-react';
import Image from 'next/image';

interface StreamPreviewProps {
  roomId: string;
}

export function StreamPreview({ roomId }: StreamPreviewProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Stream Preview</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">LIVE</Badge>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <div className="relative h-full bg-black">
          <Image
            src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04"
            alt="Stream Preview"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm">
            <Eye className="h-4 w-4" />
            <span>1.2k watching</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}