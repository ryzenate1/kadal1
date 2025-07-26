"use client";

import { useState, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Folder, Upload, Search, Loader2, Trash2, Copy, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiStatus } from '@/components/dashboard/api-status';

interface MediaItem {
  id: string;
  name: string;
  type: string; // 'image', 'video', etc.
  url: string;
  thumbnailUrl: string;
  size: number; // in bytes
  dimensions?: {
    width: number;
    height: number;
  };
  folder: string;
  uploadDate: string;
}

// Mock data for media items
const mockMediaItems: MediaItem[] = Array.from({ length: 20 }, (_, i) => {
  const type = i % 5 === 0 ? 'video' : 'image';
  const folder = i % 3 === 0 ? 'products' : i % 3 === 1 ? 'banners' : 'categories';
  
  return {
    id: `media-${i + 1}`,
    name: `${type === 'image' ? 'Image' : 'Video'}-${i + 1}.${type === 'image' ? 'jpg' : 'mp4'}`,
    type,
    url: `https://placekitten.com/${800 + i}/${600 + i}`,
    thumbnailUrl: `https://placekitten.com/${200 + i}/${150 + i}`,
    size: Math.floor(Math.random() * 5000000) + 500000, // Random size between 500KB and 5MB
    dimensions: {
      width: 800 + i,
      height: 600 + i,
    },
    folder,
    uploadDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
  };
});

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(mockMediaItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterFolder, setFilterFolder] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
  const { toast } = useToast();

  // Convert bytes to readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Get unique folder names from media items
  const folders = Array.from(new Set(mediaItems.map(item => item.folder)));

  // Handle media selection
  const toggleMediaSelection = (id: string) => {
    if (selectedMedia.includes(id)) {
      setSelectedMedia(selectedMedia.filter(item => item !== id));
    } else {
      setSelectedMedia([...selectedMedia, id]);
    }
  };

  // Handle bulk selection
  const selectAll = () => {
    if (selectedMedia.length === filteredMedia.length) {
      setSelectedMedia([]);
    } else {
      setSelectedMedia(filteredMedia.map(item => item.id));
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // In a real application, you would upload these files to your server
      // For now, just simulate the upload process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newMedia: MediaItem[] = Array.from(e.target.files).map((file, index) => {
        const id = `temp-${Date.now()}-${index}`;
        const fileUrl = URL.createObjectURL(file);
        
        return {
          id,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: fileUrl,
          thumbnailUrl: fileUrl,
          size: file.size,
          folder: filterFolder !== 'all' ? filterFolder : 'uploads',
          uploadDate: new Date().toISOString(),
        };
      });
      
      setMediaItems([...newMedia, ...mediaItems]);
      
      toast({
        title: "Files Uploaded",
        description: `${newMedia.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your files.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle bulk delete
  const handleDelete = async () => {
    if (selectedMedia.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedMedia.length} selected item(s)?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // In a real application, you would send a delete request to your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMediaItems(mediaItems.filter(item => !selectedMedia.includes(item.id)));
      setSelectedMedia([]);
      
      toast({
        title: "Files Deleted",
        description: `${selectedMedia.length} file(s) deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "There was a problem deleting the selected files.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy URL to clipboard
  const copyUrlToClipboard = useCallback((url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "Media URL copied to clipboard",
      });
    });
  }, [toast]);

  // Apply filters and sorting
  const filteredMedia = mediaItems
    .filter(item => {
      // Filter by search term
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by type
      if (filterType !== 'all' && item.type !== filterType) {
        return false;
      }
      
      // Filter by folder
      if (filterFolder !== 'all' && item.folder !== filterFolder) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected order
      if (sortOrder === 'newest') {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <DashboardHeader
        title="Media Library"
        description="Manage your images, videos, and other media files."      />

      {/* API Connection Status */}
      <ApiStatus endpoint="media" />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search media files..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterFolder} onValueChange={setFilterFolder}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Folders</SelectItem>
              {folders.map(folder => (
                <SelectItem key={folder} value={folder}>{folder}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest' | 'name') => setSortOrder(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="relative"
            disabled={isUploading}
          >
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload
          </Button>
          
          {selectedMedia.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Selected
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
          {selectedMedia.length > 0 && ` (${selectedMedia.length} selected)`}
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <ImageIcon size={48} className="text-gray-300" />
            <h3 className="text-xl font-medium text-gray-700 mt-4">No media found</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm || filterType !== 'all' || filterFolder !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload files to get started'}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedMedia.length > 0 && selectedMedia.length === filteredMedia.length}
                onChange={selectAll}
                className="mr-2 h-4 w-4"
              />
              <CardTitle className="text-base flex-1">Name</CardTitle>
              <div className="hidden md:block w-32 text-sm text-right">Size</div>
              <div className="hidden md:block w-32 text-sm text-right">Type</div>
              <div className="hidden md:block w-32 text-sm text-right">Dimensions</div>
              <div className="w-32 text-right text-sm">Actions</div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredMedia.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 ${
                    selectedMedia.includes(item.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMedia.includes(item.id)}
                    onChange={() => toggleMediaSelection(item.id)}
                    className="mr-2 h-4 w-4"
                  />
                  
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="h-10 w-10 rounded bg-gray-100 mr-3 flex items-center justify-center overflow-hidden">
                      {item.type === 'image' ? (
                        <img 
                          src={item.thumbnailUrl} 
                          alt={item.name}
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <ImageIcon size={16} className="text-gray-400" />
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Folder className="h-3 w-3 mr-1" />
                        {item.folder}
                        <span className="mx-1">·</span>
                        <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden md:block w-32 text-right text-sm text-gray-600">
                    {formatBytes(item.size)}
                  </div>
                  
                  <div className="hidden md:block w-32 text-right text-sm">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      item.type === 'image' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  
                  <div className="hidden md:block w-32 text-right text-sm text-gray-600">
                    {item.dimensions ? `${item.dimensions.width}x${item.dimensions.height}` : 'N/A'}
                  </div>
                  
                  <div className="flex gap-2 justify-end w-32">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-gray-500"
                      onClick={() => copyUrlToClipboard(item.url)}
                    >
                      <Copy size={14} />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => {
                        setSelectedMedia([item.id]);
                        handleDelete();
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination if needed */}
      {filteredMedia.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="bg-gray-100">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      )}
    </div>
  );
} 