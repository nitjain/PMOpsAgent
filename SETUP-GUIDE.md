# Photo Gallery App - Complete Setup Guide

This guide will walk you through the complete setup process for deploying the Photo Gallery application.

## Table of Contents
1. [Azure Setup](#azure-setup)
2. [Local Development Setup](#local-development-setup)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [Testing](#testing)

## Azure Setup

### Step 1: Create Microsoft Entra ID App Registration

1. **Navigate to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Search for "Microsoft Entra ID" (formerly Azure Active Directory)

2. **Register a New Application**
   - Click on "App registrations" → "New registration"
   - Name: `PhotoGalleryApp`
   - Supported account types: Choose based on your needs
     - "Accounts in this organizational directory only" for single tenant
     - "Accounts in any organizational directory" for multi-tenant
   - Redirect URI:
     - Type: Single-page application (SPA)
     - URI: `http://localhost:4200` (for development)
   - Click "Register"

3. **Note Your Credentials**
   - Copy the **Application (client) ID**
   - Copy the **Directory (tenant) ID**
   - Save these for later configuration

4. **Configure Authentication**
   - Go to "Authentication" section
   - Under "Implicit grant and hybrid flows":
     - Check "Access tokens"
     - Check "ID tokens"
   - Add additional redirect URIs if needed:
     - Production URL (e.g., `https://your-app.azurestaticapps.net`)
   - Save changes

5. **Configure API Permissions**
   - Go to "API permissions"
   - Ensure "User.Read" permission is present (added by default)
   - Optional: Add "https://storage.azure.com/user_impersonation" if using Azure Storage auth
   - Grant admin consent if required by your organization

### Step 2: Create Azure Storage Account

1. **Create Storage Account**
   - In Azure Portal, click "Create a resource"
   - Search for "Storage account" and select it
   - Click "Create"

2. **Configure Storage Account**
   - Subscription: Select your subscription
   - Resource group: Create new or use existing
   - Storage account name: Choose a unique name (e.g., `photogallerystorage`)
   - Region: Select your preferred region
   - Performance: Standard
   - Redundancy: LRS (Locally-redundant storage) is sufficient for testing
   - Click "Review + create" → "Create"

3. **Create Blob Container**
   - Once deployed, go to the storage account
   - Navigate to "Containers" under "Data storage"
   - Click "+ Container"
   - Name: `photos`
   - Public access level: Private
   - Click "Create"

4. **Configure CORS**
   - Go to "Resource sharing (CORS)" under "Settings"
   - Add a CORS rule for Blob service:
     - Allowed origins: `http://localhost:4200` and your production URL
     - Allowed methods: GET, PUT, POST, DELETE, HEAD, OPTIONS
     - Allowed headers: `*`
     - Exposed headers: `*`
     - Max age: 3600
   - Click "Save"

5. **Generate SAS Token**
   - Go to "Shared access signature" under "Security + networking"
   - Configure permissions:
     - Allowed services: ✓ Blob
     - Allowed resource types: ✓ Container, ✓ Object
     - Allowed permissions: ✓ Read, ✓ Write, ✓ Delete, ✓ List
   - Set start and expiry date/time (e.g., 1 year from now)
   - Allowed protocols: HTTPS only
   - Click "Generate SAS and connection string"
   - Copy the **SAS token** (starts with `?sv=...`)

### Step 3: Create Azure Static Web App (for deployment)

1. **Create Static Web App**
   - In Azure Portal, click "Create a resource"
   - Search for "Static Web App" and select it
   - Click "Create"

2. **Configure Static Web App**
   - Subscription: Select your subscription
   - Resource group: Use same as storage account
   - Name: `photo-gallery-app`
   - Plan type: Free (for testing) or Standard (for production)
   - Region: Select closest to your users
   - Source: GitHub
   - Sign in to GitHub and authorize
   - Organization: Your GitHub organization
   - Repository: Select your repository
   - Branch: `main` (or your default branch)
   - Build Presets: Angular
   - App location: `/photo-gallery-app`
   - Output location: `dist/photo-gallery-app/browser`
   - Click "Review + create" → "Create"

3. **Note the Deployment Token**
   - After creation, go to the Static Web App resource
   - Click on "Manage deployment token"
   - Copy the token (this is automatically added to your GitHub secrets)

## Local Development Setup

### Step 1: Prerequisites

Ensure you have installed:
- Node.js (v18 or higher): [Download](https://nodejs.org/)
- npm (v9 or higher, comes with Node.js)
- Git: [Download](https://git-scm.com/)
- Code editor (VS Code recommended): [Download](https://code.visualstudio.com/)

### Step 2: Clone Repository

```bash
git clone https://github.com/nitjain/PMOpsAgent.git
cd PMOpsAgent/photo-gallery-app
```

### Step 3: Install Dependencies

```bash
npm install
```

## Configuration

### Step 1: Update Authentication Configuration

Edit `src/app/auth/auth-config.ts`:

```typescript
export const msalConfig: Configuration = {
  auth: {
    clientId: 'YOUR_CLIENT_ID', // Replace with Application (client) ID from Step 1
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with Directory (tenant) ID
    redirectUri: '/',
    postLogoutRedirectUri: '/'
  },
  // ... rest remains the same
};
```

### Step 2: Update Azure Storage Configuration

Edit `src/app/services/blob-storage.service.ts`:

```typescript
export class BlobStorageService {
  private sasToken = 'YOUR_SAS_TOKEN'; // Replace with SAS token from Step 2
  private storageAccountName = 'YOUR_STORAGE_ACCOUNT_NAME'; // Replace with storage account name
  private containerName = 'photos'; // Container name (change if different)
  
  // ... rest remains the same
}
```

**Security Note:** For production, store these values in environment variables or Azure Key Vault, not in source code.

### Step 3: Update Environment Files (Optional)

For better configuration management, update:

`src/environments/environment.ts` (Development):
```typescript
export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: 'YOUR_CLIENT_ID',
      authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
    }
  },
  azureStorage: {
    accountName: 'YOUR_STORAGE_ACCOUNT_NAME',
    sasToken: 'YOUR_SAS_TOKEN',
    containerName: 'photos'
  }
};
```

`src/environments/environment.prod.ts` (Production):
```typescript
// Same structure but with production values
```

## Deployment

### Automatic Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure Photo Gallery App"
   git push origin main
   ```

2. **GitHub Actions**
   - The push triggers the GitHub Actions workflow
   - Monitor progress in GitHub → Actions tab
   - Build and deployment typically takes 5-10 minutes

3. **Access Your App**
   - Once deployed, find your URL in Azure Portal
   - Navigate to your Static Web App resource
   - The URL is displayed on the Overview page
   - Format: `https://<app-name>.azurestaticapps.net`

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the application
cd photo-gallery-app
npm run build

# The build output is in dist/photo-gallery-app/browser/
```

Then use Azure CLI or Portal to deploy the build output.

## Testing

### Local Testing

1. **Start Development Server**
   ```bash
   cd photo-gallery-app
   npm start
   ```

2. **Access Application**
   - Open browser: `http://localhost:4200`
   - You'll see the login page

3. **Test Authentication**
   - Click "Sign in with Microsoft"
   - Sign in with your Azure AD account
   - Grant requested permissions
   - You should be redirected to the gallery page

4. **Test Upload**
   - Click the "Upload" button
   - Select an image or video file
   - Watch the upload progress
   - Verify the file appears in the gallery

5. **Test Photo Viewer**
   - Click on an uploaded photo
   - Verify the viewer modal opens
   - Test adding tags
   - Test marking as favorite
   - Test download
   - Test delete

6. **Test Search**
   - Add tags to some photos
   - Use the search bar to find photos
   - Test searching by filename and tags

### Production Testing

After deployment:

1. **Access Production URL**
   - Navigate to your Azure Static Web App URL

2. **Update Azure AD Redirect URIs**
   - Go to your App registration
   - Add your production URL to redirect URIs
   - Save changes

3. **Test All Features**
   - Login/logout
   - Upload (single and multiple files)
   - Drag and drop
   - Search and filtering
   - Photo viewer operations
   - Offline capabilities (disconnect internet)

### PWA Testing

1. **Install App**
   - In Chrome/Edge, click the install icon in the address bar
   - Or use browser menu → "Install Photo Gallery"

2. **Test Offline**
   - Open the installed app
   - Browse some photos (to cache them)
   - Disconnect from internet
   - Verify cached photos are still visible
   - Verify metadata is accessible

## Troubleshooting

### Common Issues

**Issue: "MSAL error during login"**
- Solution: Verify Client ID and Tenant ID are correct
- Check redirect URIs match your application URL
- Clear browser cache and cookies

**Issue: "Upload fails with CORS error"**
- Solution: Check CORS settings in Azure Storage
- Ensure your application URL is in allowed origins
- Verify SAS token permissions include Write

**Issue: "Photos not displaying"**
- Solution: Check browser console for errors
- Verify blob URLs are correct
- Check SAS token hasn't expired
- Ensure container exists and has correct name

**Issue: "Service worker not registering"**
- Solution: PWA only works over HTTPS (or localhost)
- Check browser DevTools → Application → Service Workers
- Clear cache and reload

### Getting Help

- Check browser console for detailed error messages
- Review Azure Portal logs for storage and authentication issues
- Verify all configuration values are correct
- Ensure all Azure resources are in the same region for best performance

## Next Steps

After successful setup:

1. **Customize Branding**
   - Update app icons in `src/assets/icons/`
   - Modify colors in `src/styles.scss`
   - Update manifest in `src/manifest.webmanifest`

2. **Enhance Security**
   - Move sensitive config to Azure Key Vault
   - Implement SAS token rotation
   - Set up Azure AD conditional access policies

3. **Add Features**
   - Implement AI tagging with Azure Computer Vision
   - Add album organization
   - Enable photo sharing
   - Implement advanced search filters

4. **Monitor Performance**
   - Set up Application Insights
   - Monitor blob storage metrics
   - Track authentication success rates
   - Analyze user engagement

## Security Best Practices

1. **Never commit sensitive data**
   - Add `.env` files to `.gitignore`
   - Use Azure Key Vault for production secrets

2. **Rotate credentials regularly**
   - SAS tokens should be rotated every 90 days
   - Update Client Secrets if using confidential clients

3. **Use HTTPS everywhere**
   - Enable HTTPS-only in Azure Static Web Apps
   - Configure HSTS headers

4. **Implement proper access controls**
   - Use Azure RBAC for resource access
   - Enable Azure AD conditional access
   - Implement MFA requirements

5. **Monitor security**
   - Enable Azure Security Center
   - Set up alerts for suspicious activities
   - Regularly review access logs

## Conclusion

You now have a fully functional Photo Gallery application with:
- ✅ Secure authentication via Microsoft Entra ID
- ✅ Cloud storage with Azure Blob Storage
- ✅ Offline capabilities with PWA
- ✅ Automated deployment with GitHub Actions
- ✅ Modern, responsive UI with Angular Material

For questions or issues, refer to the main README or open an issue in the GitHub repository.
