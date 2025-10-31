# Photo Gallery App - Google Photos Style

A modern, client-side photo gallery application built with Angular 17, featuring Microsoft Entra ID authentication, Azure Blob Storage integration, and PWA capabilities.

## 📚 Documentation

- 🚀 **[Quick Start Guide](QUICKSTART.md)** - Get running in 10 minutes
- 📖 **[Complete Setup Guide](../SETUP-GUIDE.md)** - Detailed Azure configuration
- 🏗️ **[Architecture Documentation](ARCHITECTURE.md)** - System design and data flows
- ⚙️ **[Configuration Template](CONFIG-TEMPLATE.md)** - Configuration checklist

## Features

### 🔐 Authentication
- **Microsoft Entra ID Integration**: Secure login/logout using MSAL.js
- **Token Management**: Automatic token refresh and session management
- **Protected Routes**: Access restricted to authenticated users only

### 📤 Media Upload
- **Drag & Drop**: Intuitive drag-and-drop interface for file uploads
- **Multi-file Support**: Upload multiple photos and videos simultaneously
- **Progress Tracking**: Real-time upload progress indicators
- **Azure Blob Storage**: Direct upload to Azure using SAS tokens
- **Status Notifications**: Success/failure status for each upload

### 🖼️ Gallery & Timeline View
- **Grouped Display**: Photos organized by month/year
- **Infinite Scroll**: Seamless loading of additional content
- **Lazy Loading**: Optimized thumbnail loading for performance
- **IndexedDB Storage**: Local caching of metadata for offline access

### 🔍 Search & Filters
- **Local Search**: Find photos by filename or tags
- **Real-time Results**: Instant search feedback
- **Tag-based Filtering**: Organize and find photos using custom tags

### 👁️ Media Viewer
- **Full-size Preview**: Modal view for detailed photo inspection
- **Metadata Display**: View upload date, file size, and tags
- **Interactive Actions**:
  - Delete with confirmation
  - Download to local device
  - Mark as favorite
  - Add/remove tags

### 📱 Offline Support (PWA)
- **Service Workers**: Enabled for offline functionality
- **Cached Content**: View previously loaded photos without internet
- **IndexedDB**: Persistent storage of photo metadata and thumbnails
- **App-like Experience**: Install on mobile and desktop devices

## Technology Stack

- **Frontend Framework**: Angular 17 (Standalone Components)
- **UI Library**: Angular Material
- **Authentication**: MSAL.js (Microsoft Entra ID)
- **Cloud Storage**: Azure Blob Storage JavaScript SDK
- **Local Database**: IndexedDB via Dexie.js
- **PWA Support**: Angular Service Worker
- **Styling**: SCSS

## Prerequisites

Before running the application, you need:

1. **Azure Account** with:
   - Microsoft Entra ID (Azure AD) app registration
   - Azure Storage Account with Blob Storage
   - SAS token for blob access

2. **Node.js** (v18 or higher)
3. **npm** (v9 or higher)

## Configuration

### 1. Microsoft Entra ID Setup

1. Register an application in Azure Portal → Microsoft Entra ID → App registrations
2. Configure redirect URIs (e.g., `http://localhost:4200`)
3. Note your `Client ID` and `Tenant ID`

### 2. Azure Blob Storage Setup

1. Create a Storage Account in Azure Portal
2. Create a container named `photos` (or your preferred name)
3. Generate a SAS token with read, write, and delete permissions
4. Note your `Storage Account Name`

### 3. Update Configuration Files

Edit `/src/app/auth/auth-config.ts`:
```typescript
export const msalConfig: Configuration = {
  auth: {
    clientId: 'YOUR_CLIENT_ID', // Replace with your Client ID
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with your Tenant ID
    redirectUri: '/',
    postLogoutRedirectUri: '/'
  },
  // ... rest of config
};
```

Edit `/src/app/services/blob-storage.service.ts`:
```typescript
private sasToken = 'YOUR_SAS_TOKEN'; // Replace with your SAS token
private storageAccountName = 'YOUR_STORAGE_ACCOUNT_NAME'; // Replace with your storage account name
private containerName = 'photos'; // Replace with your container name
```

## Installation

```bash
# Navigate to the project directory
cd photo-gallery-app

# Install dependencies
npm install
```

## Development

```bash
# Start development server
npm start

# Or use Angular CLI directly
ng serve

# Application will be available at http://localhost:4200
```

## Build

```bash
# Build for production
npm run build

# Output will be in dist/photo-gallery-app/
```

