'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { MediaUsageType } from '@/apps/api/src/modules/media/types/media.types';
import { useMediaStore } from '@/store/media.store';
import { validateMediaFile } from '@/utils/media-validators';
import { ImageIcon, Image as ImageLucide, Link as LinkIcon, Plus, Upload } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaManagement } from '@/components/admin/media-management';

const DEFAULT_PLACEHOLDER =
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop';

interface ImageUploaderProps {
  onImageSelect: (url: string) => void;
  currentImage?: string;
  mediaType?: MediaUsageType;
  entityId?: string;
  entityName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
}

export function ImageUploader({
  onImageSelect,
  currentImage,
  mediaType = 'unused',
  entityId,
  entityName,
  className,
  size = 'md',
  placeholder = DEFAULT_PLACEHOLDER,
}: ImageUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const { items, fetchAll, uploadMedia, uploadFromUrl, addUsage, isLoading } = useMediaStore();
  const [error, setError] = useState<string | null>(null);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchAll(mediaType);
    }
  }, [isOpen, fetchAll, mediaType]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const url = await uploadMedia(file);
      if (entityId && mediaType !== 'unused') {
        const mediaId = items.find(item => item.url === url)?._id;
        if (mediaId) {
          await addUsage(mediaId, {
            type: mediaType,
            entityId,
            entityName,
          });
        }
      }
      onImageSelect(url);
      setIsOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUrlSubmit = async () => {
    try {
      setError(null);
      const url = await uploadFromUrl(urlInput);
      if (entityId && mediaType !== 'unused') {
        const mediaId = items.find(item => item.url === url)?._id;
        if (mediaId) {
          await addUsage(mediaId, {
            type: mediaType,
            entityId,
            entityName,
          });
        }
      }
      onImageSelect(url);
      setIsOpen(false);
      setUrlInput('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExistingImageSelect = async (url: string) => {
    if (entityId && mediaType !== 'unused') {
      const mediaId = items.find(item => item.url === url)?._id;
      if (mediaId) {
        await addUsage(mediaId, {
          type: mediaType,
          entityId,
          entityName,
        });
      }
    }
    onImageSelect(url);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={cn('flex items-center gap-6', className)}>
          <div
            className={cn(
              'relative aspect-square rounded-lg overflow-hidden flex items-center justify-center',
              'bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-950 dark:to-primary-900',
              'ring-1 ring-primary-200 dark:ring-primary-800',
              'group cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all duration-200',
              sizeClasses[size]
            )}
          >
            {currentImage || placeholder ? (
              <>
                <div className="relative w-full h-full">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt="Image preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={placeholder}
                      alt="Placeholder"
                      fill
                      className={cn('object-cover opacity-50 grayscale')}
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                  <p className="text-sm text-white font-medium px-3 py-2 bg-primary-600/80 rounded-md backdrop-blur-sm">
                    {currentImage ? 'Modifier' : 'Choisir une image'}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-4">
                <ImageLucide className="w-8 h-8 text-primary-400/40" />
                <p className="text-xs text-primary-600/60 text-center">Aucune image</p>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-1.5">
            <p className="text-sm text-muted-foreground">Formats acceptés :</p>
            <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
              JPG, PNG, GIF, SVG, WebP
            </p>
            <p className="text-sm text-muted-foreground">Taille maximale : 10MB</p>
            {currentImage && (
              <Button
                variant="link"
                className="h-auto p-0 text-sm mt-1 text-destructive justify-start hover:text-destructive/80"
                onClick={e => {
                  e.stopPropagation();
                  onImageSelect('');
                }}
              >
                Supprimer l'image
              </Button>
            )}
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-7xl">
        <DialogHeader className="space-y-1.5 pb-6">
          <DialogTitle className="text-2xl">Sélectionner une image</DialogTitle>
          <DialogDescription className="text-base">
            Choisissez une image depuis votre ordinateur, une URL ou la médiathèque
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            <TabsTrigger
              value="upload"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger
              value="url"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              URL
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Médiathèque
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-0 border-0">
            <Card>
              <CardContent className="pt-6 px-6 pb-8">
                <div className="flex flex-col gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="file-upload" className="text-base">
                      Fichier image
                    </Label>
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                      <div className="relative w-full">
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={() => document.getElementById('file-upload')?.click()}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            Choose File
                          </Button>
                          <span className="text-sm text-muted-foreground">No file chosen</span>
                        </div>
                        <Input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Formats acceptés : JPG, PNG, GIF, SVG, WebP. Taille maximale : 10MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="url" className="mt-0 border-0">
            <Card>
              <CardContent className="pt-6 px-6 pb-8">
                <div className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="image-url" className="text-base">
                      URL de l'image
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="image-url"
                        type="url"
                        placeholder="https://"
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleUrlSubmit()}
                        className="bg-primary hover:bg-primary/90 px-6"
                      >
                        Ajouter
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Entrez l'URL d'une image publiquement accessible
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-0 border-0">
            <Card className="overflow-visible">
              <CardContent className="pt-6 px-6 pb-8">
                <div className="h-[600px]">
                  <MediaManagement
                    onSelect={url => {
                      handleExistingImageSelect(url);
                    }}
                    mediaType={mediaType}
                    viewMode="grid"
                    hideHeader
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
