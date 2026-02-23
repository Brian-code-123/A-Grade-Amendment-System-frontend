import { PublicClientApplication, LogLevel } from '@azure/msal-browser'

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: import.meta.env.VITE_AZURE_AUTHORITY || 'https://login.microsoftonline.com/organizations',
    redirectUri: window.location.origin + '/auth/callback',
    postLogoutRedirectUri: window.location.origin + '/login'
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message) => {
        if (level === LogLevel.Error) console.error('[MSAL]', message)
      }
    }
  }
}

const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email']
}

let msalInstance = null

export function getMsalInstance() {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig)
  }
  return msalInstance
}

export { loginRequest }