## Deployment to Azure Static Web Apps

### Prerequisites
- GitHub repository connected to Azure Static Web Apps
- Azure subscription

### Setup

1. Create an Azure Static Web App in Azure Portal
2. Connect your GitHub repository
3. Configure build settings:
   - **App location**: `/photo-gallery-app`
   - **Output location**: `dist/photo-gallery-app/browser`
   - **Build command**: `npm install && npm run build`

### GitHub Actions

A GitHub Actions workflow is automatically created when you connect Azure Static Web Apps. The workflow file is typically located at `.github/workflows/azure-static-web-apps-<name>.yml`.

Example workflow configuration:
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/photo-gallery-app"
          output_location: "dist/photo-gallery-app/browser"
```

## Usage

### First Time Setup

1. **Login**: Click "Sign in with Microsoft" on the login page
2. **Grant Permissions**: Approve the requested permissions
3. **Start Uploading**: Click the "Upload" button or drag files to the page

### Uploading Photos

- **Button Upload**: Click the "Upload" button in the toolbar and select files
- **Drag & Drop**: Drag files from your computer directly to the gallery page
- **Multi-select**: Select multiple files at once for batch uploads

### Organizing Photos

- **Add Tags**: Click on a photo to open the viewer, then add tags
- **Mark Favorites**: Click the favorite button in the viewer
- **Search**: Use the search bar to find photos by name or tags

### Managing Photos

- **View Details**: Click on any photo to see its metadata
- **Download**: Click the download button in the photo viewer
- **Delete**: Click the delete button (confirmation required)

## Project Structure

```
photo-gallery-app/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── auth-config.ts          # MSAL configuration
│   │   ├── components/
│   │   │   ├── login/                  # Login page
│   │   │   ├── gallery/                # Main gallery view
│   │   │   └── photo-viewer/           # Photo detail modal
│   │   ├── guards/
│   │   │   └── auth.guard.ts           # Route protection
│   │   ├── models/
│   │   │   └── photo.model.ts          # TypeScript interfaces
│   │   ├── services/
│   │   │   ├── blob-storage.service.ts # Azure Blob operations
│   │   │   ├── indexeddb.service.ts    # Local storage
│   │   │   └── photo.service.ts        # Photo management
│   │   ├── app.component.ts            # Root component
│   │   ├── app.config.ts               # App configuration
│   │   └── app.routes.ts               # Routing configuration
│   ├── environments/
│   │   ├── environment.ts              # Development config
│   │   └── environment.prod.ts         # Production config
│   ├── assets/                         # Static assets
│   ├── manifest.webmanifest            # PWA manifest
│   └── index.html                      # Main HTML
├── angular.json                        # Angular configuration
├── ngsw-config.json                    # Service worker config
└── package.json                        # Dependencies
```

## Security Considerations

1. **Never commit sensitive data**: Add environment files to `.gitignore`
2. **Use environment variables**: Store credentials in Azure Key Vault or environment variables
3. **SAS Token Rotation**: Regularly rotate your SAS tokens
4. **Minimal Permissions**: Grant only necessary permissions to SAS tokens
5. **HTTPS Only**: Always use HTTPS in production

## Troubleshooting

### Authentication Issues
- Verify Client ID and Tenant ID are correct
- Check redirect URIs in Azure AD app registration
- Clear browser cache and try again

### Upload Failures
- Verify SAS token is valid and not expired
- Check container name matches configuration
- Ensure SAS token has write permissions
- Verify CORS settings in Azure Storage

### Offline Mode Not Working
- Check if service worker is registered (DevTools → Application → Service Workers)
- Verify `ngsw-config.json` is properly configured
- Clear service worker cache and reload

## Performance Optimization

- **Lazy Loading**: Images are loaded on-demand
- **Infinite Scroll**: Only visible photos are rendered
- **IndexedDB Caching**: Reduces API calls
- **Service Worker**: Caches static assets
- **Image Optimization**: Consider implementing thumbnail generation

## Future Enhancements

- AI-powered image tagging using Azure Computer Vision
- Sharing capabilities for photos and albums
- Advanced filters (date range, file type)
- Bulk operations (delete, download, tag)
- Album creation and management
- Collaborative features (comments, likes)

## License

This project is provided as-is for demonstration purposes.

## Support

For issues and questions, please refer to the Angular and Azure documentation:
- [Angular Documentation](https://angular.io/docs)
- [Azure Blob Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
