import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Photo } from '../../models/photo.model';
import { PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './photo-viewer.component.html',
  styleUrl: './photo-viewer.component.scss'
})
export class PhotoViewerComponent {
  photo: Photo;
  newTag = '';
  isDeleting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { photo: Photo },
    private dialogRef: MatDialogRef<PhotoViewerComponent>,
    private photoService: PhotoService
  ) {
    this.photo = { ...data.photo };
  }

  close(): void {
    this.dialogRef.close();
  }

  async toggleFavorite(): Promise<void> {
    await this.photoService.toggleFavorite(this.photo);
    this.photo.isFavorite = !this.photo.isFavorite;
  }

  async addTag(): Promise<void> {
    if (this.newTag.trim() && !this.photo.tags.includes(this.newTag.trim())) {
      this.photo.tags.push(this.newTag.trim());
      await this.photoService.updatePhotoTags(this.photo.id, this.photo.tags);
      this.newTag = '';
    }
  }

  async removeTag(tag: string): Promise<void> {
    this.photo.tags = this.photo.tags.filter(t => t !== tag);
    await this.photoService.updatePhotoTags(this.photo.id, this.photo.tags);
  }

  async downloadPhoto(): Promise<void> {
    await this.photoService.downloadPhoto(this.photo);
  }

  async deletePhoto(): Promise<void> {
    if (confirm('Are you sure you want to delete this photo?')) {
      this.isDeleting = true;
      try {
        await this.photoService.deletePhoto(this.photo);
        this.dialogRef.close();
      } catch (error) {
        console.error('Error deleting photo:', error);
        this.isDeleting = false;
        alert('Failed to delete photo. Please try again.');
      }
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
