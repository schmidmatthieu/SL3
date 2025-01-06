'use client';

import { useState } from 'react';
import { Download, Eye, FileText, Film, Image as ImageIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type FileType = 'doc' | 'image' | 'video';

interface File {
  id: string;
  name: string;
  type: FileType;
  size: string;
  preview: string;
  downloadUrl: string;
}

const mockFiles: File[] = [
  {
    id: '1',
    name: 'Presentation.pdf',
    type: 'doc',
    size: '2.4 MB',
    preview: 'https://images.unsplash.com/photo-1622151834677-70f982c9adef',
    downloadUrl: '#',
  },
  {
    id: '2',
    name: 'Dashboard.png',
    type: 'image',
    size: '856 KB',
    preview: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12',
    downloadUrl: '#',
  },
  {
    id: '3',
    name: 'Demo.mp4',
    type: 'video',
    size: '15.2 MB',
    preview: 'https://images.unsplash.com/photo-1536240478700-b869070f9279',
    downloadUrl: '#',
  },
];

const fileTypeIcons = {
  doc: FileText,
  image: ImageIcon,
  video: Film,
};

interface FilesSectionProps {
  roomId: string;
}

export function FilesSection({ roomId }: FilesSectionProps) {
  const [selectedType, setSelectedType] = useState<FileType | null>(null);

  const filteredFiles = selectedType
    ? mockFiles.filter(file => file.type === selectedType)
    : mockFiles;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={selectedType === null ? 'secondary' : 'ghost'}
          onClick={() => setSelectedType(null)}
        >
          All
        </Button>
        <Button
          variant={selectedType === 'doc' ? 'secondary' : 'ghost'}
          onClick={() => setSelectedType('doc')}
        >
          Documents
        </Button>
        <Button
          variant={selectedType === 'image' ? 'secondary' : 'ghost'}
          onClick={() => setSelectedType('image')}
        >
          Images
        </Button>
        <Button
          variant={selectedType === 'video' ? 'secondary' : 'ghost'}
          onClick={() => setSelectedType('video')}
        >
          Videos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map(file => {
          const Icon = fileTypeIcons[file.type];

          return (
            <Card key={file.id} className="overflow-hidden">
              <div
                className="aspect-video w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${file.preview})` }}
              >
                <div className="w-full h-full bg-black/50 flex items-center justify-center">
                  <Icon className="h-12 w-12 text-white/80" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium line-clamp-1">{file.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {file.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{file.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="w-full" asChild>
                    <a href={file.downloadUrl} download>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" className="px-3">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
