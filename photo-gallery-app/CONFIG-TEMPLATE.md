# Configuration Template

This file contains placeholders for all configuration values needed to run the Photo Gallery app.

## Microsoft Entra ID Configuration

```typescript
// File: src/app/auth/auth-config.ts

export const msalConfig: Configuration = {
  auth: {
    clientId: 'YOUR_CLIENT_ID',           // Replace: Application (client) ID from Azure AD
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',  // Replace: YOUR_TENANT_ID
    redirectUri: '/',                      // Keep as '/' for production, or 'http://localhost:4200' for dev
    postLogoutRedirectUri: '/'
  },
  // ... rest of config remains the same
};
```

### Where to find these values:
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: Microsoft Entra ID → App registrations
3. Select your app registration
4. **Client ID**: Found on the "Overview" page as "Application (client) ID"
5. **Tenant ID**: Found on the "Overview" page as "Directory (tenant) ID"

## Azure Blob Storage Configuration

```typescript
// File: src/app/services/blob-storage.service.ts

export class BlobStorageService {
  private sasToken = 'YOUR_SAS_TOKEN';           // Replace: SAS token from Azure Storage
  private storageAccountName = 'YOUR_STORAGE_ACCOUNT_NAME';  // Replace: Storage account name
  private containerName = 'photos';              // Replace if using different container name
  
  // ... rest of service remains the same
}
```

### Where to find these values:
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Storage Account
3. **Storage Account Name**: Found on the "Overview" page
4. **SAS Token**: 
   - Go to "Shared access signature" under "Security + networking"
   - Configure permissions (Read, Write, Delete, List for Blob)
   - Click "Generate SAS and connection string"
   - Copy the entire SAS token (starts with `?sv=...`)
5. **Container Name**: The name of your blob container (default: `photos`)

## Environment Variables (Alternative - More Secure)

For production, instead of hardcoding values, use environment variables:

```typescript
// File: src/environments/environment.ts (Development)

export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: 'YOUR_DEV_CLIENT_ID',
      authority: 'https://login.microsoftonline.com/YOUR_DEV_TENANT_ID',
    }
  },
  azureStorage: {
    accountName: 'YOUR_DEV_STORAGE_ACCOUNT_NAME',
    sasToken: 'YOUR_DEV_SAS_TOKEN',
    containerName: 'photos'
  }
};
```

```typescript
// File: src/environments/environment.prod.ts (Production)

export const environment = {
  production: true,
  msalConfig: {
    auth: {
      clientId: 'YOUR_PROD_CLIENT_ID',
      authority: 'https://login.microsoftonline.com/YOUR_PROD_TENANT_ID',
    }
  },
  azureStorage: {
    accountName: 'YOUR_PROD_STORAGE_ACCOUNT_NAME',
    sasToken: 'YOUR_PROD_SAS_TOKEN',
    containerName: 'photos'
  }
};
```

## Configuration Checklist

Use this checklist to ensure all values are configured:

- [ ] Microsoft Entra ID App registered
- [ ] Client ID copied to `auth-config.ts`
- [ ] Tenant ID copied to `auth-config.ts`
- [ ] Redirect URIs configured in Azure AD app
  - [ ] Development: `http://localhost:4200`
  - [ ] Production: Your Azure Static Web App URL
- [ ] Azure Storage Account created
- [ ] Blob container created (name: `photos`)
- [ ] CORS configured for Storage Account
- [ ] SAS token generated with appropriate permissions
- [ ] Storage Account Name copied to `blob-storage.service.ts`
- [ ] SAS Token copied to `blob-storage.service.ts`
- [ ] Container name matches in code and Azure

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit sensitive values to Git**
   - Add files with sensitive data to `.gitignore`
   - Use environment variables or Azure Key Vault in production

2. **Rotate credentials regularly**
   - SAS tokens should be rotated every 90 days
   - Set expiration dates when generating SAS tokens

3. **Use minimal permissions**
   - Only grant necessary permissions in SAS tokens
   - Use different tokens for development and production

4. **Protect your repository**
   - Make repository private if it contains any sensitive data
   - Review all commits before pushing

## Testing Your Configuration

After configuring, test each component:

### 1. Test Authentication
```bash
npm start
# Navigate to http://localhost:4200
# Click "Sign in with Microsoft"
# Verify successful login
```

### 2. Test Upload
```bash
# After logging in:
# Click "Upload" button
# Select a test image
# Verify upload progress shows
# Check Azure Storage container for uploaded file
```

### 3. Test Gallery Display
```bash
# Verify uploaded photos appear in gallery
# Click on a photo to open viewer
# Test favorite, tag, and download features
```

## Common Configuration Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "MSAL error" during login | Wrong Client ID or Tenant ID | Double-check values match Azure AD app |
| "Redirect URI mismatch" | URI not registered | Add URI to Azure AD app registrations |
| "CORS error" during upload | CORS not configured | Add origin to Storage Account CORS settings |
| "401 Unauthorized" upload | Invalid SAS token | Generate new SAS token with correct permissions |
| "404 Not Found" upload | Wrong container name | Verify container exists and name matches |
| Photos don't display | Wrong Storage Account Name | Check storage account name is correct |

## Getting Help

If you encounter issues:

1. Check browser console for detailed error messages
2. Verify all configuration values are correct
3. Review the [Setup Guide](../SETUP-GUIDE.md) for detailed instructions
4. Check [Troubleshooting section](README-PhotoGallery.md#troubleshooting) in README

## Additional Resources

- [Azure Portal](https://portal.azure.com)
- [Microsoft Entra ID Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- [Azure Blob Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
