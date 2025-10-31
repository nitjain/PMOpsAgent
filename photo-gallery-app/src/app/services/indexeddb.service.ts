import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Photo } from '../models/photo.model';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService extends Dexie {
  photos!: Table<Photo, string>;

  constructor() {
    super('PhotoGalleryDB');
    this.version(1).stores({
      photos: 'id, fileName, uploadDate, *tags, isFavorite'
    });
  }

  async addPhoto(photo: Photo): Promise<string> {
    return await this.photos.add(photo);
  }

  async updatePhoto(id: string, changes: Partial<Photo>): Promise<number> {
    return await this.photos.update(id, changes);
  }

  async deletePhoto(id: string): Promise<void> {
    await this.photos.delete(id);
  }

  async getPhoto(id: string): Promise<Photo | undefined> {
    return await this.photos.get(id);
  }

  async getAllPhotos(): Promise<Photo[]> {
    return await this.photos.orderBy('uploadDate').reverse().toArray();
  }

  async searchPhotos(query: string): Promise<Photo[]> {
    const lowerQuery = query.toLowerCase();
    return await this.photos
      .filter(photo => 
        photo.fileName.toLowerCase().includes(lowerQuery) ||
        photo.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
      .toArray();
  }

  async getPhotosByDateRange(startDate: Date, endDate: Date): Promise<Photo[]> {
    return await this.photos
      .where('uploadDate')
      .between(startDate, endDate)
      .reverse()
      .toArray();
  }

  async getFavoritePhotos(): Promise<Photo[]> {
    return await this.photos
      .where('isFavorite')
      .equals(1)
      .reverse()
      .toArray();
  }

  async clearAllPhotos(): Promise<void> {
    await this.photos.clear();
  }
}
