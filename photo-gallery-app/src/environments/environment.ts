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
