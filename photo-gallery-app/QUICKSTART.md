# Quick Start Guide - Photo Gallery App

Get the Photo Gallery app running in under 10 minutes!

## Prerequisites

- Node.js 18+ and npm installed
- Azure account (free tier works)
- GitHub account

## Step 1: Azure Configuration (5 minutes)

### Create Microsoft Entra ID App

1. Go to [Azure Portal](https://portal.azure.com) → Microsoft Entra ID → App registrations
2. Click "New registration"
   - Name: `PhotoGalleryApp`
   - Redirect URI: `http://localhost:4200` (SPA type)
3. Copy **Application (client) ID** and **Directory (tenant) ID**

### Create Storage Account

1. Go to Azure Portal → Create Storage Account
   - Name: Choose unique name (e.g., `photogallery123`)
   - Create container named `photos`
2. Go to Settings → Shared access signature
   - Check: Blob service, Container, Object
   - Permissions: Read, Write, Delete, List
   - Generate SAS token
   - Copy the **SAS token** (starts with `?sv=`)
3. Go to Settings → Resource sharing (CORS)
   - Add CORS rule:
     - Allowed origins: `http://localhost:4200`
     - Methods: GET, PUT, POST, DELETE
     - Headers: `*`

## Step 2: Configure Application (2 minutes)

1. Clone and navigate to project:
   ```bash
   git clone https://github.com/nitjain/PMOpsAgent.git
   cd PMOpsAgent/photo-gallery-app
   npm install
   ```

2. Edit `src/app/auth/auth-config.ts`:
   ```typescript
   clientId: 'YOUR_CLIENT_ID',  // From Step 1
   authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
   ```

3. Edit `src/app/services/blob-storage.service.ts`:
   ```typescript
   private sasToken = 'YOUR_SAS_TOKEN';  // From Step 1
   private storageAccountName = 'YOUR_STORAGE_ACCOUNT_NAME';
   ```

## Step 3: Run Application (1 minute)

```bash
npm start
```

Open browser: `http://localhost:4200`

## First Use

1. Click "Sign in with Microsoft"
2. Sign in with your Azure AD account
3. Click "Upload" or drag files to upload photos
4. Click on photos to view details, add tags, mark favorites

## What's Next?

- Read the [Full Documentation](README-PhotoGallery.md)
- Follow the [Complete Setup Guide](../SETUP-GUIDE.md) for production deployment
- Deploy to Azure Static Web Apps for hosting

## Troubleshooting

**Login fails?**
- Verify Client ID and Tenant ID are correct
- Check redirect URI is exactly `http://localhost:4200`

**Upload fails?**
- Check SAS token is valid and has Write permission
- Verify CORS is configured with `http://localhost:4200`
- Ensure container name is `photos` or update in code

**Photos don't display?**
- Clear browser cache and reload
- Check browser console for errors
- Verify Azure Storage container is accessible

## Support

For detailed help, see:
- [README](README-PhotoGallery.md) - Complete feature documentation
- [Setup Guide](../SETUP-GUIDE.md) - Detailed Azure configuration
- [GitHub Issues](https://github.com/nitjain/PMOpsAgent/issues) - Report bugs

---

🎉 **You're all set!** Start uploading and organizing your photos!
