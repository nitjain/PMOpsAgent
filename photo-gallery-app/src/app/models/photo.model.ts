export interface Photo {
  id: string;
  fileName: string;
  blobUrl: string;
  thumbnailUrl?: string;
  uploadDate: Date;
  size: number;
  mimeType: string;
  tags: string[];
  isFavorite: boolean;
  metadata?: {
    width?: number;
    height?: number;
    location?: string;
  };
}

export interface PhotoGroup {
  period: string; // e.g., "January 2024"
  photos: Photo[];
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}
