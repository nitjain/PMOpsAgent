import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { PhotoService } from '../../services/photo.service';
import { Photo, PhotoGroup, UploadProgress } from '../../models/photo.model';
import { PhotoViewerComponent } from '../photo-viewer/photo-viewer.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  photos: Photo[] = [];
  photoGroups: PhotoGroup[] = [];
  uploadProgress: UploadProgress[] = [];
  searchQuery = '';
  isDragging = false;
  displayedPhotosCount = 20;
  userName = '';

  constructor(
    private photoService: PhotoService,
    private msalService: MsalService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const account = this.msalService.instance.getActiveAccount();
    if (account) {
      this.userName = account.name || account.username;
    }

    this.photoService.photos$.subscribe(photos => {
      this.photos = photos;
      this.photoGroups = this.photoService.groupPhotosByDate(photos);
    });

    this.photoService.uploadProgress$.subscribe(progress => {
      this.uploadProgress = progress;
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
      this.loadMorePhotos();
    }
  }

  loadMorePhotos(): void {
    this.displayedPhotosCount += 20;
  }

  onFileSelected(event: any): void {
    const files: File[] = Array.from(event.target.files);
    this.uploadFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files: File[] = [];
    if (event.dataTransfer?.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === 'file') {
          const file = event.dataTransfer.items[i].getAsFile();
          if (file && this.isValidMediaFile(file)) {
            files.push(file);
          }
        }
      }
    } else if (event.dataTransfer?.files) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files[i];
        if (this.isValidMediaFile(file)) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      this.uploadFiles(files);
    }
  }

  isValidMediaFile(file: File): boolean {
    return file.type.startsWith('image/') || file.type.startsWith('video/');
  }

  uploadFiles(files: File[]): void {
    this.photoService.uploadFiles(files);
  }

  openPhoto(photo: Photo): void {
    this.dialog.open(PhotoViewerComponent, {
      data: { photo },
      panelClass: 'photo-viewer-dialog',
      maxWidth: '95vw',
      maxHeight: '95vh'
    });
  }

  async onSearch(): Promise<void> {
    if (this.searchQuery.trim()) {
      const results = await this.photoService.searchPhotos(this.searchQuery);
      this.photos = results;
      this.photoGroups = this.photoService.groupPhotosByDate(results);
    } else {
      await this.photoService.loadPhotos();
    }
  }

  clearUploadProgress(): void {
    this.photoService.clearUploadProgress();
  }

  logout(): void {
    this.msalService.logout();
  }

  getVisiblePhotos(photos: Photo[]): Photo[] {
    return photos.slice(0, this.displayedPhotosCount);
  }
}
