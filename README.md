# Quip

A modern, responsive social network frontend built with [SolidJS](https://solidjs.com), inspired by Twitter. Quip provides a lightweight, performant user interface for social interaction, featuring posts, timelines, user profiles, search, threaded conversations, polls, and more.

## Overview

Quip is a single-page application (SPA) that consumes the [Quip API v2](https://github.com/FlameWolf/quip-api-v2) backend. It offers users a beautiful and intuitive interface to create posts, follow other users, manage timelines, interact with content, and discover new conversations.

## Features

- **User Authentication**: Sign-up and sign-in with JWT-based authentication, managed through a service worker
- **Posts & Timeline**: Create, edit, delete, and interact with posts; paginated timeline with "load more"
- **Rich Post Types**: Plain posts, replies, quote posts, and polls
- **Social Interactions**: Follow/unfollow users, favourite posts, repeat posts, reply and quote
- **User Profiles**: View profiles with tabs for posts, followers, following, favourites, and mentions
- **Threaded View**: Dedicated thread view to follow conversations
- **Search**: Full-text search across posts and users
- **Responsive Design**: Mobile-first layout powered by Bootstrap 5
- **Dark Mode**: Light/dark theme toggle persisted to `localStorage`, honouring the system preference on first load
- **Emoji Support**: Rich emoji picker (Picmo + Emoji Mart) with a curated list of popular emoji
- **API Health Check**: Startup ping to the API (with a 5-second timeout) that surfaces a friendly message when the backend is cold-starting
- **Service Worker Auth**: Authentication tokens and refresh logic are handled inside a service worker; the UI communicates with it over `BroadcastChannel` for cross-tab synchronisation

## Tech Stack

- **SolidJS** (^1.9.11) — reactive UI framework
- **@solidjs/router** (^0.15.4) — client-side routing
- **Vite** (^7.3.1) — build tool and dev server
- **vite-plugin-solid** (^2.11.10) — Solid JSX support for Vite
- **solid-bootstrap** (^1.0.21) — SolidJS Bootstrap 5 components (dropdowns, overlays, modals) with no dependency on bootstrap.js or jQuery
- **Bootstrap** (^5.3.8) + **Bootstrap Icons** (^1.13.1) — Bootstrap is retained for its stylesheet only; Bootstrap Icons for icons
- **@floating-ui/dom** (^1.7.6) — floating element positioning (emoji picker)
- **solid-icons** (^1.2.0) — icon components for SolidJS
- **emoji-mart** (^5.6.0) + **@emoji-mart/data** (^1.2.1) + **picmo** (^5.8.5) — emoji picker stack
- **node-emoji** (^2.2.0) — emoji shortcode lookup
- **caret-pos** (^2.0.0) — caret positioning inside contenteditable editors
- **inter-ui** (^4.1.1) — Inter typeface

## Project Structure

```text
quip/
├── src/
│   ├── components/
│   │   ├── Auth.tsx                  # Auth layout (sign-in / sign-up shell)
│   │   ├── SignIn.tsx                # Sign-in form
│   │   ├── SignUp.tsx                # Sign-up form
│   │   ├── Home.tsx                  # Timeline + composer
│   │   ├── Search.tsx                # Search results
│   │   ├── Post.tsx                  # Single post view
│   │   ├── Thread.tsx                # Threaded conversation view
│   │   ├── Profile.tsx               # User profile shell (tabs)
│   │   ├── Quips.tsx                 # A user's posts list
│   │   ├── Interactions.tsx          # Favourites / mentions list
│   │   ├── Follows.tsx               # Followers / following list
│   │   ├── Editor.tsx                # Rich post composer (with emoji picker)
│   │   ├── QuotePost.tsx             # Quote-post composer
│   │   ├── DisplayPost.tsx           # Full post renderer
│   │   ├── DisplayPostMinimal.tsx    # Compact post renderer (e.g. in threads)
│   │   ├── DisplayPostList.tsx       # Recursive list of posts + replies
│   │   ├── DisplayPoll.tsx           # Poll renderer / voting UI
│   │   ├── Common.tsx                # Shared Spinner / EmptyState / LoadMore primitives
│   │   └── NotFound.tsx              # 404 page
│   ├── hooks/
│   │   └── createInfiniteList.ts     # Paginated createResource + Suspense list primitive
│   ├── stores/                       # SolidJS reactive stores
│   │   ├── auth-store.ts             # Authenticated user + token state
│   │   ├── theme-store.ts            # Light/dark theme state
│   │   ├── error-store.ts            # Global error/alert message
│   │   └── quip-store.ts             # Cached timeline posts
│   ├── types/                        # Shared TypeScript types + per-component prop types
│   ├── certificates/                 # Local HTTPS dev certs (key.pem, cert.pem)
│   ├── assets/                       # favicon, images, static files
│   ├── App.tsx                       # Root layout: navbar, theme toggle, alert, auth wiring
│   ├── index.tsx                     # Entry point: router + API health check
│   ├── index.css                     # Global styles
│   └── library.ts                    # Shared utilities (text, dates, cookies, emoji, escaping)
├── public/
│   └── pwa-worker.js                 # Service worker: token storage, request interception, caching
├── index.html                        # HTML entry point; registers the service worker
├── firebase.json                     # Firebase Hosting config (SPA rewrite to index.html)
├── vite.config.ts                    # Vite + Solid config, HTTPS dev server
├── environment.config                # Template for required environment variables
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended for Vite 7)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/FlameWolf/quip.git
    cd quip
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Configure environment variables** — copy `environment.config` to `.env.local` and fill in:

    ```env
    VITE_API_BASE_URL=http://localhost:3072          # Quip API base URL
    VITE_AUTH_CACHE_NAME=quip-auth-cache             # Cache name the SW uses to persist auth state
    VITE_AUTH_CHANNEL_NAME=quip-auth-channel         # BroadcastChannel name for auth sync
    VITE_SET_AUTH_DATA_ACTION=set-auth-data          # Action name the SW expects for writing auth
    VITE_GET_AUTH_DATA_ACTION=get-auth-data          # Action name the SW expects for reading auth
    ```

4. **HTTPS certificates** — the dev server expects `src/certificates/key.pem` and `src/certificates/cert.pem` (see [vite.config.ts](vite.config.ts)). Generate self-signed certs if they aren't present; the config uses a passphrase of `Pass@123`.

### Scripts

| Command          | Purpose                                                  |
| ---------------- | -------------------------------------------------------- |
| `npm run dev`    | Start the Vite dev server on `https://localhost:3000`    |
| `npm start`      | Alias for `npm run dev`                                  |
| `npm run build`  | Produce a production build in `dist/`                    |
| `npm run serve`  | Preview the production build locally                     |
| `npm run deploy` | Build and deploy to Firebase Hosting (`firebase deploy`) |

## Routing

Routes are defined in [src/index.tsx](src/index.tsx):

| Path                                       | Component           |
| ------------------------------------------ | ------------------- |
| `/`, `/home`                               | `Home`              |
| `/auth`                                    | `Auth` layout       |
| `/auth/sign-in`, `/auth/sign-up`           | `SignIn` / `SignUp` |
| `/search`                                  | `Search`            |
| `/post/:postId`                            | `Post`              |
| `/thread/:postId`                          | `Thread`            |
| `/:handle`                                 | `Profile` layout    |
| `/:handle/posts`                           | `Quips`             |
| `/:handle/following`, `/:handle/followers` | `Follows`           |
| `/:handle/favourites`, `/:handle/mentions` | `Interactions`      |
| `/*404`                                    | `NotFound`          |

Home (`/` and `/home`) requires authentication; unauthenticated visits are redirected to `/auth`.

## Authentication Architecture

Quip's authentication flow is built around the service worker at [public/pwa-worker.js](public/pwa-worker.js):

- The SW intercepts `fetch` calls. Requests to `VITE_API_BASE_URL` get the current bearer token injected; requests to the auth base URL populate the auth cache from the response. Other requests fall through to its cache strategies (cache-first for hashed build assets, stale-while-revalidate for other assets, network-first for navigations).
- Auth data (user id, handle, token, `createdAt`, `expiresIn`) is persisted in a `Cache` named by `VITE_AUTH_CACHE_NAME`, so it survives reloads without touching `localStorage`.
- Before each API call, the SW validates the token and calls `/auth/refresh-token` when it's expired, then broadcasts the new state over `BroadcastChannel` (`VITE_AUTH_CHANNEL_NAME`).
- The main app subscribes to that channel in [src/App.tsx](src/App.tsx) and mirrors the state into `authStore`. This also synchronises sign-in / sign-out across tabs. The env/auth seed is delivered to the worker via `navigator.serviceWorker.ready` so it is not lost on the first (uncontrolled) load.

## Utilities (`library.ts`)

Shared helpers used throughout the app:

- **Constants**: `emptyString`, `lightTheme`, `darkTheme`, `maxContentLength` (256), `maxItemsToFetch` (20)
- **Validation**: `handleRegExp`, `passwordRegExp`, `invalidHandles` (reserved handle list)
- **Content length**: `contentLengthRegExp`, `getGraphemeClusterCount`, `trimPost` (truncates after 20 grapheme clusters)
- **Text / DOM**: `innerHtmlAsText`, `removeFormatting`, `removeDescendantAttributes`, `insertTextAtCaret`, `insertEmojo`
- **Cookies**: `setCookie`, `getCookie`
- **Dates**: `toShortDateString`, `toLongDateString`, `formatTimeAgo`
- **Emoji**: `popularEmoji` (curated list via `node-emoji`)
- **Errors**: `getErrorMessage` (JSON- or text-aware response parser)

## Build Configuration

- **Target**: `esnext` (no dynamic-import polyfill)
- **Plugin**: `vite-plugin-solid` for Solid's JSX and fine-grained reactivity
- **Dev server**: HTTPS on port `3000` (overridable via the `PORT` env var)

## Deployment

The `dist/` output from `npm run build` is a static bundle and can be deployed to any static host:

- **Firebase Hosting** — `firebase.json` is pre-configured with an SPA rewrite (`**` → `/index.html`); run `npm run deploy`.
- Netlify, Vercel, GitHub Pages, AWS S3, or any other static host will work equivalently.

## Related Projects

- **[Quip API v2](https://github.com/FlameWolf/quip-api-v2)** — backend API consumed by this frontend

## Resources

- [SolidJS Documentation](https://solidjs.com)
- [SolidJS Router](https://github.com/solidjs/solid-router)
- [Vite Documentation](https://vitejs.dev)
- [Bootstrap Documentation](https://getbootstrap.com)

## License

MIT

---

Built with :heart: by FlameWolf