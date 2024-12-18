import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Upload, Copy, Check } from 'lucide-react';
import { mediaService, MediaItem } from '@/services/api/media';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function MediaManagement() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    altText: '',
    seoTitle: '',
    seoDescription: ''
  });

  useEffect(() => {
    loadMediaItems();
  }, []);

  useEffect(() => {
    if (editingItem) {
      setEditForm({
        title: editingItem.metadata?.title || '',
        description: editingItem.metadata?.description || '',
        altText: editingItem.metadata?.altText || '',
        seoTitle: editingItem.metadata?.seoTitle || '',
        seoDescription: editingItem.metadata?.seoDescription || ''
      });
    }
  }, [editingItem]);

  const loadMediaItems = async () => {
    try {
      const items = await mediaService.getAll();
      setMediaItems(items);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load media items",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Error",
        description: "File type not allowed. Please upload a JPEG, PNG, GIF, or SVG image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (20MB)
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size too large. Maximum size is 20MB.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Uploading file:', selectedFile); // Add logging for debugging
      const response = await mediaService.uploadImage(selectedFile);
      console.log('Upload response:', response); // Add logging for debugging
      await loadMediaItems();
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error); // Add logging for debugging
      toast({
        title: "Error",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (_id: string) => {
    try {
      await mediaService.delete(_id);
      setMediaItems(prev => prev.filter(item => item._id !== _id));
      toast({
        title: "Success",
        description: "Media deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
  };

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
    toast({
      title: "Success",
      description: "URL copied to clipboard",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const updatedItem = await mediaService.updateMetadata(editingItem._id, {
        ...editingItem.metadata,
        title: editForm.title,
        description: editForm.description,
        altText: editForm.altText,
        seoTitle: editForm.seoTitle,
        seoDescription: editForm.seoDescription
      });

      setMediaItems(prev => prev.map(item => 
        item._id === editingItem._id ? updatedItem : item
      ));

      setEditingItem(null);
      toast({
        title: "Success",
        description: "Media updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update media",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Upload New Media</h3>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="media">Media File</Label>
            <Input
              id="media"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaItems.map((item) => (
          <Card key={item._id} className="p-4">
            <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
              <img
                src={item.url}
                alt={item.metadata?.altText || item.metadata?.title || item.filename}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="mt-4 space-y-2">
              <p className="font-medium truncate">{item.metadata?.title || item.filename}</p>
              {item.metadata?.description && (
                <p className="text-sm text-gray-500 truncate">{item.metadata.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button
                  onClick={() => handleCopyUrl(item.url)}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  {copiedUrl === item.url ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy URL
                </button>
                <span className="truncate flex-1">{item.url}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="altText">Alt Text</Label>
              <Input
                id="altText"
                value={editForm.altText}
                onChange={(e) => setEditForm(prev => ({ ...prev, altText: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={editForm.seoTitle}
                onChange={(e) => setEditForm(prev => ({ ...prev, seoTitle: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={editForm.seoDescription}
                onChange={(e) => setEditForm(prev => ({ ...prev, seoDescription: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
