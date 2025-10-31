import { Injectable } from '@angular/core';
import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { Observable, Subject } from 'rxjs';
import { UploadProgress } from '../models/photo.model';

@Injectable({
  providedIn: 'root'
})
export class BlobStorageService {
  private sasToken = 'YOUR_SAS_TOKEN'; // Replace with your SAS token
  private storageAccountName = 'YOUR_STORAGE_ACCOUNT_NAME'; // Replace with your storage account name
  private containerName = 'photos'; // Replace with your container name

  constructor() {}

  private getContainerClient(): ContainerClient {
    const blobServiceClient = new BlobServiceClient(
      `https://${this.storageAccountName}.blob.core.windows.net?${this.sasToken}`
    );
    return blobServiceClient.getContainerClient(this.containerName);
  }

  uploadFile(file: File): Observable<UploadProgress> {
    const subject = new Subject<UploadProgress>();
    const fileName = `${Date.now()}-${file.name}`;
    
    const containerClient = this.getContainerClient();
    const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(fileName);

    const uploadProgress: UploadProgress = {
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    };

    subject.next(uploadProgress);

    blockBlobClient.uploadData(file, {
      blobHTTPHeaders: {
        blobContentType: file.type
      },
      onProgress: (progress) => {
        const percentComplete = Math.round((progress.loadedBytes / file.size) * 100);
        uploadProgress.progress = percentComplete;
        subject.next({ ...uploadProgress });
      }
    }).then(() => {
      uploadProgress.status = 'success';
      uploadProgress.progress = 100;
      subject.next(uploadProgress);
      subject.complete();
    }).catch((error) => {
      uploadProgress.status = 'error';
      uploadProgress.error = error.message;
      subject.next(uploadProgress);
      subject.complete();
    });

    return subject.asObservable();
  }

  async deleteFile(blobName: string): Promise<void> {
    const containerClient = this.getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
  }

  getBlobUrl(blobName: string): string {
    return `https://${this.storageAccountName}.blob.core.windows.net/${this.containerName}/${blobName}`;
  }

  extractBlobNameFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1].split('?')[0];
  }

  async downloadFile(blobUrl: string, fileName: string): Promise<void> {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
}
