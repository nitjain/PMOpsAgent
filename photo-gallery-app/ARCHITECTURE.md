# Photo Gallery App - Architecture Documentation

## Overview

The Photo Gallery application is a modern, client-side web application built with Angular 17 that provides Google Photos-like functionality without requiring a backend server. All data operations happen directly between the browser and Azure cloud services.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             Angular 17 Application                        │  │
│  │                                                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐     │  │
│  │  │   Login    │  │  Gallery   │  │ Photo Viewer   │     │  │
│  │  │ Component  │  │ Component  │  │   Component    │     │  │
│  │  └────────────┘  └────────────┘  └────────────────┘     │  │
│  │         │                │                  │            │  │
│  │         └────────────────┴──────────────────┘            │  │
│  │                          │                               │  │
│  │         ┌────────────────┴────────────────┐              │  │
│  │         │                                 │              │  │
│  │    ┌────▼────┐  ┌──────────┐  ┌──────────▼─────┐        │  │
│  │    │  Auth   │  │  Photo   │  │  Blob Storage  │        │  │
│  │    │ Service │  │ Service  │  │    Service     │        │  │
│  │    └────┬────┘  └────┬─────┘  └────────┬───────┘        │  │
│  │         │            │                  │                │  │
│  │         │       ┌────▼──────┐           │                │  │
│  │         │       │ IndexedDB │           │                │  │
│  │         │       │  Service  │           │                │  │
│  │         │       └───────────┘           │                │  │
│  └─────────┼────────────┼──────────────────┼────────────────┘  │
│            │            │                  │                   │
│  ┌─────────▼────────┐   │        ┌─────────▼─────────┐         │
│  │   IndexedDB      │   │        │  Service Worker   │         │
│  │  (Dexie.js)      │◄──┘        │   (PWA Cache)     │         │
│  └──────────────────┘            └───────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                       │                          │
                       │                          │
         ┌─────────────▼───────┐    ┌─────────────▼──────────┐
         │  Microsoft Entra ID │    │  Azure Blob Storage    │
         │   (Azure AD/MSAL)   │    │  (Photo Storage)       │
         └─────────────────────┘    └────────────────────────┘
```

## Component Architecture

### 1. Presentation Layer

#### Login Component
- **Purpose**: Handle user authentication
- **Features**:
  - Microsoft login button
  - Error handling
  - Redirect to gallery on success
- **Dependencies**: MSAL Service

#### Gallery Component
- **Purpose**: Main photo browsing interface
- **Features**:
  - Photo grid with infinite scroll
  - Search functionality
  - Upload interface (button + drag & drop)
  - Photo grouping by date
  - Upload progress tracking
- **Dependencies**: Photo Service, MSAL Service

#### Photo Viewer Component
- **Purpose**: Detailed photo view and management
- **Features**:
  - Full-size photo display
  - Metadata viewing
  - Tag management
  - Favorite toggle
  - Download functionality
  - Delete with confirmation
- **Dependencies**: Photo Service

### 2. Service Layer

#### Auth Service (MSAL)
- **Purpose**: Manage authentication flow
- **Responsibilities**:
  - Login/logout operations
  - Token acquisition and refresh
  - User session management
- **Technology**: @azure/msal-angular, @azure/msal-browser

#### Photo Service
- **Purpose**: Central photo management
- **Responsibilities**:
  - Coordinate between IndexedDB and Blob Storage
  - Manage photo lifecycle (upload, update, delete)
  - Handle search and filtering
  - Maintain photo state (BehaviorSubject)
  - Track upload progress
- **Dependencies**: IndexedDB Service, Blob Storage Service

#### IndexedDB Service
- **Purpose**: Local data persistence
- **Responsibilities**:
  - Store photo metadata
  - Enable offline access
  - Provide fast local search
  - Cache photo information
- **Technology**: Dexie.js
- **Schema**:
  ```typescript
  photos: {
    id: string (primary key)
    fileName: string
    uploadDate: Date (indexed)
    tags: string[] (indexed)
    isFavorite: boolean (indexed)
    blobUrl: string
    size: number
    mimeType: string
  }
  ```

#### Blob Storage Service
- **Purpose**: Manage Azure Blob Storage operations
- **Responsibilities**:
  - Upload files with progress tracking
  - Delete blobs
  - Generate blob URLs
  - Download files
- **Technology**: @azure/storage-blob
- **Authentication**: SAS Token

### 3. Guard Layer

#### Auth Guard
- **Purpose**: Protect routes requiring authentication
- **Implementation**: Functional guard (Angular 17 style)
- **Behavior**: Redirect to login if not authenticated

## Data Flow

### Upload Flow

```
User selects files
       ↓
