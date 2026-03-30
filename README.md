# A Grade Amendment System - Frontend

Vue3 frontend for A Grade Amendment System.

## Production API

Choose the API mode based on where frontend is deployed:

- Azure Static Web Apps: set `VITE_API_BASE_URL` in `.env.production` to your backend App Service URL (for example `https://your-api.azurewebsites.net`).
- Single Azure App Service (frontend + backend together): keep `VITE_API_BASE_URL` empty to use same-origin `/api`.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```


## Backend Connection

The frontend connects to the backend API at `http://localhost:3000`.
