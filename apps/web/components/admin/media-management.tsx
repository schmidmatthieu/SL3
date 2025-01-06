import { useEffect, useState, useCallback } from 'react';
import { useMediaStore } from '@/store/media.store';
import cn from 'classnames';
import { Check, Copy, Grid, Info, List, Pencil, Trash2, Upload } from 'lucide-react';

import { MediaItem, MediaUsage } from '@/types/media';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const ITEMS_PER_PAGE = 20;

type ViewMode = 'grid' | 'list';
type GridSize = '2' | '3' | '4';

interface MediaManagementProps {
  onSelect?: (url: string) => void;
  mediaType?: string;
  viewMode?: ViewMode;
  hideHeader?: boolean;
}

export function MediaManagement({
  onSelect,
  mediaType,
  viewMode: initialViewMode = 'grid',
  hideHeader = false,
}: MediaManagementProps) {
  const {
    items: mediaItems,
    isLoading,
    error,
    fetchAll,
    uploadMedia,
    deleteMedia,
    updateMetadata,
  } = useMediaStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [gridSize, setGridSize] = useState<GridSize>('4');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsageType, setSelectedUsageType] = useState<string>('all');
  const { toast } = useToast();

  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    altText: '',
    seoTitle: '',
    seoDescription: '',
  });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (editingItem) {
      setEditForm({
        title: editingItem.metadata?.title || '',
        description: editingItem.metadata?.description || '',
        altText: editingItem.metadata?.altText || '',
        seoTitle: editingItem.metadata?.seoTitle || '',
        seoDescription: editingItem.metadata?.seoDescription || '',
      });
    }
  }, [editingItem]);

  const filteredItems = mediaItems.filter(item => {
    if (selectedUsageType === 'all') return true;
    if (selectedUsageType === 'unused') return !item.usages?.length;
    return item.usages?.some(usage => usage.type === selectedUsageType);
  });

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMedia(selectedFile);
      setSelectedFile(null);
      toast({
        title: 'Succès',
        description: 'Média téléchargé avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia(id);
      toast({
        title: 'Succès',
        description: 'Média supprimé avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du média',
        variant: 'destructive',
      });
    }
  };

  const handleMetadataUpdate = async () => {
    if (!editingItem) return;

    try {
      await updateMetadata(editingItem._id, editForm);
      setEditingItem(null);
      toast({
        title: 'Succès',
        description: 'Métadonnées mises à jour avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour des métadonnées',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
    toast({
      title: 'Succès',
      description: 'URL copiée dans le presse-papier',
    });
  };

  const handleSelect = useCallback((url: string) => {
    console.log('MediaManagement handleSelect called with:', { url, onSelect });
    
    if (!url) {
      console.error('No URL provided to handleSelect');
      return;
    }

    if (typeof onSelect !== 'function') {
      console.error('onSelect is not a function:', onSelect);
      return;
    }

    onSelect(url);
  }, [onSelect]);

  const handleCardClick = useCallback((e: React.MouseEvent, url: string) => {
    // Si l'événement vient d'un bouton, ne pas propager
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    console.log('Card clicked with URL:', url);
    if (typeof handleSelect === 'function') {
      handleSelect(url);
    }
  }, [handleSelect]);

  const renderUsageInfo = useCallback((usages: MediaUsage[] = []) => {
    if (!usages?.length) {
      return (
        <Badge
          variant="secondary"
          className="mt-2 bg-secondary-300 text-secondary-900 dark:bg-secondary-800 dark:text-secondary-100"
        >
          Non utilisé
        </Badge>
      );
    }

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full mt-2">
            <Info className="h-4 w-4 mr-2" />
            Utilisé dans {usages.length} endroit{usages.length > 1 ? 's' : ''}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Utilisations de l'image</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-4">
              {usages.map((usage, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {usage.type === 'profile'
                        ? 'Profil'
                        : usage.type === 'speaker'
                          ? 'Intervenant'
                          : usage.type === 'event'
                            ? 'Événement'
                            : usage.type === 'room'
                              ? 'Salle'
                              : usage.type === 'logo'
                                ? 'Logo'
                                : 'Autre'}
                    </Badge>
                    {usage.entityName && (
                      <span className="text-sm">{usage.entityName || 'Sans nom'}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Utilisé depuis le {new Date(usage.usedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }, []);

  if (error) {
    return <div className="text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Médiathèque</h2>
            <p className="text-sm text-muted-foreground">Gérez vos images et autres médias</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center sm:justify-between">
          <Select value={selectedUsageType} onValueChange={setSelectedUsageType}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par utilisation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="unused">Non utilisés</SelectItem>
              <SelectItem value="profile">Profils</SelectItem>
              <SelectItem value="speaker">Intervenants</SelectItem>
              <SelectItem value="event">Événements</SelectItem>
              <SelectItem value="room">Salles</SelectItem>
              <SelectItem value="logo">Logos</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={gridSize} onValueChange={(value: GridSize) => setGridSize(value)}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <SelectValue placeholder="Colonnes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 colonnes</SelectItem>
                <SelectItem value="3">3 colonnes</SelectItem>
                <SelectItem value="4">4 colonnes</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center rounded-md bg-primary/10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'h-9 w-9',
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'hover:bg-primary/20 text-primary'
                )}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn(
                  'h-9 w-9',
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'hover:bg-primary/20 text-primary'
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-auto flex-1 min-w-[200px] max-w-[300px]"
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              className="whitespace-nowrap"
            >
              {isLoading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            viewMode === 'grid'
              ? `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridSize} gap-6`
              : 'flex flex-col space-y-4'
          )}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="aspect-video animate-pulse bg-muted" />
              ))
            : viewMode === 'grid'
              ? paginatedItems.map(item => (
                  <Card
                    key={item._id}
                    className={cn(
                      'group relative overflow-visible border hover:border-primary/50 transition-colors',
                      onSelect && typeof onSelect === 'function' && 'cursor-pointer'
                    )}
                    onClick={(e) => handleCardClick(e, item.url)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-video bg-muted/30">
                        <img
                          src={item.url}
                          alt={item.alt || 'Media item'}
                          className="w-full h-full object-contain rounded-t-lg p-2"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate flex-1">{item.filename}</p>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                copyToClipboard(item.url);
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingItem(item);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(item._id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(item.size)}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {renderUsageInfo(item.usages)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : paginatedItems.map(item => (
                  <Card
                    key={item._id}
                    className={cn(
                      'group relative overflow-visible hover:border-primary/50 transition-colors',
                      onSelect && typeof onSelect === 'function' && 'cursor-pointer'
                    )}
                    onClick={(e) => handleCardClick(e, item.url)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-6">
                        <div className="relative h-24 w-36 shrink-0 bg-muted/30">
                          <img
                            src={item.url}
                            alt={item.alt || 'Media item'}
                            className="w-full h-full object-contain rounded-md p-1"
                            sizes="(max-width: 768px) 144px, 144px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="font-medium truncate">{item.filename}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{formatFileSize(item.size)}</span>
                                <span>•</span>
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {renderUsageInfo(item.usages)}
                              </div>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  copyToClipboard(item.url);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingItem(item);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDelete(item._id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier les métadonnées</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Modifiez les informations de votre fichier média ici. Cliquez sur enregistrer une
                fois terminé.
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="altText">Texte alternatif</Label>
                <Input
                  id="altText"
                  value={editForm.altText}
                  onChange={e => setEditForm({ ...editForm, altText: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="seoTitle">Titre SEO</Label>
                <Input
                  id="seoTitle"
                  value={editForm.seoTitle}
                  onChange={e => setEditForm({ ...editForm, seoTitle: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="seoDescription">Description SEO</Label>
                <Textarea
                  id="seoDescription"
                  value={editForm.seoDescription}
                  onChange={e => setEditForm({ ...editForm, seoDescription: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Annuler
              </Button>
              <Button onClick={handleMetadataUpdate}>Sauvegarder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function formatFileSize(size: number) {
  return `${(size / 1024).toFixed(2)} KB`;
}