Gallery Component
       ↓
Photo Service.uploadFiles()
       ↓
    ┌──┴──┐
    ↓     ↓
Blob Storage Service    (parallel operations)
    ↓
Azure Blob Storage
    ↓
Upload Complete
    ↓
Photo Service creates metadata
    ↓
IndexedDB Service.addPhoto()
    ↓
Photo appears in gallery
```

### View Flow

```
App loads
       ↓
Photo Service.loadPhotos()
       ↓
IndexedDB Service.getAllPhotos()
       ↓
Photos$ BehaviorSubject updates
       ↓
Gallery Component displays photos
       ↓
User clicks photo
       ↓
Photo Viewer Component opens
       ↓
Display photo from Blob URL
```

### Search Flow

```
User enters search query
       ↓
Gallery Component.onSearch()
       ↓
Photo Service.searchPhotos()
       ↓
IndexedDB Service.searchPhotos()
       ↓
Filter by filename and tags
       ↓
Return matching photos
       ↓
Update gallery display
```

## Storage Strategy

### IndexedDB (Local)
**Stores:**
- Photo metadata
- Tags
- Favorite status
- Upload dates
- Blob URLs (references)

**Advantages:**
- Fast local access
- Offline capability
- No API calls for metadata
- Efficient search

**Limitations:**
- Not synchronized across devices
- Browser-specific storage

### Azure Blob Storage (Cloud)
**Stores:**
- Actual photo/video files
- Thumbnails (if generated)

**Advantages:**
- Unlimited storage
- Global accessibility
- Durability and reliability
- Cross-device access

**Limitations:**
- Requires internet connection
- API call latency

## Security Architecture

### Authentication Flow

```
1. User clicks "Sign in"
   ↓
2. MSAL initiates OAuth 2.0 flow
   ↓
3. Redirect to Microsoft login
   ↓
4. User authenticates
   ↓
5. Microsoft returns tokens
   ↓
6. MSAL stores tokens in localStorage
   ↓
7. Auth Guard allows access
   ↓
8. User can access protected routes
```

### Data Access Security

1. **Authentication**: Microsoft Entra ID (OAuth 2.0 + OpenID Connect)
2. **Authorization**: SAS Token for Blob Storage
3. **Transport**: HTTPS only
4. **Token Storage**: Browser localStorage (managed by MSAL)
5. **Token Expiration**: Automatic refresh by MSAL

### Security Considerations

| Security Aspect | Implementation |
|----------------|----------------|
| Authentication | Microsoft Entra ID with MSAL |
| Data in Transit | HTTPS/TLS |
| Storage Access | SAS tokens with time limits |
| Client-side Storage | IndexedDB (browser-managed) |
| Token Management | MSAL automatic refresh |
| CORS Protection | Configured in Azure Storage |

## Offline Capabilities (PWA)

### Service Worker Strategy

```
Asset Types:
├── App Shell (prefetch)
│   ├── index.html
│   ├── styles.css
│   ├── main.js
│   └── polyfills.js
├── Assets (lazy load)
│   └── Icons, fonts
└── Data (cache-first with freshness)
    └── Blob Storage URLs (7-day cache)
