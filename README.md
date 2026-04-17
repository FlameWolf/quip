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
- **Bootstrap** (^5.3.8) + **Bootstrap Icons** (^1.13.1) — UI framework and icons
- **@popperjs/core** (^2.11.8) — dropdown/tooltip positioning for Bootstrap
- **@floating-ui/dom** (^1.7.6) — floating element positioning
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
│   │   ├── Auth.jsx                  # Auth layout (sign-in / sign-up shell)
│   │   ├── SignIn.jsx                # Sign-in form
│   │   ├── SignUp.jsx                # Sign-up form
│   │   ├── Home.jsx                  # Timeline + composer
│   │   ├── Search.jsx                # Search results
│   │   ├── Post.jsx                  # Single post view
│   │   ├── Thread.jsx                # Threaded conversation view
│   │   ├── Profile.jsx               # User profile shell (tabs)
│   │   ├── Quips.jsx                 # A user's posts list
│   │   ├── Interactions.jsx          # Favourites / mentions list
│   │   ├── Follows.jsx               # Followers / following list
│   │   ├── Editor.jsx                # Rich post composer (with emoji picker)
│   │   ├── QuotePost.jsx             # Quote-post composer
│   │   ├── DisplayPost.jsx           # Full post renderer
│   │   ├── DisplayPostMinimal.jsx    # Compact post renderer (e.g. in threads)
│   │   ├── DisplayPostList.jsx       # Paginated list of posts
│   │   ├── DisplayPoll.jsx           # Poll renderer / voting UI
│   │   └── NotFound.jsx              # 404 page
│   ├── stores/                       # SolidJS reactive stores
│   │   ├── auth-store.jsx            # Authenticated user + token state
│   │   ├── theme-store.jsx           # Light/dark theme state
│   │   ├── error-store.jsx           # Global error/alert message
│   │   └── quip-store.jsx            # Cached timeline posts
│   ├── certificates/                 # Local HTTPS dev certs (key.pem, cert.pem)
│   ├── assets/                       # favicon, images, static files
│   ├── App.jsx                       # Root layout: navbar, theme toggle, alert, auth wiring
│   ├── index.jsx                     # Entry point: router + API health check
│   ├── index.css                     # Global styles
│   ├── library.jsx                   # Shared utilities (text, dates, cookies, emoji)
│   └── secure-fetch.jsx              # Auth-aware fetch wrapper with token refresh
├── public/
│   └── auth-worker.js                # Service worker for secure token storage + request interception
├── index.html                        # HTML entry point; registers the service worker
├── firebase.json                     # Firebase Hosting config (SPA rewrite to index.html)
├── vite.config.js                    # Vite + Solid config, HTTPS dev server
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

4. **HTTPS certificates** — the dev server expects `src/certificates/key.pem` and `src/certificates/cert.pem` (see [vite.config.js](vite.config.js)). Generate self-signed certs if they aren't present; the config uses a passphrase of `Pass@123`.

### Scripts

| Command          | Purpose                                                  |
| ---------------- | -------------------------------------------------------- |
| `npm run dev`    | Start the Vite dev server on `https://localhost:3000`    |
| `npm start`      | Alias for `npm run dev`                                  |
| `npm run build`  | Produce a production build in `dist/`                    |
| `npm run serve`  | Preview the production build locally                     |
| `npm run deploy` | Build and deploy to Firebase Hosting (`firebase deploy`) |

## Routing

Routes are defined in [src/index.jsx](src/index.jsx):

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

Quip's authentication flow is built around the service worker at [public/auth-worker.js](public/auth-worker.js):

- The SW intercepts all `fetch` calls. Requests to `VITE_API_BASE_URL` get the current bearer token injected; requests to the auth base URL populate the auth cache from the response.
- Auth data (user id, handle, token, `createdAt`, `expiresIn`) is persisted in a `Cache` named by `VITE_AUTH_CACHE_NAME`, so it survives reloads without touching `localStorage`.
- Before each API call, the SW validates the token and calls `/auth/refresh-token` when it's expired, then broadcasts the new state over `BroadcastChannel` (`VITE_AUTH_CHANNEL_NAME`).
- The main app subscribes to that channel in [src/App.jsx](src/App.jsx) and mirrors the state into `authStore`. This also synchronises sign-in / sign-out across tabs.
- [src/secure-fetch.jsx](src/secure-fetch.jsx) offers an in-page fallback for auth-aware requests when the service worker is not in control.

## Utilities (`library.jsx`)

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