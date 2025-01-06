'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';

import { Button } from '@/components/core/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card';
import { ScrollArea } from '@/components/core/ui/scroll-area';

interface Slide {
  id: string;
  thumbnail: string;
  notes?: string;
}

const mockSlides: Slide[] = Array.from({ length: 10 }, (_, i) => ({
  id: `slide-${i + 1}`,
  thumbnail: `https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?slide=${i + 1}`,
  notes: i % 2 === 0 ? 'Speaker notes for this slide...' : undefined,
}));

export function PresentationArea() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < mockSlides.length) {
      setCurrentSlide(index);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="p-4 flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Presentation</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col gap-4 h-[calc(100%-4rem)]">
        <div className="relative flex-1 min-h-0 bg-black rounded-lg overflow-hidden">
          <img
            src={mockSlides[currentSlide].thumbnail}
            alt={`Slide ${currentSlide + 1}`}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>

        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToSlide(currentSlide - 1)}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Slide {currentSlide + 1} of {mockSlides.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToSlide(currentSlide + 1)}
              disabled={currentSlide === mockSlides.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-24 shrink-0 rounded-md border">
          <div className="flex gap-2 p-2">
            {mockSlides.map((slide, index) => (
              <button
                key={slide.id}
                className={`relative flex-shrink-0 w-32 aspect-video rounded-md overflow-hidden border-2 transition-colors ${
                  index === currentSlide
                    ? 'border-primary'
                    : 'border-transparent hover:border-primary/50'
                }`}
                onClick={() => goToSlide(index)}
              >
                <img
                  src={slide.thumbnail}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