```

### Offline Behavior

**Available Offline:**
- View previously loaded photos
- Browse cached thumbnails
- Search cached metadata
- View photo details
- Read tags and favorites

**Requires Online:**
- Authentication/login
- Upload new photos
- Delete photos
- Download photos
- Sync across devices

## Performance Optimization

### Lazy Loading
- Images loaded on-demand as they enter viewport
- Infinite scroll pagination (20 photos per page)
- Component lazy loading for routes

### Caching Strategy
- Service Worker caches app shell
- IndexedDB caches metadata
- Service Worker caches recent blob URLs (7 days)

### Bundle Optimization
- Tree-shaking removes unused code
- Lazy-loaded routes reduce initial bundle
- AOT compilation for production

## Scalability Considerations

### Client-Side Scalability
- IndexedDB can handle thousands of records
- Virtual scrolling could be added for very large galleries
- Photo grouping reduces DOM elements

### Cloud Scalability
- Azure Blob Storage scales automatically
- SAS tokens enable direct client-to-storage access
- No backend bottleneck

### Limitations
- IndexedDB storage limits (typically 50-100 MB)
- Browser memory for large images
- SAS token management (need rotation)

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Angular | 17 | Application framework |
| UI Library | Angular Material | 17 | UI components |
| Auth | MSAL Angular | 3.x | Authentication |
| Storage | Azure Blob Storage SDK | 12.x | Cloud storage |
| Local DB | Dexie.js | 3.x | IndexedDB wrapper |
| PWA | Angular Service Worker | 17 | Offline support |
| Language | TypeScript | 5.x | Type-safe JavaScript |
| Styling | SCSS | - | CSS preprocessing |

## Deployment Architecture

### Development
```
Developer Machine
       ↓
  npm start
       ↓
Angular Dev Server (localhost:4200)
       ↓
Azure Services (Dev environment)
```

### Production
```
GitHub Repository
       ↓
GitHub Actions Workflow
       ↓
npm install & build
       ↓
Azure Static Web Apps
       ↓
CDN Distribution
       ↓
End Users
```

### CI/CD Pipeline

```yaml
Trigger: Push to main branch
    ↓
1. Checkout code
    ↓
2. Setup Node.js
    ↓
3. npm install
    ↓
4. npm run build
    ↓
5. Deploy to Azure Static Web Apps
    ↓
6. Automatic HTTPS provisioning
    ↓
7. Global CDN distribution
```

## Monitoring & Observability

### Client-Side Monitoring
- Browser console logs (development)
- Error boundaries for component errors
- Upload progress tracking
- Network request logging

### Azure Monitoring (Available)
- Azure Storage metrics
- Static Web App analytics
- Authentication success rates
- Application Insights (can be added)

## Future Enhancements

### Planned Features
1. **AI Tagging**: Azure Computer Vision integration
2. **Albums**: Group photos into collections
3. **Sharing**: Share photos via links
4. **Thumbnail Generation**: Server-side thumbnail creation
5. **Advanced Filters**: Date ranges, file types
6. **Batch Operations**: Multi-select and bulk actions

### Architectural Improvements
1. **Backend API**: For cross-device sync
2. **Real-time Sync**: SignalR for live updates
3. **Image Processing**: Azure Functions for optimization
4. **Search Enhancement**: Azure Cognitive Search
5. **CDN**: Azure CDN for faster image delivery

## Conclusion

This architecture provides:
- ✅ Secure authentication via Microsoft Entra ID
- ✅ Scalable cloud storage with Azure Blob Storage
- ✅ Fast local access with IndexedDB
- ✅ Offline capabilities with PWA
- ✅ Modern, maintainable codebase with Angular 17
- ✅ Simple deployment with Azure Static Web Apps

The client-side architecture eliminates backend complexity while providing a rich user experience comparable to Google Photos.
