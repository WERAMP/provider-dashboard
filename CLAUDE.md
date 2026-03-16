# CLAUDE.md — provider-dashboard

## Architecture Overview

This app is deployed to **Cloudflare Pages** (`provider-dashboard.pages.dev`) and served through the **`amp-router` Cloudflare Worker** at `ampintelligence.ai`.

It is **not** accessed via a custom subdomain. All traffic is routed through the Worker.

---

## URL Scheme

```
ampintelligence.ai/:location/provider           → this app (location home)
ampintelligence.ai/:location/provider/:provider → individual provider view (future)
ampintelligence.ai/:location                    → PM dashboard (separate app, do not touch)
```

Examples:
- `ampintelligence.ai/flatiron/provider` → Flatiron provider dashboard
- `ampintelligence.ai/bethesda/provider` → Bethesda provider dashboard
- `ampintelligence.ai/flatiron/provider/bianca` → Bianca's view at Flatiron (when implemented)

---

## Worker Routing (amp-router)

The Worker at `/Users/ramarionsallee/Downloads/amp-router-worker.js` handles two routes for this app:

```js
// 1. Assets — must come BEFORE the PM dashboard fallback
if (url.pathname.startsWith('/provider-assets/')) {
  const target = new URL(request.url);
  target.hostname = 'provider-dashboard.pages.dev';
  return fetch(target.toString(), request);
}

// 2. /:location/provider* → provider dashboard
const parts = url.pathname.split('/').filter(Boolean);
if (parts.length >= 2 && parts[1] === 'provider') {
  const target = new URL(request.url);
  target.hostname = 'provider-dashboard.pages.dev';
  target.pathname = '/' + parts.slice(2).join('/') || '/';
  return fetch(target.toString(), request);
}
```

**Important:** The Worker strips the `/:location/provider` prefix before forwarding to Pages. The app never sees the location or `/provider` in the path — it only sees what comes after.

---

## Why `assetsDir: "provider-assets"`

Vite is configured with `assetsDir: "provider-assets"` so built assets land at `/provider-assets/main.js` instead of `/assets/main.js`.

**Do not change this.** The PM dashboard also uses `/assets/*`. Without a unique assetsDir, the Worker cannot distinguish provider dashboard asset requests from PM dashboard asset requests — both apps would break.

---

## Why the Dynamic Basename

`main.jsx` reads `window.location.pathname` before mounting React to derive the BrowserRouter `basename`:

```js
const parts = window.location.pathname.split('/').filter(Boolean)
const locationSlug = parts[0] || 'flatiron'
const basename = `/${locationSlug}/provider`
```

This is necessary because the location slug (`flatiron`, `bethesda`, etc.) is dynamic. React Router needs the correct basename to resolve routes relative to the mount point — without it, navigation within the app would produce broken URLs.

---

## Adding a New Location

No code changes needed. The Worker and the dynamic basename handle all locations automatically. Just ensure:
1. The location slug matches what the PM dashboard uses (lowercase, no spaces)
2. The hub directory at `ampintelligence.ai/` links to the new `/:location/provider` URL

---

## Adding Per-Provider Routes

When ready to implement per-provider views, add routes in `main.jsx`:

```jsx
<Route path="/:provider" element={<ProviderDashboard />} />
```

The `:provider` param will be available via `useParams()` in `ProviderDashboard`. The URL will be `ampintelligence.ai/flatiron/provider/bianca`.

No Worker changes needed.

---

## Auth

All routes under `ampintelligence.ai/*` are protected by **Cloudflare Access** (Microsoft SSO). This app inherits that protection automatically — no additional Access application is needed and none should be created.

Do not add a custom domain directly to this Pages project. Doing so would bypass the Worker and the Access auth layer.

---

## Build & Deploy

```
npm run build        # outputs to dist/
```

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18 (`NODE_VERSION=18` in Pages env vars)
- Branch: `main` (auto-deploys on push)

Cloudflare Pages deployment is at `provider-dashboard.pages.dev`. Do not configure a custom domain in the Pages project settings.
