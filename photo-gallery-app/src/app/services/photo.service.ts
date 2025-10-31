import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { Photo, PhotoGroup, UploadProgress } from '../models/photo.model';
import { IndexedDbService } from './indexeddb.service';
import { BlobStorageService } from './blob-storage.service';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private photosSubject = new BehaviorSubject<Photo[]>([]);
  public photos$ = this.photosSubject.asObservable();

  private uploadProgressSubject = new BehaviorSubject<UploadProgress[]>([]);
  public uploadProgress$ = this.uploadProgressSubject.asObservable();

  constructor(
    private indexedDbService: IndexedDbService,
    private blobStorageService: BlobStorageService
  ) {
    this.loadPhotos();
  }

  async loadPhotos(): Promise<void> {
    const photos = await this.indexedDbService.getAllPhotos();
    this.photosSubject.next(photos);
  }

  uploadFiles(files: File[]): void {
    const uploadProgresses: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'pending'
    }));

    this.uploadProgressSubject.next(uploadProgresses);

    files.forEach((file, index) => {
      this.blobStorageService.uploadFile(file).subscribe({
        next: (progress) => {
          uploadProgresses[index] = progress;
          this.uploadProgressSubject.next([...uploadProgresses]);
        },
        complete: async () => {
          if (uploadProgresses[index].status === 'success') {
            const photo: Photo = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              fileName: file.name,
              blobUrl: this.blobStorageService.getBlobUrl(`${Date.now()}-${file.name}`),
              uploadDate: new Date(),
              size: file.size,
              mimeType: file.type,
              tags: [],
              isFavorite: false
            };

            await this.indexedDbService.addPhoto(photo);
            await this.loadPhotos();
          }
        }
      });
    });
  }

  async deletePhoto(photo: Photo): Promise<void> {
    try {
      const blobName = this.blobStorageService.extractBlobNameFromUrl(photo.blobUrl);
      await this.blobStorageService.deleteFile(blobName);
      await this.indexedDbService.deletePhoto(photo.id);
      await this.loadPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  async toggleFavorite(photo: Photo): Promise<void> {
    await this.indexedDbService.updatePhoto(photo.id, {
      isFavorite: !photo.isFavorite
    });
    await this.loadPhotos();
  }

  async updatePhotoTags(photoId: string, tags: string[]): Promise<void> {
    await this.indexedDbService.updatePhoto(photoId, { tags });
    await this.loadPhotos();
  }

  async searchPhotos(query: string): Promise<Photo[]> {
    return await this.indexedDbService.searchPhotos(query);
  }

  async getFavoritePhotos(): Promise<Photo[]> {
    return await this.indexedDbService.getFavoritePhotos();
  }

  groupPhotosByDate(photos: Photo[]): PhotoGroup[] {
    const groups = new Map<string, Photo[]>();

    photos.forEach(photo => {
      const date = new Date(photo.uploadDate);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!groups.has(monthYear)) {
        groups.set(monthYear, []);
      }
      groups.get(monthYear)!.push(photo);
    });

    return Array.from(groups.entries()).map(([period, photos]) => ({
      period,
      photos
    }));
  }

  async downloadPhoto(photo: Photo): Promise<void> {
    await this.blobStorageService.downloadFile(photo.blobUrl, photo.fileName);
  }

  clearUploadProgress(): void {
    this.uploadProgressSubject.next([]);
  }
}
